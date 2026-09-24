/**
 * Main Tab Navigator
 * Combines Home, Scan, and History with the custom bottom bar.
 * (Profile is accessible via the top-left worker avatar on the Home screen)
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../types/navigation';
import { BottomNavigation } from '../components/navigation/BottomNavigation';
import HomeScreen from '../screens/home/HomeScreen';
import QRScannerScreen from '../screens/scanner/QRScannerScreen';
import HistoryScreen from '../screens/history/HistoryScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={props => <BottomNavigation {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} />
      <Tab.Screen name="ScannerTab" component={QRScannerScreen} />
      <Tab.Screen name="HistoryTab" component={HistoryScreen} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
