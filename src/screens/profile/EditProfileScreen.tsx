/**
 * Edit Profile Screen
 * Allows worker to update name, mobile, email, and photo.
 * Restricts modifications to admin-controlled fields (Worker ID, Role, Branch, Status).
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius, shadows } from '../../theme/spacing';
import { Header } from '../../components/common/Header';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { isValidEmail, isValidMobile } from '../../utils/validation';
import { RootStackParamList } from '../../types/navigation';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobileNumber || '');
  const [email, setEmail] = useState(user?.email || '');
  const [photoUri, setPhotoUri] = useState<string | null>(user?.profilePhotoUrl || null);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.5,
      includeBase64: true,
    });

    if (result.didCancel) return;
    
    if (result.errorCode) {
      Alert.alert('Error', result.errorMessage || 'Failed to pick image');
      return;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.base64) {
        setPhotoUri(`data:${asset.type || 'image/jpeg'};base64,${asset.base64}`);
      } else {
        setPhotoUri(asset.uri || null);
      }
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }

    if (!mobileNumber.trim()) {
      errs.mobileNumber = 'Mobile number is required';
    } else if (!isValidMobile(mobileNumber)) {
      errs.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!isValidEmail(email)) {
      errs.email = 'Please enter a valid email address';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await updateProfile({
        fullName: fullName.trim(),
        mobileNumber: mobileNumber.trim(),
        email: email.trim(),
        profilePhotoUrl: photoUri || undefined,
      });

      Alert.alert('Profile Updated', 'Your worker profile details have been saved successfully.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Header
        title="Edit Profile"
        showBack
        onBackPress={() => navigation.goBack()}
        variant="dark"
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Editable Fields Card */}
        <View style={styles.card}>
          <Text style={[typography.h4, styles.sectionTitle]}>
            Editable Contact Information
          </Text>

          <View style={styles.imagePickerContainer}>
            <TouchableOpacity onPress={handlePickImage} style={styles.imagePickerBtn}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.profileImage} />
              ) : (
                <View style={styles.placeholderImage}>
                  <Icon name="camera" size={32} color={colors.textMuted} />
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 4 }]}>Upload</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Input
            label="Full Name"
            placeholder="e.g. Vikram Singh"
            value={fullName}
            onChangeText={t => {
              setFullName(t);
              if (errors.fullName) setErrors({ ...errors, fullName: '' });
            }}
            error={errors.fullName}
            leftIcon="user"
            required
          />

          <Input
            label="Mobile Number"
            placeholder="e.g. 9876543210"
            value={mobileNumber}
            onChangeText={t => {
              setMobileNumber(t);
              if (errors.mobileNumber) setErrors({ ...errors, mobileNumber: '' });
            }}
            error={errors.mobileNumber}
            leftIcon="phone"
            keyboardType="phone-pad"
            maxLength={10}
            required
          />

          <Input
            label="Email Address"
            placeholder="e.g. worker@petrolpump.com"
            value={email}
            onChangeText={t => {
              setEmail(t);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            leftIcon="mail"
            autoCapitalize="none"
            keyboardType="email-address"
            required
          />

        </View>


        {/* Save Button */}
        <Button
          title="SAVE PROFILE CHANGES"
          onPress={handleSave}
          variant="accent"
          size="lg"
          loading={loading}
          style={styles.saveBtn}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  imagePickerContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  imagePickerBtn: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    marginTop: spacing.xs,
  },
});

export default EditProfileScreen;
