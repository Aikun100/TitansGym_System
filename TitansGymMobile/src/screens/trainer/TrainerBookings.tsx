import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            <Ionicons name={filter.icon} size={16} color={activeFilter === filter.key ? COLORS.text : COLORS.textTertiary} />
            <Text style={[styles.filterText, activeFilter === filter.key && styles.filterTextActive]}>{filter.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.trainerAccent} colors={[COLORS.trainerAccent]} />}>

        {/* Today summary */}
        <View style={styles.todayCard}>
          <View style={styles.todayLeft}>
            <Ionicons name="today-outline" size={24} color={COLORS.trainerAccent} />
            <View>
              <Text style={styles.todayLabel}>All Sessions</Text>
              <Text style={styles.todayValue}>{filteredBookings.length} session{filteredBookings.length !== 1 ? 's' : ''}</Text>
            </View>
          </View>
        </View>

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingBase },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  headerBadge: { backgroundColor: COLORS.warning + '20', paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  headerBadgeText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.warning },
  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingSm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.trainerAccent + '25', borderColor: COLORS.trainerAccent },
  filterText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  filterTextActive: { color: COLORS.text, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg },
  todayCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.trainerAccent + '12', borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, marginBottom: SIZES.spacingXl, borderWidth: 1, borderColor: COLORS.trainerAccent + '30' },
  todayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  todayLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  todayValue: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SIZES.spacingBase },
  emptySubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary },
});
