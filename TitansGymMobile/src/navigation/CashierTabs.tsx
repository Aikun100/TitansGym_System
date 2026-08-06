import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';

import CashierDashboard from '../screens/cashier/CashierDashboard';
import CashierPOS from '../screens/cashier/CashierPOS';
import CashierTransactions from '../screens/cashier/CashierTransactions';
import CashierProfile from '../screens/cashier/CashierProfile';
import CashierScanner from '../screens/cashier/CashierScanner';
import EODReportScreen from '../screens/cashier/EODReportScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';

const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();
const POSStack = createNativeStackNavigator();
const TxnStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function DashboardStackNav() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={CashierDashboard} />
      <DashStack.Screen name="EODReport" component={EODReportScreen} />
    </DashStack.Navigator>
  );
}

function POSStackNav() {
  return (
    <POSStack.Navigator screenOptions={{ headerShown: false }}>
      <POSStack.Screen name="POSHome" component={CashierPOS} />
      <POSStack.Screen
        name="Scanner"
        component={CashierScanner}
        options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
      />
    </POSStack.Navigator>
  );
}

function TransactionsStackNav() {
  return (
    <TxnStack.Navigator screenOptions={{ headerShown: false }}>
      <TxnStack.Screen name="TransactionsHome" component={CashierTransactions} />
    </TxnStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={CashierProfile} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
    </ProfileStack.Navigator>
  );
}

export default function CashierTabs() {
  const insets = useSafeAreaInsets();
  const basePadding = Platform.OS === 'ios' ? 20 : 8;
  const paddingBottom = Math.max(insets.bottom, basePadding);
  const tabBarHeight = 62 + paddingBottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#22C55E',
        tabBarInactiveTintColor: COLORS.textTertiary,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
        },
        tabBarStyle: {
          backgroundColor: COLORS.backgroundSecondary,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
          height: tabBarHeight,
          paddingTop: 8,
          paddingBottom: paddingBottom,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'grid' : 'grid-outline';
              break;
            case 'POS':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Transactions':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return (
            <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
              <Ionicons name={iconName} size={22} color={color} />
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStackNav} />
      <Tab.Screen name="POS" component={POSStackNav} />
      <Tab.Screen name="Transactions" component={TransactionsStackNav} />
      <Tab.Screen name="Profile" component={ProfileStackNav} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: '#22C55E18',
  },
});
