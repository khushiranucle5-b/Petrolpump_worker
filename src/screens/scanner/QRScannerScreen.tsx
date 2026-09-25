/**
 * Camera QR Scanner Screen
 * Live camera preview with high-precision barcode/QR code reader.
 * Validates dynamic 60-second rotating customer tokens against server.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Easing,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Camera, CameraType } from 'react-native-camera-kit';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { QRService } from '../../services/qr/qrService';
import { QRErrorDetails } from '../../types/qr';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';
import { CameraPermissionView } from '../../components/scanner/CameraPermissionView';
import { checkCameraPermission, requestCameraPermission } from '../../utils/permissions';
import { RootStackParamList } from '../../types/navigation';

const { width } = Dimensions.get('window');
const SCAN_FRAME_SIZE = Math.min(width * 0.72, 280);

export const QRScannerScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const isFocused = useIsFocused();
  const { user } = useAuth();

  // Permission states
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [flashOn, setFlashOn] = useState<boolean>(false);

  // Validation states
  const [validating, setValidating] = useState<boolean>(false);
  const [errorDetails, setErrorDetails] = useState<QRErrorDetails | null>(null);
  const isScanningLocked = useRef<boolean>(false);

  // Scanning laser animation
  const laserAnim = useRef(new Animated.Value(0)).current;

  const verifyPerms = useCallback(async () => {
    const granted = await checkCameraPermission();
    setHasPermission(granted);
    if (!granted) {
      const requested = await requestCameraPermission();
      setHasPermission(requested);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      verifyPerms();
    }
  }, [isFocused, verifyPerms]);

  useEffect(() => {
    // Start scanner laser loop
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(laserAnim, {
          toValue: SCAN_FRAME_SIZE - 6,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(laserAnim, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();

    return () => animation.stop();
  }, [laserAnim]);

  const handleRequestPermission = async () => {
    const granted = await requestCameraPermission();
    setHasPermission(granted);
  };

  /**
   * Process scanned QR Token
   */
  const handleProcessQRToken = async (tokenString: string) => {
    if (!tokenString || validating || isScanningLocked.current) return;

    isScanningLocked.current = true;
    setValidating(true);
    setErrorDetails(null);

    try {
      const response = await QRService.validateQRToken({
        qrToken: tokenString.trim(),
        workerId: user?.workerId || 'EMP-7842',
        petrolPumpId: user?.petrolPumpId || 'pp-01',
        scannedAt: new Date().toISOString(),
      });

      if (response.valid && response.customer) {
        // Successfully verified by backend! Route to Customer Details screen
        navigation.navigate('CustomerDetails', {
          customer: response.customer,
          qrSessionId: response.qrSessionId,
          discountPercentage: response.discountPercentage,
        });
      }
    } catch (err: any) {
      setErrorDetails({
        code: err.code || 'SERVER_ERROR',
        title: err.title || 'Verification Error',
        message: err.message || 'Failed to validate QR code. Please try again.',
        canRetry: err.canRetry !== false,
      });
    } finally {
      setValidating(false);
      // Unlock scanner after a short pause if error modal was closed
      setTimeout(() => {
        isScanningLocked.current = false;
      }, 1000);
    }
  };

  // If permission is denied or undetermined
  if (hasPermission === false) {
    return (
      <CameraPermissionView
        onRequestPermission={handleRequestPermission}
      />
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryDark} />

      {/* Live Camera View (Active when focused & permitted) */}
      {isFocused && hasPermission && (
        <Camera
          style={StyleSheet.absoluteFill}
          cameraType={CameraType.Back}
          scanBarcode={!validating && !errorDetails}
          onReadCode={(event: any) => {
            const code = event?.nativeEvent?.codeStringValue;
            if (code) {
              handleProcessQRToken(code);
            }
          }}
          torchMode={flashOn ? 'on' : 'off'}
          showFrame={false}
        />
      )}

      {/* Dark Translucent Framing Overlay */}
      <View style={styles.overlayContainer} pointerEvents="box-none">
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Icon name="arrow-left" size={22} color={colors.textInverse} />
          </TouchableOpacity>

          <View style={styles.headerTitleBox}>
            <Text style={[typography.h3, styles.headerTitle]}>Scan QR</Text>
           
          </View>

          <TouchableOpacity
            onPress={() => setFlashOn(!flashOn)}
            style={[styles.headerBtn, flashOn && styles.headerBtnActive]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Toggle flashlight"
          >
            <Icon
              name={flashOn ? 'flash-on' : 'flash-off'}
              size={20}
              color={flashOn ? colors.primaryDark : colors.textInverse}
            />
          </TouchableOpacity>
        </View>

        {/* Center Scanner Body & Guidance Frame */}
        <View style={styles.scannerBody} pointerEvents="box-none">
          {/* Instruction Pill */}
         

          {/* Viewfinder Frame with Glowing Corners */}
          <View
            style={[
              styles.reticleBox,
              { width: SCAN_FRAME_SIZE, height: SCAN_FRAME_SIZE },
            ]}
          >
            {/* Corner Borders */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Animated Laser Scanning Line */}
            <Animated.View
              style={[
                styles.laserLine,
                { transform: [{ translateY: laserAnim }] },
              ]}
            />
          </View>

         

          {/* Dummy Scan Button for testing */}
          <TouchableOpacity 
            style={{ marginTop: 24, padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}
            onPress={() => handleProcessQRToken('dummy-qr-token-123')}
          >
            <Text style={{ color: colors.textInverse, fontWeight: 'bold' }}>Simulate Scan (Test)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Validation Overlay */}
      {validating && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <View style={styles.loadingIconCircle}>
              <Icon name="shield-check" size={32} color={colors.accent} />
            </View>
            <Text style={[typography.h3, styles.loadingTitle]}>
              Verifying QR Token
            </Text>
            <Text style={[typography.bodySmall, styles.loadingSubtitle]}>
              Validating 60s signature & checking group discount on server...
            </Text>
          </View>
        </View>
      )}

      {/* Error Modal */}
      {errorDetails && (
        <Modal
          transparent
          visible={!!errorDetails}
          animationType="fade"
          onRequestClose={() => setErrorDetails(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.errorModalCard}>
              <View style={styles.errorIconCircle}>
                <Icon name="alert-circle" size={36} color={colors.danger} />
              </View>
              <Text style={[typography.h3, styles.errorModalTitle]}>
                {errorDetails.title}
              </Text>
              <Text style={[typography.bodyMedium, styles.errorModalMessage]}>
                {errorDetails.message}
              </Text>

              <View style={styles.modalBtnRow}>
                <Button
                  title="Dismiss"
                  onPress={() => setErrorDetails(null)}
                  variant="outline"
                  size="md"
                  style={{ flex: 1 }}
                  fullWidth={false}
                />
                {errorDetails.canRetry && (
                  <Button
                    title="Try Again"
                    onPress={() => setErrorDetails(null)}
                    variant="accent"
                    size="md"
                    leftIcon="refresh"
                    style={{ flex: 1 }}
                    fullWidth={false}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.textInverse,
  },
  headerSubtitle: {
    color: colors.accent,
    fontWeight: '700',
    marginTop: 2,
  },
  scannerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  instructionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.accentSubtle,
    ...shadows.md,
  },
  instructionText: {
    color: colors.textPrimary,
    marginLeft: spacing.xs,
    fontWeight: '600',
  },
  reticleBox: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: colors.accent,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: borderRadius.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: borderRadius.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: borderRadius.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: borderRadius.md,
  },
  laserLine: {
    position: 'absolute',
    top: 4,
    left: 8,
    right: 8,
    height: 3,
    backgroundColor: colors.accent,
    borderRadius: 2,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  timerNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xxl,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  timerNoticeText: {
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 18, 30, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
    ...shadows.lg,
  },
  loadingIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accentSubtle,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loadingTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  loadingSubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorModalCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    ...shadows.lg,
  },
  errorIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  errorModalTitle: {
    color: colors.dangerDark,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  errorModalMessage: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
});

export default QRScannerScreen;
