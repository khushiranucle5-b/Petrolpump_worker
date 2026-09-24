/**
 * Camera and Device Permissions Handler
 */
import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable' | 'undetermined';

/**
 * Request camera permission across Android & iOS
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'PetrolPump Camera Permission',
          message: 'Worker app needs access to your camera to scan customer QR codes for fuel discounts.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn('Failed to request Android camera permission:', err);
      return false;
    }
  }

  // On iOS, permission is triggered upon camera view mount or native permissions prompt
  return true;
};

/**
 * Check if camera permission is already granted
 */
export const checkCameraPermission = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
    } catch (err) {
      console.warn('Failed to check Android camera permission:', err);
      return false;
    }
  }
  return true;
};

/**
 * Open Application Settings if permission was permanently blocked
 */
export const openAppSettings = () => {
  Linking.openSettings().catch(() => {
    Alert.alert('Unable to open settings', 'Please open system settings manually to grant camera access.');
  });
};
