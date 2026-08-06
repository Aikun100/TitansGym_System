import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import BookingCard from '../../components/BookingCard';
import SectionHeader from '../../components/SectionHeader';

type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled';

export default function MemberBookings() {
  const { bookings, addBooking, cancelBooking, refreshBookings } = useApp();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // New booking form
  const [newType, setNewType] = useState('personal_training');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredBookings = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);

  const filters: { key: FilterType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle' },
    { key: 'pending', label: 'Pending', icon: 'time' },
    { key: 'cancelled', label: 'Cancelled', icon: 'close-circle' },
  ];

  const sessionTypes = [
    { key: 'personal_training', label: 'Personal Training' },
    { key: 'strength', label: 'Strength Training' },
    { key: 'cardio', label: 'Cardio HIIT' },
    { key: 'yoga', label: 'Yoga & Flexibility' },
    { key: 'boxing', label: 'Boxing' },
  ];

  const handleCreateBooking = async () => {
    if (!newDate.trim() || !newTime.trim()) {
      Alert.alert('Error', 'Please fill in date and time');
      return;
    }
    try {
      await addBooking({
        trainer_id: 2,
        booking_date: newDate,
        start_time: newTime,
        end_time: '10:00',
        session_type: newType,
        notes: newNotes,
      });
      setShowModal(false);
      setNewDate(''); setNewTime(''); setNewNotes('');
      Alert.alert('Success ✅', 'Booking request sent!');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = (id: number, type: string) => {
    Alert.alert('Cancel Booking', `Cancel "${type}"?`, [
      { text: 'No', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          await cancelBooking(id);
          Alert.alert('Cancelled', 'Booking has been cancelled.');
        } catch (e: any) {
          Alert.alert('Error', e.message || 'Failed to cancel');
        }
      }},
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refreshBookings(); } catch (e) {}
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
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

      {/* List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Text style={styles.summaryNumber}>{bookings.length}</Text><Text style={styles.summaryLabel}>Total</Text></View>
          <View style={styles.summaryCard}><Text style={[styles.summaryNumber, { color: COLORS.success }]}>{bookings.filter(b => b.status === 'confirmed').length}</Text><Text style={styles.summaryLabel}>Confirmed</Text></View>
          <View style={styles.summaryCard}><Text style={[styles.summaryNumber, { color: COLORS.warning }]}>{bookings.filter(b => b.status === 'pending').length}</Text><Text style={styles.summaryLabel}>Pending</Text></View>
        </View>

        <SectionHeader title={`${filteredBookings.length} Session${filteredBookings.length !== 1 ? 's' : ''}`} />
        {filteredBookings.map((booking) => (
          <BookingCard key={booking.id} trainerName={booking.trainerName} date={booking.date}
            time={booking.time} duration={booking.duration} type={booking.type} status={booking.status}
            onPress={() => {
              if (booking.status === 'pending' || booking.status === 'confirmed') {
                handleCancelBooking(booking.id, booking.type);
              } else {
                Alert.alert(booking.type, `Status: ${booking.status}\nTrainer: ${booking.trainerName}\n${booking.date} at ${booking.time}`);
              }
            }}
            style={{ marginBottom: SIZES.spacingMd }}
          />
        ))}
        {filteredBookings.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={56} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No bookings found</Text>
            <Text style={styles.emptySubtitle}>Tap + to book a new session!</Text>
          </View>
        )}
        <View style={{ height: SIZES.tabBarHeight + 30 }} />
      </ScrollView>

      {/* Create Booking Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Book a Session</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
            </View>

            {/* Session Type */}
            <Text style={styles.modalLabel}>Session Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {sessionTypes.map(t => (
                <TouchableOpacity key={t.key} style={[styles.typeChip, newType === t.key && styles.typeChipActive]} onPress={() => setNewType(t.key)}>
                  <Text style={[styles.typeChipText, newType === t.key && styles.typeChipTextActive]}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Date */}
            <Text style={styles.modalLabel}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.modalInput} placeholder="2026-05-10" placeholderTextColor={COLORS.textMuted}
              value={newDate} onChangeText={setNewDate} />

            {/* Time */}
            <Text style={styles.modalLabel}>Start Time (HH:MM)</Text>
            <TextInput style={styles.modalInput} placeholder="09:00" placeholderTextColor={COLORS.textMuted}
              value={newTime} onChangeText={setNewTime} />

            {/* Notes */}
            <Text style={styles.modalLabel}>Notes (optional)</Text>
            <TextInput style={[styles.modalInput, { height: 64 }]} placeholder="Any special requests..." placeholderTextColor={COLORS.textMuted}
              value={newNotes} onChangeText={setNewNotes} multiline />

            <TouchableOpacity onPress={handleCreateBooking} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalButton}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.modalButtonText}>Book Session</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingBase },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  addButton: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingSm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  filterText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  filterTextActive: { color: COLORS.text, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg },
  summaryRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  summaryCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  summaryNumber: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SIZES.spacingBase },
  emptySubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary },
  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.spacingXl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  modalLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 48, fontSize: SIZES.base, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  typeChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  typeChipActive: { backgroundColor: COLORS.primary + '25', borderColor: COLORS.primary },
  typeChipText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  typeChipTextActive: { color: COLORS.primary, fontWeight: '600' },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: SIZES.radiusMd, marginTop: 8 },
  modalButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
});
