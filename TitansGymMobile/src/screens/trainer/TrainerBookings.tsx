import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, RefreshControl, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import BookingCard from '../../components/BookingCard';
import SectionHeader from '../../components/SectionHeader';

type FilterType = 'all' | 'confirmed' | 'pending' | 'completed' | 'cancelled';

export default function TrainerBookings() {
  const { bookings, updateBookingStatus, refreshBookings } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filteredBookings = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);

  const filters: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'pending', label: 'Pending', icon: 'time' },
    { key: 'completed', label: 'Done', icon: 'checkmark-done-circle' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refreshBookings(); } catch (e) {}
    setRefreshing(false);
  };

  const handleBookingAction = (booking: typeof bookings[0]) => {
    const actions: any[] = [{ text: 'Close' }];

    if (booking.status === 'pending') {
      actions.unshift(
        { text: '✅ Confirm', onPress: () => { updateBookingStatus(booking.id, 'confirmed'); Alert.alert('Confirmed!', `Session with ${booking.memberName} confirmed.`); }},
        { text: '❌ Decline', style: 'destructive', onPress: () => { updateBookingStatus(booking.id, 'cancelled'); Alert.alert('Declined', 'Booking has been declined.'); }},
      );
    } else if (booking.status === 'confirmed') {
      actions.unshift(
        { text: '🎉 Complete', onPress: () => { updateBookingStatus(booking.id, 'completed'); Alert.alert('Done!', 'Session marked as completed.'); }},
        { text: '❌ Cancel', style: 'destructive', onPress: () => { updateBookingStatus(booking.id, 'cancelled'); }},
      );
    }

    Alert.alert(
      `${booking.type}`,
      `👤 Client: ${booking.memberName}\n📅 ${booking.date}\n🕐 ${booking.time} (${booking.duration} min)\n📊 Status: ${booking.status.toUpperCase()}`,
      actions
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80' }} 
        style={styles.heroBackground}
      >
        <LinearGradient colors={['rgba(9,9,11,0.6)', '#09090B']} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bookings</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{bookings.filter(b => b.status === 'pending').length} pending</Text>
          </View>
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter.key}
              style={[styles.filterChip, activeFilter === filter.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(filter.key)} activeOpacity={0.7}>
              <Ionicons name={filter.icon} size={16} color={activeFilter === filter.key ? '#FFF' : 'rgba(255,255,255,0.5)'} />
              <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ImageBackground>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.trainerAccent} colors={[COLORS.trainerAccent]} />}>

        {/* Today summary */}
        <LinearGradient colors={['rgba(124,58,237,0.15)', 'rgba(91,33,182,0.05)']} style={styles.todayCard}>
          <View style={styles.todayLeft}>
            <Ionicons name="calendar" size={24} color={COLORS.trainerAccent} />
            <View>
              <Text style={styles.todayLabel}>Total Sessions Found</Text>
              <Text style={styles.todayValue}>{filteredBookings.length} session{filteredBookings.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </LinearGradient>

        <SectionHeader title={`${filteredBookings.length} Session${filteredBookings.length !== 1 ? 's' : ''}`} />

        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} trainerName={booking.trainerName} memberName={booking.memberName}
            date={booking.date} time={booking.time} duration={booking.duration}
            type={booking.type} status={booking.status} showMember
            onPress={() => handleBookingAction(booking)}
            style={{ marginBottom: SIZES.spacingMd }}
          />
        ))}

        {filteredBookings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>No sessions match the selected filter.</Text>
          </View>
        )}

        <View style={{ height: SIZES.tabBarHeight + 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroBackground: { paddingTop: 40, paddingBottom: SIZES.spacingMd },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingLg, zIndex: 10 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  headerBadge: { backgroundColor: 'rgba(234,179,8,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  headerBadgeText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.warning, letterSpacing: 0.5 },
  filterScroll: { maxHeight: 48, zIndex: 10 },
  filterContent: { paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingSm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterChipActive: { backgroundColor: 'rgba(124,58,237,0.3)', borderColor: COLORS.trainerAccent },
  filterText: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  filterTextActive: { color: '#FFF', fontWeight: '800' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg },
  todayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: SIZES.radiusLg, padding: SIZES.spacingLg, marginBottom: SIZES.spacingXl, borderWidth: 1, borderColor: 'rgba(124,58,237,0.3)' },
  todayLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  todayLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  todayValue: { fontSize: SIZES.lg, fontWeight: '800', color: '#FFF' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: '#FFF', marginTop: SIZES.spacingBase },
  emptySubtitle: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.5)' },
});
