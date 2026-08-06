import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Dimensions, Alert, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/StatCard';
import BookingCard from '../../components/BookingCard';
import SectionHeader from '../../components/SectionHeader';
import WorkoutCard from '../../components/WorkoutCard';


const { width } = Dimensions.get('window');

export default function MemberDashboard() {
  const navigation = useNavigation<any>();
  const { user, bookings, workoutPlans, toggleWorkoutExecuted, notifications, unreadCount, markAllNotificationsRead, refreshDashboard, refreshBookings, dashboardStats } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const memberBookings = bookings.filter(b => b.status !== 'cancelled');
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning ☀️';
    if (h < 17) return 'Good Afternoon 💪';
    return 'Good Evening 🌙';
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
      await refreshBookings();
    } catch (e) { /* ignore */ }
    setRefreshing(false);
  };

  const totalDays = 90;
  const daysRemaining = user?.membershipDaysRemaining || 49;
  const progress = Math.min(daysRemaining / totalDays, 1);

  const handleNotifications = () => {
    navigation.navigate('Notifications');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}
      >
        {/* Header */}
        <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Member'}</Text>
            </View>
            <TouchableOpacity style={styles.notifButton} onPress={handleNotifications}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              {unreadCount > 0 && (
                <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>
              )}
            </TouchableOpacity>
          </View>

          {/* Membership Card */}
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.membershipCard}>
            <View style={styles.membershipTop}>
              <View>
                <Text style={styles.membershipLabel}>MEMBERSHIP</Text>
                <Text style={styles.membershipType}>{user?.membershipType || 'Premium'}</Text>
              </View>
              <View style={styles.membershipBadge}>
                <Ionicons name="shield-checkmark" size={18} color="#FFF" />
                <Text style={styles.membershipBadgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.membershipExpiry}>{daysRemaining} days remaining</Text>
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />
          </LinearGradient>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.section}>
          <SectionHeader title="Your Stats" icon="stats-chart" />
          <View style={styles.statsGrid}>
            <StatCard icon={<Ionicons name="flame-outline" size={22} color={COLORS.primary} />} label="Workouts" value={dashboardStats?.total_workouts || user?.totalWorkouts || 0} subtitle="total" accentColor={COLORS.primary} />
            <StatCard icon={<Ionicons name="flash-outline" size={22} color={COLORS.accent} />} label="Streak" value={`${dashboardStats?.current_streak || 0}d`} subtitle="keep going!" accentColor={COLORS.accent} />
          </View>
          <View style={[styles.statsGrid, { marginTop: SIZES.spacingMd }]}>
            <StatCard icon={<Ionicons name="calendar-outline" size={22} color={COLORS.warning} />} label="Bookings" value={dashboardStats?.upcoming_sessions || memberBookings.length} subtitle="upcoming" accentColor={COLORS.warning} />
            <StatCard icon={<Ionicons name="trophy-outline" size={22} color={COLORS.success} />} label="Plans" value={workoutPlans.length} subtitle="assigned" accentColor={COLORS.success} />
          </View>
        </View>

        {/* Workout Plans */}
        <View style={styles.section}>
          <SectionHeader title="Workout Plans" icon="barbell" />
          {workoutPlans.slice(0, 3).map((workout) => (
            <WorkoutCard
              key={workout.id} name={workout.name} trainer={workout.trainer}
              exerciseCount={workout.exercises.length} status={workout.status}
              isExecuted={workout.isExecuted} date={workout.date}
              onPress={() => {
                Alert.alert(
                  workout.name,
                  workout.exercises.map((e, i) => `${i + 1}. ${e.name} — ${e.sets}×${e.reps} (${e.rest})`).join('\n'),
                  [
                    { text: workout.isExecuted ? 'Mark Incomplete' : 'Mark Complete', onPress: () => toggleWorkoutExecuted(workout.id) },
                    { text: 'Close' },
                  ]
                );
              }}
              style={{ marginBottom: SIZES.spacingMd }}
            />
          ))}
        </View>

        {/* Bookings */}
        <View style={styles.section}>
          <SectionHeader title="Upcoming Sessions" icon="calendar" />
          {memberBookings.filter(b => b.status !== 'cancelled').slice(0, 3).map((booking) => (
            <BookingCard
              key={booking.id} trainerName={booking.trainerName} date={booking.date}
              time={booking.time} duration={booking.duration} type={booking.type}
              status={booking.status}
              onPress={() => {
                Alert.alert(
                  booking.type,
                  `Trainer: ${booking.trainerName}\nDate: ${booking.date}\nTime: ${booking.time}\nDuration: ${booking.duration} min\nStatus: ${booking.status}`,
                  booking.status === 'pending' ? [{ text: 'Cancel', style: 'destructive' }, { text: 'OK' }] : [{ text: 'OK' }]
                );
              }}
              style={{ marginBottom: SIZES.spacingMd }}
            />
          ))}
          {memberBookings.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="calendar-outline" size={32} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No upcoming sessions</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" icon="apps" />
          <View style={styles.actionsGrid}>
            {[
              { icon: 'calendar-outline' as const, label: 'Book\nSession', color: COLORS.primary, action: () => navigation.getParent()?.navigate('Bookings') },
              { icon: 'barbell-outline' as const, label: 'Exercise\nLibrary', color: COLORS.accent, action: () => navigation.navigate('ExerciseLibrary') },
              { icon: 'restaurant-outline' as const, label: 'Meal\nPlan', color: COLORS.success, action: () => navigation.navigate('MealPlan') },
              { icon: 'medkit-outline' as const, label: 'Supple-\nments', color: COLORS.warning, action: () => navigation.navigate('Supplements') },
              { icon: 'trending-up-outline' as const, label: 'My\nProgress', color: '#A855F7', action: () => navigation.getParent()?.navigate('Progress') },
              { icon: 'card-outline' as const, label: 'Pay-\nments', color: COLORS.danger, action: () => navigation.navigate('PaymentHistory') },
            ].map((action, idx) => (
              <TouchableOpacity key={idx} style={styles.actionItem} activeOpacity={0.7}
                onPress={action.action}>
                <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}>
                  <Ionicons name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={styles.actionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: SIZES.tabBarHeight + 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  header: { paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingLg },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  greeting: { fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: 4 },
  userName: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  notifButton: { width: 44, height: 44, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.danger, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  membershipCard: { borderRadius: SIZES.radiusXl, padding: SIZES.spacingLg, overflow: 'hidden', ...SHADOWS.medium },
  membershipTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.spacingLg },
  membershipLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 1.5, marginBottom: 4 },
  membershipType: { fontSize: SIZES.xxl, fontWeight: '800', color: '#FFF' },
  membershipBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  membershipBadgeText: { fontSize: SIZES.sm, fontWeight: '700', color: '#FFF' },
  progressBarBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 8 },
  progressBarFill: { height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  membershipExpiry: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  decorCircle1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.06)', top: -30, right: -30 },
  decorCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: 40 },
  section: { paddingHorizontal: SIZES.spacingLg, marginTop: SIZES.spacingXl },
  statsGrid: { flexDirection: 'row', gap: SIZES.spacingMd },
  emptyCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  emptyText: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: 8 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacingMd },
  actionItem: { width: (width - SIZES.spacingLg * 2 - SIZES.spacingMd * 2) / 3, alignItems: 'center', paddingVertical: SIZES.spacingBase, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder },
  actionIconBox: { width: 48, height: 48, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center', lineHeight: 15 },
});
