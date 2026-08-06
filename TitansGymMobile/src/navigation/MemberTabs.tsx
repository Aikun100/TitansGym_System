import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../constants/theme';

import MemberDashboard from '../screens/member/MemberDashboard';
import MemberBookings from '../screens/member/MemberBookings';
import MemberProgress from '../screens/member/MemberProgress';
import MemberProfile from '../screens/member/MemberProfile';
import WorkoutScreen from '../screens/member/WorkoutScreen';
import ActiveWorkoutScreen from '../screens/member/ActiveWorkoutScreen';
import MemberShop from '../screens/member/MemberShop';
import ChallengeDetailScreen from '../screens/member/ChallengeDetailScreen';
import ExerciseLibrary from '../screens/shared/ExerciseLibrary';
import MealPlan from '../screens/member/MealPlan';
import Supplements from '../screens/member/Supplements';
import PaymentHistory from '../screens/member/PaymentHistory';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import UpgradeMembership from '../screens/member/UpgradeMembership';
import CommunityFriendsScreen from '../screens/member/CommunityFriendsScreen';
import CommunityMessagesScreen from '../screens/member/CommunityMessagesScreen';
import PublicProfileScreen from '../screens/member/PublicProfileScreen';

const Tab = createBottomTabNavigator();
const DashStack = createNativeStackNavigator();
const WorkoutStack = createNativeStackNavigator();
const BookingsStack = createNativeStackNavigator();
const ProgressStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardHome" component={MemberDashboard} />
      <DashStack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <DashStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
      <DashStack.Screen name="ExerciseLibrary" component={ExerciseLibrary} />
      <DashStack.Screen name="MealPlan" component={MealPlan} />
      <DashStack.Screen name="Supplements" component={Supplements} />
      <DashStack.Screen name="PaymentHistory" component={PaymentHistory} />
      <DashStack.Screen name="Notifications" component={NotificationsScreen} />
      <DashStack.Screen name="MemberShop" component={MemberShop} />
    </DashStack.Navigator>
  );
}

function WorkoutStackNav() {
  return (
    <WorkoutStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkoutStack.Screen name="WorkoutHome" component={WorkoutScreen} />
      <WorkoutStack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
    </WorkoutStack.Navigator>
  );
}

function BookingsStackNav() {
  return (
    <BookingsStack.Navigator screenOptions={{ headerShown: false }}>
      <BookingsStack.Screen name="BookingsHome" component={MemberBookings} />
    </BookingsStack.Navigator>
  );
}

function ProgressStackNav() {
  return (
    <ProgressStack.Navigator screenOptions={{ headerShown: false }}>
      <ProgressStack.Screen name="ProgressHome" component={MemberProgress} />
    </ProgressStack.Navigator>
  );
}

function ProfileStackNav() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={MemberProfile} />
      <ProfileStack.Screen name="Settings" component={SettingsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="UpgradeMembership" component={UpgradeMembership} />
      <ProfileStack.Screen name="CommunityFriends" component={CommunityFriendsScreen} />
      <ProfileStack.Screen name="CommunityMessages" component={CommunityMessagesScreen} />
      <ProfileStack.Screen name="PublicProfile" component={PublicProfileScreen} />
    </ProfileStack.Navigator>
  );
}

export default function MemberTabs() {
  const insets = useSafeAreaInsets();
  const basePadding = Platform.OS === 'ios' ? 20 : 8;
  const paddingBottom = Math.max(insets.bottom, basePadding);
  const tabBarHeight = 62 + paddingBottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
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
            case 'Workout':
              iconName = focused ? 'barbell' : 'barbell-outline';
              break;
            case 'Bookings':
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case 'Progress':
              iconName = focused ? 'trending-up' : 'trending-up-outline';
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
      <Tab.Screen name="Workout" component={WorkoutStackNav} />
      <Tab.Screen name="Bookings" component={BookingsStackNav} />
      <Tab.Screen name="Progress" component={ProgressStackNav} />
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
    backgroundColor: COLORS.primary + '18',
  },
});
