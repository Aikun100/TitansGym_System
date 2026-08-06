import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Dimensions, Alert, RefreshControl, ImageBackground
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
        
        {/* Premium Header Profile Area */}
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80' }} 
          style={styles.heroBackground}
        >
          <LinearGradient colors={['rgba(9,9,11,0.4)', '#09090B']} style={StyleSheet.absoluteFillObject} />
          
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Coach'}</Text>
            </View>
            <TouchableOpacity style={styles.notifButton} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
              {unreadCount > 0 && <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>}
            </TouchableOpacity>
          </View>

          {/* Premium Glassmorphic Status Card */}
          <LinearGradient colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.03)']} style={styles.statusCard}>
            <View style={styles.statusTop}>
              <View style={styles.statusLeft}>
                <View style={styles.trainerAvatar}>
                  <ImageBackground source={{ uri: user?.avatar || 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80' }} style={{width:'100%', height:'100%'}} imageStyle={{borderRadius:28}} />
                </View>
                <View>
                  <Text style={styles.statusLabel}>TODAY'S SCHEDULE</Text>
                  <Text style={styles.statusValue}>{todayBookings.length} Sessions</Text>
                </View>
              </View>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#FFD740" />
                <Text style={styles.ratingText}>{user?.rating || 4.8}</Text>
              </View>
            </View>
            
            <View style={styles.statusBottom}>
              <View style={styles.statusStat}><Text style={styles.statusStatValue}>{dashboardStats?.total_clients || clients.length}</Text><Text style={styles.statusStatLabel}>Clients</Text></View>
              <View style={styles.statusDivider} />
              <View style={styles.statusStat}><Text style={styles.statusStatValue}>{dashboardStats?.completed_sessions || user?.totalSessions || 0}</Text><Text style={styles.statusStatLabel}>Sessions</Text></View>
              <View style={styles.statusDivider} />
              <View style={styles.statusStat}><Text style={[styles.statusStatValue, { color: COLORS.accent }]}>{pendingCount}</Text><Text style={styles.statusStatLabel}>Pending</Text></View>
            </View>
          </LinearGradient>
        </ImageBackground>

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

        {/* Quick Actions Premium */}
        <View style={styles.section}>
          <SectionHeader title="Quick Actions" icon="flash" />
          <View style={styles.actionsGrid}>
            {[
              { icon: 'qr-code-outline' as const, label: 'Scan\nClient', color: COLORS.trainerAccent, action: () => navigation.navigate('TakeAttendance') },
              { icon: 'clipboard-outline' as const, label: 'Workout\nPlans', color: COLORS.primary, action: () => navigation.navigate('WorkoutPlans') },
              { icon: 'trending-up-outline' as const, label: 'Track\nProgress', color: COLORS.accent, action: () => navigation.navigate('TrackProgress') },
              { icon: 'people-outline' as const, label: 'Client\nList', color: COLORS.warning, action: () => navigation.getParent()?.navigate('Clients') },
            ].map((action, idx) => (
              <TouchableOpacity key={idx} style={styles.actionItem} activeOpacity={0.7} onPress={action.action}>
                <LinearGradient colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.02)']} style={styles.actionGradient}>
                  <View style={[styles.actionIconBox, { backgroundColor: action.color + '20' }]}>
                    <Ionicons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={styles.actionLabel}>{action.label}</Text>
                </LinearGradient>
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
  scrollContent: { paddingBottom: 120 },
  heroBackground: { paddingTop: 60, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingXl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl, zIndex: 10 },
  greeting: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  userName: { fontSize: SIZES.xxl, fontWeight: '900', color: '#FFF', letterSpacing: 0.5 },
  notifButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  notifBadge: { position: 'absolute', top: 0, right: 0, backgroundColor: COLORS.danger, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  statusCard: { borderRadius: SIZES.radiusXl, padding: SIZES.spacingLg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', zIndex: 10 },
  statusTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingLg },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  trainerAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.1)' },
  statusLabel: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '700', letterSpacing: 1.5, marginBottom: 4 },
  statusValue: { fontSize: SIZES.xl, fontWeight: '800', color: '#FFF' },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,215,64,0.15)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: SIZES.radiusFull },
  ratingText: { fontSize: SIZES.sm, fontWeight: '800', color: '#FFD740' },
  statusBottom: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: SIZES.spacingBase, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  statusStat: { flex: 1, alignItems: 'center' },
  statusStatValue: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  statusStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  statusDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)', height: '80%', alignSelf: 'center' },
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
  actionItem: { width: (width - SIZES.spacingLg * 2 - SIZES.spacingMd) / 2, borderRadius: SIZES.radiusLg, overflow: 'hidden' },
  actionGradient: { paddingVertical: SIZES.spacingLg, paddingHorizontal: SIZES.spacingBase, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionIconBox: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionLabel: { fontSize: SIZES.sm, color: '#FFF', fontWeight: '600', textAlign: 'center', lineHeight: 18 },
});
