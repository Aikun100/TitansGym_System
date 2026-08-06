import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';

import TrainerDashboard from '../screens/trainer/TrainerDashboard';
import TrainerClients from '../screens/trainer/TrainerClients';
import TrainerBookings from '../screens/trainer/TrainerBookings';
import TrainerProfile from '../screens/trainer/TrainerProfile';
import WorkoutPlans from '../screens/trainer/WorkoutPlans';
import TakeAttendance from '../screens/trainer/TakeAttendance';
import TrackProgress from '../screens/trainer/TrackProgress';
import ClientProfileScreen from '../screens/trainer/ClientProfileScreen';
import ExerciseLibrary from '../screens/shared/ExerciseLibrary';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';

const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();
const ClientsStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={TrainerDashboard} />
      <DashStack.Screen name="WorkoutPlans" component={WorkoutPlans} />
      <DashStack.Screen name="TakeAttendance" component={TakeAttendance} />
      <DashStack.Screen name="TrackProgress" component={TrackProgress} />
      <DashStack.Screen name="ExerciseLibrary" component={ExerciseLibrary} />
      <DashStack.Screen name="Notifications" component={NotificationsScreen} />
    </DashStack.Navigator>
  );
}

function ClientsStackNav() {
  return (
    <ClientsStack.Navigator screenOptions={{ headerShown: false }}>
      <ClientsStack.Screen name="ClientsHome" component={TrainerClients} />
      <ClientsStack.Screen name="ClientProfile" component={ClientProfileScreen} />
    </ClientsStack.Navigator>
  );
}

function BookingsStackNav() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingsHome" component={TrainerBookings} />
    </BookingsStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={TrainerProfile} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
    </ProfileStack.Navigator>
  );
}

export default function TrainerTabs() {
  const insets = useSafeAreaInsets();
  const basePadding = Platform.OS === 'ios' ? 20 : 8;
  const paddingBottom = Math.max(insets.bottom, basePadding);
  const tabBarHeight = 62 + paddingBottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.trainerAccent,
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
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Clients':
              iconName = focused ? 'people' : 'people-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
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
      <Tab.Screen name="Dashboard" component={DashboardStack} />
      <Tab.Screen name="Clients" component={ClientsStackNav} />
      <Tab.Screen name="Bookings" component={BookingsStackNav} />
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
    backgroundColor: COLORS.trainerAccent + '18',
  },
});
