/**
 * Root Stack Navigator
 * Manages Auth Stack, Main Tabs, QR Scanner flow, History Details & Profile subflows.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { useAuth } from '../context/AuthContext';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import PendingApprovalScreen from '../screens/auth/PendingApprovalScreen';
import QRScannerScreen from '../screens/scanner/QRScannerScreen';
import CustomerDetailsScreen from '../screens/scanner/CustomerDetailsScreen';
import FuelAmountScreen from '../screens/scanner/FuelAmountScreen';
import RedemptionConfirmationScreen from '../screens/scanner/RedemptionConfirmationScreen';
import RedemptionSuccessScreen from '../screens/scanner/RedemptionSuccessScreen';
import TransactionDetailsScreen from '../screens/history/TransactionDetailsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import ChangePasswordScreen from '../screens/profile/ChangePasswordScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const { isLoading, isAuthenticated, isPendingApproval, user } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {isLoading ? (
          <Stack.Screen name="Auth" component={SplashScreen} />
        ) : !isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : isPendingApproval ? (
          <Stack.Screen
            name="PendingApproval"
            component={PendingApprovalScreen}
            initialParams={{
              workerName: user?.fullName,
              workerId: user?.workerId,
            }}
          />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            
            {/* Scanner & Redemption Flow */}
            <Stack.Screen
              name="QRScanner"
              component={QRScannerScreen}
              options={{ animation: 'fade_from_bottom' }}
            />
            <Stack.Screen
              name="CustomerDetails"
              component={CustomerDetailsScreen}
            />
            <Stack.Screen
              name="FuelAmount"
              component={FuelAmountScreen}
            />
            <Stack.Screen
              name="RedemptionConfirmation"
              component={RedemptionConfirmationScreen}
            />
            <Stack.Screen
              name="RedemptionSuccess"
              component={RedemptionSuccessScreen}
              options={{ gestureEnabled: false }}
            />

            {/* History Details */}
            <Stack.Screen
              name="TransactionDetails"
              component={TransactionDetailsScreen}
            />

            {/* Profile Flows */}
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
            />
            <Stack.Screen
              name="ChangePassword"
              component={ChangePasswordScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
