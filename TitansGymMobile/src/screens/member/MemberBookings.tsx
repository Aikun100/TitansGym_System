import React, { useState, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput, RefreshControl, Image, Dimensions, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Calendar from 'expo-calendar';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { memberApi } from '../../services/api';
import BookingCard from '../../components/BookingCard';
import SectionHeader from '../../components/SectionHeader';

const { width } = Dimensions.get('window');

type TabType = 'sessions' | 'experts';
type FilterType = 'all' | 'confirmed' | 'pending' | 'cancelled';

export default function MemberBookings() {
  const { bookings, addBooking, cancelBooking, refreshBookings } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Trainer & Search State
  const [trainers, setTrainers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Booking Flow State
  const [selectedTrainerInfo, setSelectedTrainerInfo] = useState<any | null>(null);
  const [showBookingFlow, setShowBookingFlow] = useState(false);
  const [bookingStep, setBookingStep] = useState<'profile' | 'schedule'>('profile');
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);

  // Form State
  const [newType, setNewType] = useState('personal_training');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Generate next 14 days for the UI
  const nextDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1);
      return {
        full: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        date: d.getDate(),
      };
    });
  }, []);

  const timeSlots = ['08:00', '09:00', '10:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  const PREMIUM_TRAINER_PICS = [
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1548690312-e3b507d8c110?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop',
  ];

  const getTrainerPic = (index: number) => PREMIUM_TRAINER_PICS[index % PREMIUM_TRAINER_PICS.length];

  useEffect(() => {
    if (nextDays.length > 0 && !newDate) setNewDate(nextDays[0].full);
    if (!newTime) setNewTime(timeSlots[0]);
  }, [nextDays]);

  // Load trainers
  useEffect(() => {
    const loadTrainers = async () => {
      try {
        const data = await memberApi.getTrainers();
        const items = Array.isArray(data) ? data : (data as any).data || [];
        setTrainers(items);
      } catch (e) {
        console.error('Failed to load trainers', e);
      }
    };
    loadTrainers();
  }, []);

  const filteredBookings = activeFilter === 'all' ? bookings : bookings.filter(b => b.status === activeFilter);
  const filteredTrainers = trainers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const sessionTypes = [
    { key: 'personal_training', label: 'Personal Training', icon: 'barbell-outline' as const },
    { key: 'strength', label: 'Strength', icon: 'fitness-outline' as const },
    { key: 'cardio', label: 'Cardio HIIT', icon: 'heart-outline' as const },
    { key: 'yoga', label: 'Yoga & Flex', icon: 'body-outline' as const },
    { key: 'boxing', label: 'Boxing', icon: 'hand-left-outline' as const },
  ];

  const handleCreateBooking = async () => {
    if (!newDate.trim() || !newTime.trim() || !selectedTrainerInfo) {
      Alert.alert('Error', 'Please complete all selections.');
      return;
    }
    try {
      if (editingBookingId) {
        await cancelBooking(editingBookingId); // Mock reschedule
      }
      await addBooking({
        trainer_id: selectedTrainerInfo.id,
        booking_date: newDate,
        start_time: newTime,
        end_time: '10:00', // Mock
        session_type: newType,
        notes: newNotes,
      });
      setShowBookingFlow(false);
      setEditingBookingId(null);
      setNewNotes('');
      Alert.alert('Success ✅', editingBookingId ? 'Booking rescheduled!' : 'Session booked successfully!');
      setActiveTab('sessions');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to create booking');
    }
  };

  const handleCancelBooking = (id: number, type: string) => {
    Alert.alert('Cancel Session', `Are you sure you want to cancel "${type}"?`, [
      { text: 'Keep It', style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
        try {
          await cancelBooking(id);
        } catch (e: any) {
          Alert.alert('Error', e.message || 'Failed to cancel');
        }
      }},
    ]);
  };

  const handleReschedule = (booking: any) => {
    setEditingBookingId(booking.id);
    setNewType(booking.type.toLowerCase().replace(' ', '_')); 
    setNewDate(booking.date);
    setNewTime(booking.time);
    const t = trainers.find(tr => tr.name === booking.trainerName);
    if (t) {
      setSelectedTrainerInfo(t);
      setBookingStep('schedule');
      setShowBookingFlow(true);
    } else {
      Alert.alert('Error', 'Trainer not found.');
    }
  };

  const handleAddToCalendar = async (booking: any) => {
    try {
      const { status } = await Calendar.requestCalendarPermissionsAsync();
      if (status === 'granted') {
        const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
        const defaultCalendar = calendars.find(c => c.allowsModifications) || calendars[0];
        if (!defaultCalendar) return Alert.alert('Error', 'No calendar found.');
        
        const start = new Date(`${booking.date}T${booking.time}`);
        const end = new Date(start.getTime() + booking.duration * 60000);
        
        await Calendar.createEventAsync(defaultCalendar.id, {
          title: `${booking.type} with ${booking.trainerName}`,
          startDate: start,
          endDate: end,
          timeZone: 'GMT',
          location: 'Titans Gym',
          notes: 'Booked via Titans Gym App',
        });
        Alert.alert('Success ✅', 'Event added to calendar!');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refreshBookings(); } catch (e) { }
    setRefreshing(false);
  };

  const openTrainerProfile = (trainer: any) => {
    setSelectedTrainerInfo(trainer);
    setEditingBookingId(null);
    setBookingStep('profile');
    setShowBookingFlow(true);
  };

  const renderSessionsTab = () => (
    <ScrollView 
      style={styles.scrollView} 
      contentContainerStyle={styles.scrollContent} 
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* Neon Status Hub */}
      <View style={styles.statusHub}>
        <View style={styles.statusItem}>
          <Text style={styles.statusVal}>{bookings.length}</Text>
          <Text style={styles.statusLab}>TOTAL</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={[styles.statusVal, { color: COLORS.success }]}>{bookings.filter(b => b.status === 'confirmed').length}</Text>
          <Text style={styles.statusLab}>CONFIRMED</Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Text style={[styles.statusVal, { color: COLORS.warning }]}>{bookings.filter(b => b.status === 'pending').length}</Text>
          <Text style={styles.statusLab}>PENDING</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContent} style={{ marginBottom: 20 }}>
        {['all', 'confirmed', 'pending', 'cancelled'].map((f) => (
          <TouchableOpacity key={f}
            style={[styles.neonChip, activeFilter === f && styles.neonChipActive]}
            onPress={() => setActiveFilter(f as FilterType)}>
            <Text style={[styles.neonChipText, activeFilter === f && styles.neonChipTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SectionHeader title={`${filteredBookings.length} Active Sessions`} />
      
      {filteredBookings.map((booking) => {
        const trainerIndex = trainers.findIndex(t => t.name === booking.trainerName);
        const avatarUrl = trainerIndex >= 0 ? getTrainerPic(trainerIndex) : undefined;
        return (
          <BookingCard 
            key={booking.id} 
            trainerName={booking.trainerName} 
            trainerAvatar={avatarUrl}
            date={booking.date}
            time={booking.time} 
            duration={booking.duration} 
            type={booking.type} 
            status={booking.status}
            onAddCalendar={() => handleAddToCalendar(booking)}
            onReschedule={() => handleReschedule(booking)}
            onPress={() => {
              if (booking.status === 'pending' || booking.status === 'confirmed') handleCancelBooking(booking.id, booking.type);
            }}
          />
        );
      })}

      {filteredBookings.length === 0 && (
        <View style={styles.emptyState}>
          <Image source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop' }} style={styles.emptyStateImg} />
          <Text style={styles.emptyTitle}>No sessions booked</Text>
          <Text style={styles.emptySubtitle}>Find an expert and start training today.</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderExpertsTab = () => (
    <View style={styles.expertsContainer}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.textTertiary} />
        <TextInput 
          style={styles.searchInput}
          placeholder="Search for trainers, specialties..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={COLORS.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        {filteredTrainers.map((t, index) => {
          const avatarUrl = getTrainerPic(index);
          return (
            <TouchableOpacity key={t.id} style={styles.trainerCard} activeOpacity={0.8} onPress={() => openTrainerProfile({ ...t, avatarUrl })}>
              <Image source={{ uri: avatarUrl }} style={styles.tcImage} />
              <View style={styles.tcContent}>
                <View>
                  <Text style={styles.tcName}>{t.name}</Text>
                  <Text style={styles.tcRole}>Elite Trainer • 5+ Yrs Exp.</Text>
                </View>
                <View style={styles.tcRatesRow}>
                  <Text style={styles.tcRate}>$50<Text style={{fontSize: 12, color: COLORS.textTertiary}}>/session</Text></Text>
                  <View style={styles.tcBookBtn}>
                    <Text style={styles.tcBookBtnText}>View</Text>
                    <Ionicons name="arrow-forward" size={14} color="#FFF" />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        {filteredTrainers.length === 0 && (
          <Text style={{ color: COLORS.textMuted, textAlign: 'center', marginTop: 40 }}>No trainers found.</Text>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Immersive Header & Tabs */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop' }} 
        style={styles.immersiveHeaderBg}
      >
        <LinearGradient 
          colors={['rgba(0,0,0,0.6)', COLORS.background]} 
          style={styles.immersiveHeaderGradient}
        >
          <Text style={styles.headerTitle}>Sessions</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'sessions' && styles.tabBtnActive]} onPress={() => setActiveTab('sessions')}>
              <Text style={[styles.tabText, activeTab === 'sessions' && styles.tabTextActive]}>My Bookings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'experts' && styles.tabBtnActive]} onPress={() => setActiveTab('experts')}>
              <Text style={[styles.tabText, activeTab === 'experts' && styles.tabTextActive]}>Find Expert</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>

      {activeTab === 'sessions' ? renderSessionsTab() : renderExpertsTab()}

      {/* Unified Booking Flow Modal */}
      <Modal visible={showBookingFlow} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{bookingStep === 'profile' ? 'Trainer Profile' : 'Schedule Session'}</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowBookingFlow(false)}>
                <Ionicons name="close" size={22} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {selectedTrainerInfo && bookingStep === 'profile' && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}>
                
                {/* Banner Image behind profile */}
                <View style={styles.profileBannerContainer}>
                  <Image source={{ uri: selectedTrainerInfo.avatarUrl }} style={styles.profileBannerImg} blurRadius={10} />
                  <LinearGradient colors={['transparent', COLORS.backgroundSecondary]} style={styles.profileBannerOverlay} />
                </View>

                <View style={styles.profileHeader}>
                  <View style={styles.avatarGlow}>
                    <Image source={{ uri: selectedTrainerInfo.avatarUrl }} style={styles.profileAvatar} />
                  </View>
                  <Text style={styles.profileName}>{selectedTrainerInfo.name}</Text>
                  <Text style={styles.profileRole}>Certified Personal Trainer</Text>
                  
                  <View style={styles.profileStats}>
                    <View style={styles.pStat}><Ionicons name="star" size={16} color={COLORS.warning} /><Text style={styles.pStatText}>4.9 Rating</Text></View>
                    <View style={styles.pStat}><Ionicons name="time" size={16} color={COLORS.textTertiary} /><Text style={styles.pStatText}>5+ Years</Text></View>
                    <View style={styles.pStat}><Ionicons name="cash" size={16} color={COLORS.success} /><Text style={styles.pStatText}>$50/hr</Text></View>
                  </View>
                </View>

                <View style={styles.profileSection}>
                  <Text style={styles.profileSectionTitle}>ABOUT</Text>
                  <Text style={styles.profileBio}>Specializes in strength training, hypertrophy, and functional fitness. Dedicated to helping you achieve your specific goals with personalized plans tailored to your lifestyle and body type.</Text>
                </View>

                <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 20 }} onPress={() => setBookingStep('schedule')}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalActionBtn}>
                    <Text style={styles.modalActionBtnText}>Check Availability & Book</Text>
                    <Ionicons name="calendar-outline" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}

            {selectedTrainerInfo && bookingStep === 'schedule' && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.miniProfileRow}>
                  <TouchableOpacity onPress={() => setBookingStep('profile')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.text} />
                  </TouchableOpacity>
                  <Image source={{ uri: selectedTrainerInfo.avatarUrl }} style={styles.miniAvatar} />
                  <Text style={styles.miniName}>Booking with {selectedTrainerInfo.name.split(' ')[0]}</Text>
                </View>

                {/* Session Type */}
                <Text style={styles.inputLabel}>SELECT ACTIVITY</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                  {sessionTypes.map(t => (
                    <TouchableOpacity key={t.key} style={[styles.visualTypeChip, newType === t.key && styles.visualTypeChipActive]} onPress={() => setNewType(t.key)}>
                      <Ionicons name={t.icon} size={20} color={newType === t.key ? '#FFF' : COLORS.textTertiary} />
                      <Text style={[styles.visualTypeChipText, newType === t.key && styles.visualTypeChipTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Date */}
                <Text style={styles.inputLabel}>AVAILABLE DATES</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                  {nextDays.map(d => (
                    <TouchableOpacity key={d.full} style={[styles.dateCard, newDate === d.full && styles.dateCardActive]} onPress={() => setNewDate(d.full)}>
                      <Text style={[styles.dateDay, newDate === d.full && styles.dateTextActive]}>{d.day}</Text>
                      <Text style={[styles.dateNum, newDate === d.full && styles.dateTextActive]}>{d.date}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Time */}
                <Text style={styles.inputLabel}>AVAILABLE TIMES</Text>
                <View style={styles.timeGrid}>
                  {timeSlots.map(time => (
                    <TouchableOpacity key={time} style={[styles.timeChip, newTime === time && styles.timeChipActive]} onPress={() => setNewTime(time)}>
                      <Text style={[styles.timeText, newTime === time && styles.timeTextActive]}>{time}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity activeOpacity={0.9} style={{ marginTop: 30 }} onPress={handleCreateBooking}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalActionBtn}>
                    <Text style={styles.modalActionBtnText}>{editingBookingId ? 'Confirm Reschedule' : 'Confirm Booking'}</Text>
                    <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                  </LinearGradient>
                </TouchableOpacity>
              </ScrollView>
            )}

          </LinearGradient>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  immersiveHeaderBg: {
    width: '100%',
    paddingTop: 50,
  },
  immersiveHeaderGradient: {
    paddingHorizontal: SIZES.spacingLg,
    paddingBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: 0, height: 2},
    textShadowRadius: 10
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFF',
    fontWeight: '800',
  },
  // Sessions Tab
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: 20, paddingBottom: 150 },
  statusHub: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...SHADOWS.medium,
  },
  statusItem: { flex: 1, alignItems: 'center' },
  statusVal: { fontSize: 24, fontWeight: '900', color: COLORS.text },
  statusLab: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
  statusDivider: { width: 1, height: '60%', backgroundColor: COLORS.border, alignSelf: 'center' },
  filterContent: { gap: 10, paddingRight: 20 },
  neonChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  neonChipActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  neonChipText: { fontSize: 13, color: COLORS.textTertiary, fontWeight: '700' },
  neonChipTextActive: { color: COLORS.primary },
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyStateImg: { width: 120, height: 120, borderRadius: 30, marginBottom: 20, opacity: 0.8 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  emptySubtitle: { fontSize: 14, color: COLORS.textTertiary, marginTop: 6 },
  
  // Experts Tab
  expertsContainer: { flex: 1, paddingHorizontal: SIZES.spacingLg, paddingTop: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: COLORS.text },
  trainerCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    ...SHADOWS.small,
  },
  tcImage: { width: 90, height: 90, borderRadius: 16, backgroundColor: COLORS.surface },
  tcContent: { flex: 1, marginLeft: 16, justifyContent: 'space-between', paddingVertical: 4 },
  tcName: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  tcRole: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600', marginTop: 2 },
  tcRatesRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tcRate: { fontSize: 20, fontWeight: '900', color: COLORS.primary },
  tcBookBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, gap: 4 },
  tcBookBtnText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  // Flow Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: SIZES.spacingXl, paddingTop: 20, paddingBottom: 0, maxHeight: '90%', ...SHADOWS.large, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, zIndex: 10 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width:0, height:1}, textShadowRadius: 3 },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  
  profileBannerContainer: { position: 'absolute', top: -80, left: -40, right: -40, height: 250, zIndex: 0 },
  profileBannerImg: { width: '100%', height: '100%', opacity: 0.6 },
  profileBannerOverlay: { position: 'absolute', width: '100%', height: '100%' },

  profileHeader: { alignItems: 'center', marginBottom: 24, zIndex: 1, marginTop: 20 },
  avatarGlow: { borderRadius: 60, ...SHADOWS.large, shadowColor: COLORS.primary },
  profileAvatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: COLORS.backgroundSecondary, marginBottom: 16 },
  profileName: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  profileRole: { fontSize: 14, color: COLORS.primary, fontWeight: '800', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  profileStats: { flexDirection: 'row', gap: 16, marginTop: 20 },
  pStat: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  pStatText: { fontSize: 13, fontWeight: '800', color: COLORS.text },
  profileSection: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', zIndex: 1 },
  profileSectionTitle: { fontSize: 12, fontWeight: '800', color: COLORS.primary, marginBottom: 8, letterSpacing: 1 },
  profileBio: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 22 },
  
  miniProfileRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, backgroundColor: COLORS.surface, padding: 10, borderRadius: 16 },
  backBtn: { padding: 8, marginRight: 8 },
  miniAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12 },
  miniName: { fontSize: 16, fontWeight: '800', color: COLORS.text },

  inputLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textTertiary, marginBottom: 12, letterSpacing: 1, marginTop: 10 },
  visualTypeChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 10, gap: 8 },
  visualTypeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  visualTypeChipText: { fontSize: 14, color: COLORS.textSecondary, fontWeight: '700' },
  visualTypeChipTextActive: { color: '#FFF' },
  
  dateCard: { width: 70, height: 86, borderRadius: 16, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, marginRight: 12 },
  dateCardActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dateDay: { fontSize: 11, color: COLORS.textTertiary, textTransform: 'uppercase', marginBottom: 4, fontWeight: '700' },
  dateNum: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  dateTextActive: { color: '#FFF' },
  
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  timeChip: { paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  timeChipActive: { backgroundColor: COLORS.primary + '20', borderColor: COLORS.primary },
  timeText: { fontSize: 14, color: COLORS.text, fontWeight: '600' },
  timeTextActive: { color: COLORS.primary, fontWeight: '800' },

  modalActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 60, borderRadius: 16, ...SHADOWS.medium },
  modalActionBtnText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
});
