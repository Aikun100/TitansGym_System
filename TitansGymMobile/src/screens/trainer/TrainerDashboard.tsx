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

const { width } = Dimensions.get('window');

export default function TrainerDashboard() {
  const navigation = useNavigation<any>();
  const { user, bookings, clients, updateBookingStatus, unreadCount, markAllNotificationsRead, refreshDashboard, refreshBookings, dashboardStats } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const initials = (user?.name || 'T').replace('Coach ', '').split(' ').map(n => n[0]).join('').slice(0, 2);
  const todayBookings = bookings.filter(b => b.status !== 'cancelled');
  const pendingCount = dashboardStats?.pending_bookings || bookings.filter(b => b.status === 'pending').length;

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

  const progressColors: Record<string, string> = { 'Excellent': COLORS.success, 'On Track': COLORS.accent, 'Needs Attention': COLORS.warning };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.trainerAccent} colors={[COLORS.trainerAccent]} />}>
        
        {/* Header */}
        <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Trainer'}</Text>
            </View>
            <TouchableOpacity style={styles.notifButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
              {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
          </View>

          {/* Status Card */}
          <LinearGradient colors={['#7C3AED', '#5B21B6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View style={styles.statusLeft}>
                <View style={styles.trainerAvatar}><Text style={styles.avatarInitials}>{initials}</Text></View>
                <View>
                  <Text style={styles.statusLabel}>TODAY'S SCHEDULE</Text>
                  <Text style={styles.statusValue}>{todayBookings.length} Sessions</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={16} color="#FFD740" />
                <Text style={styles.ratingText}>{user?.rating || 4.8}</Text>
              </View>
            </View>
            <View style={styles.statusBottom}>
              <View style={styles.statusStat}><Text style={styles.statusStatValue}>{dashboardStats?.total_clients || clients.length}</Text><Text style={styles.statusStatLabel}>Clients</Text></View>
              <View style={styles.statusDivider} />
              <View style={styles.statusStat}><Text style={styles.statusStatValue}>{dashboardStats?.completed_sessions || user?.totalSessions || 0}</Text><Text style={styles.statusStatLabel}>Sessions</Text></View>
              <View style={styles.statusDivider} />
              <View style={styles.statusStat}><Text style={styles.statusStatValue}>{pendingCount}</Text><Text style={styles.statusStatLabel}>Pending</Text></View>
            </View>
            <View style={styles.decorCircle1} /><View style={styles.decorCircle2} />
          </LinearGradient>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.section}>
          <SectionHeader title="Performance" icon="stats-chart" />
          <View style={styles.statsGrid}>
            <StatCard icon={<Ionicons name="people-outline" size={22} color={COLORS.trainerAccent} />} label="Clients" value={clients.length} subtitle="active" accentColor={COLORS.trainerAccent} />
            <StatCard icon={<Ionicons name="star-outline" size={22} color={COLORS.warning} />} label="Rating" value={user?.rating || 4.8} subtitle="average" accentColor={COLORS.warning} />
          </View>
        </View>

        {/* Today's Sessions */}
        <View style={styles.section}>
          <SectionHeader title="Upcoming Sessions" icon="today" />
          {todayBookings.slice(0, 3).map((booking) => (
            <BookingCard key={booking.id} trainerName={booking.trainerName} memberName={booking.memberName}
              date={booking.date} time={booking.time} duration={booking.duration}
              type={booking.type} status={booking.status} showMember
              onPress={() => {
                const actions: any[] = [{ text: 'Close' }];
                if (booking.status === 'pending') {
                  actions.unshift(
                    { text: 'Confirm', onPress: () => { updateBookingStatus(booking.id, 'confirmed'); Alert.alert('Confirmed ✅', `Session with ${booking.memberName} confirmed!`); } },
                    { text: 'Decline', style: 'destructive', onPress: () => { updateBookingStatus(booking.id, 'cancelled'); } }
                  );
                } else if (booking.status === 'confirmed') {
                  actions.unshift({ text: 'Mark Complete', onPress: () => { updateBookingStatus(booking.id, 'completed'); Alert.alert('Completed! 🎉', 'Session marked as completed.'); } });
                }
                Alert.alert(booking.type, `Client: ${booking.memberName}\nDate: ${booking.date}\nTime: ${booking.time}\nStatus: ${booking.status}`, actions);
              }}
              style={{ marginBottom: SIZES.spacingMd }}
            />
          ))}
          {todayBookings.length === 0 && (
            <View style={styles.emptyCard}><Ionicons name="calendar-outline" size={32} color={COLORS.textTertiary} /><Text style={styles.emptyText}>No sessions scheduled</Text></View>
          )}
        </View>

        {/* Clients */}
        <View style={styles.section}>
          <SectionHeader title="My Clients" icon="people" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.clientsScroll}>
            {clients.map((client) => {
              const ci = client.name.split(' ').map(n => n[0]).join('');
              const color = progressColors[client.progress] || COLORS.textTertiary;
              return (
                <TouchableOpacity key={client.id} style={styles.clientCard} activeOpacity={0.7}
                  onPress={() => Alert.alert(client.name, `Type: ${client.membershipType}\nProgress: ${client.progress}\nNext: ${client.nextSession}\nEmail: ${client.email || '--'}\nPhone: ${client.phone || '--'}`)}>
                  <View style={styles.clientAvatar}><Text style={styles.clientInitials}>{ci}</Text></View>
                  <Text style={styles.clientName} numberOfLines={1}>{client.name}</Text>
                  <Text style={styles.clientMembership}>{client.membershipType}</Text>
                  <View style={[styles.clientProgressBadge, { backgroundColor: color + '18' }]}>
                    <View style={[styles.clientProgressDot, { backgroundColor: color }]} />
                    <Text style={[styles.clientProgressText, { color }]}>{client.progress}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" icon="apps" />
          <View style={styles.actionsGrid}>
            {[
              { icon: 'clipboard-outline' as const, label: 'Workout\nPlans', color: COLORS.trainerAccent, action: () => navigation.navigate('WorkoutPlans') },
              { icon: 'checkbox-outline' as const, label: 'Take\nAttendance', color: COLORS.success, action: () => navigation.navigate('TakeAttendance') },
              { icon: 'trending-up-outline' as const, label: 'Track\nProgress', color: COLORS.accent, action: () => navigation.navigate('TrackProgress') },
              { icon: 'barbell-outline' as const, label: 'Exercise\nLibrary', color: COLORS.primary, action: () => navigation.navigate('ExerciseLibrary') },
              { icon: 'people-outline' as const, label: 'Client\nList', color: COLORS.warning, action: () => navigation.getParent()?.navigate('Clients') },
              { icon: 'calendar-outline' as const, label: 'Schedule\nCalendar', color: COLORS.danger, action: () => navigation.getParent()?.navigate('Bookings') },
            ].map((action, idx) => (
              <TouchableOpacity key={idx} style={styles.actionItem} activeOpacity={0.7}
                onPress={action.action}>
                <View style={[styles.actionIconBox, { backgroundColor: action.color + '18' }]}><Ionicons name={action.icon} size={24} color={action.color} /></View>
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
  statusCard: { borderRadius: SIZES.radiusXl, padding: SIZES.spacingLg, overflow: 'hidden', ...SHADOWS.medium },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingLg },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trainerAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  avatarInitials: { fontSize: SIZES.lg, fontWeight: '800', color: '#FFF' },
  statusLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 1.2, marginBottom: 2 },
  statusValue: { fontSize: SIZES.lg, fontWeight: '700', color: '#FFF' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  ratingText: { fontSize: SIZES.md, fontWeight: '700', color: '#FFF' },
  statusBottom: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: SIZES.spacingBase, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  statusStat: { alignItems: 'center' },
  statusStatValue: { fontSize: SIZES.xl, fontWeight: '800', color: '#FFF' },
  statusStatLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  statusDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  decorCircle1: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.05)', top: -30, right: -30 },
  decorCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.03)', bottom: -20, left: 40 },
  section: { paddingHorizontal: SIZES.spacingLg, marginTop: SIZES.spacingXl },
  statsGrid: { flexDirection: 'row', gap: SIZES.spacingMd },
  emptyCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  emptyText: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: 8 },
  clientsScroll: { paddingRight: SIZES.spacingLg, gap: SIZES.spacingMd },
  clientCard: { width: 140, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', ...SHADOWS.small },
  clientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.trainerAccent + '25', justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingSm },
  clientInitials: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.trainerAccent },
  clientName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  clientMembership: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginBottom: SIZES.spacingSm },
  clientProgressBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusFull },
  clientProgressDot: { width: 6, height: 6, borderRadius: 3 },
  clientProgressText: { fontSize: 9, fontWeight: '600' },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacingMd },
  actionItem: { width: (width - SIZES.spacingLg * 2 - SIZES.spacingMd * 2) / 3, alignItems: 'center', paddingVertical: SIZES.spacingBase, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder },
  actionIconBox: { width: 48, height: 48, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, fontWeight: '500', textAlign: 'center', lineHeight: 15 },
});
