import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Dimensions, RefreshControl, Modal, Image,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import SectionHeader from '../../components/SectionHeader';

const { width } = Dimensions.get('window');
const CHALLENGE_CARD_W = 270;

// ─── Base Configuration ───
const BASE_CHALLENGES = [
  { id: 1, name: 'Arm Blaster', body: 'Arms', days: 21, baseDay: 1, icon: 'barbell-outline' as const, colors: ['#FF6B2C', '#FF3D00'] as const, image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600' },
  { id: 2, name: 'Shoulder Sculpt', body: 'Shoulders', days: 14, baseDay: 1, icon: 'man-outline' as const, colors: ['#00D4FF', '#0091EA'] as const, image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600' },
  { id: 3, name: 'Leg Day Dominator', body: 'Legs', days: 30, baseDay: 1, icon: 'walk-outline' as const, colors: ['#00E676', '#00C853'] as const, image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=600' },
  { id: 4, name: 'Core Crusher', body: 'Core', days: 21, baseDay: 1, icon: 'fitness-outline' as const, colors: ['#A855F7', '#7C3AED'] as const, image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
  { id: 5, name: 'Chest Champion', body: 'Chest', days: 28, baseDay: 1, icon: 'body-outline' as const, colors: ['#FF5252', '#D50000'] as const, image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
];

const BODY_PARTS = [
  { name: 'Chest', icon: 'body-outline' as const, count: 5, color: '#FF5252', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=500' },
  { name: 'Back', icon: 'arrow-undo-outline' as const, count: 5, color: '#00D4FF', image: 'https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=500' },
  { name: 'Legs', icon: 'walk-outline' as const, count: 5, color: '#00E676', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=500' },
  { name: 'Shoulders', icon: 'man-outline' as const, count: 5, color: '#FFD740', image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=500' },
  { name: 'Arms', icon: 'barbell-outline' as const, count: 5, color: '#FF6B2C', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=500' },
  { name: 'Core', icon: 'fitness-outline' as const, count: 5, color: '#A855F7', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=500' },
];

const ALL_WORKOUTS = [
  { id: 1, name: 'Full Body Burn', duration: '45 min', level: 'Intermediate', exercises: 8, icon: 'flame-outline' as const, color: '#FF6B2C', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600' },
  { id: 2, name: 'Upper Body Power', duration: '35 min', level: 'Advanced', exercises: 6, icon: 'trending-up-outline' as const, color: '#00D4FF', image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600' },
  { id: 3, name: 'Cardio Blast', duration: '25 min', level: 'Beginner', exercises: 5, icon: 'heart-outline' as const, color: '#FF5252', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
  { id: 4, name: 'Core Foundations', duration: '20 min', level: 'Beginner', exercises: 4, icon: 'fitness-outline' as const, color: '#A855F7', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600' },
  { id: 5, name: 'HIIT Extreme', duration: '30 min', level: 'Advanced', exercises: 10, icon: 'flash-outline' as const, color: '#D50000', image: 'https://images.unsplash.com/photo-1554244933-d876deb6b2ff?q=80&w=600' },
  { id: 6, name: 'Leg Day Strength', duration: '40 min', level: 'Intermediate', exercises: 7, icon: 'walk-outline' as const, color: '#00E676', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=600' },
  { id: 7, name: 'Gentle Stretching', duration: '15 min', level: 'Beginner', exercises: 5, icon: 'body-outline' as const, color: '#00B0FF', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=600' },
  { id: 8, name: 'Push/Pull Dynamics', duration: '50 min', level: 'Advanced', exercises: 8, icon: 'barbell-outline' as const, color: '#FF3D00', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600' },
  { id: 9, name: 'Dumbbell Mastery', duration: '35 min', level: 'Intermediate', exercises: 6, icon: 'barbell-outline' as const, color: '#FFD740', image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=600' },
  { id: 10, name: 'Quick Morning Sweat', duration: '15 min', level: 'Beginner', exercises: 4, icon: 'sunny-outline' as const, color: '#FFB300', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600' },
  { id: 11, name: 'Elite Conditioning', duration: '60 min', level: 'Advanced', exercises: 12, icon: 'trophy-outline' as const, color: '#6200EA', image: 'https://images.unsplash.com/photo-1526506114642-9907c0303e35?q=80&w=600' },
  { id: 12, name: 'Functional Core', duration: '25 min', level: 'Intermediate', exercises: 6, icon: 'shield-outline' as const, color: '#00BFA5', image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600' },
];

const WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function MemberDashboard() {
  const navigation = useNavigation<any>();
  const { user, dashboardStats, notifications, unreadCount, refreshDashboard, refreshBookings } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [streakVisible, setStreakVisible] = useState(false);
  const [membershipTip, setMembershipTip] = useState(false);
  
  // Real progress state
  const [challenges, setChallenges] = useState<any[]>(BASE_CHALLENGES);
  const [recommendedWorkouts, setRecommendedWorkouts] = useState<any[]>([]);

  const refreshRecommended = useCallback(() => {
    // Determine difficulty based on user's total workouts
    const workoutsCount = dashboardStats?.total_workouts || user?.totalWorkouts || 0;
    let userLevel = 'Beginner';
    if (workoutsCount >= 20) userLevel = 'Advanced';
    else if (workoutsCount >= 5) userLevel = 'Intermediate';

    // Filter by user's difficulty level
    let pool = ALL_WORKOUTS.filter(w => w.level === userLevel);
    
    // If not enough workouts for the level, mix in others
    if (pool.length < 3) {
      pool = ALL_WORKOUTS;
    }
    
    // Shuffle the pool and pick top 3
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    setRecommendedWorkouts(shuffled.slice(0, 3));
  }, [dashboardStats?.total_workouts, user?.totalWorkouts]);

  // Load progress when screen focuses
  useFocusEffect(
    useCallback(() => {
      const loadProgress = async () => {
        try {
          const stored = await AsyncStorage.getItem('challengeProgress');
          const progressMap = stored ? JSON.parse(stored) : {};
          
          const updatedChallenges = BASE_CHALLENGES.map(ch => ({
            ...ch,
            // If there's saved progress, use it, otherwise use baseDay (1)
            currentDay: progressMap[ch.id] || ch.baseDay
          }));
          
          setChallenges(updatedChallenges);
        } catch (e) {}
      };
      loadProgress();
      refreshRecommended();
    }, [refreshRecommended])
  );

  const streak = dashboardStats?.current_streak || user?.currentStreak || 5;
  const daysRemaining = user?.membershipDaysRemaining || 49;

  // Mock weekly completion (which days this week were completed)
  const weekCompleted = [true, true, false, true, true, false, false];

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
      // Reload challenges
      const stored = await AsyncStorage.getItem('challengeProgress');
      const progressMap = stored ? JSON.parse(stored) : {};
      setChallenges(BASE_CHALLENGES.map(ch => ({ ...ch, currentDay: progressMap[ch.id] || ch.baseDay })));
      refreshRecommended();
    } catch (e) { /* ignore */ }
    setRefreshing(false);
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
        {/* ─── Header ─── */}
        <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={{ flex: 1 }}>
              <Text style={styles.greeting}>{greeting()}</Text>
              <Text style={styles.userName}>{user?.name || 'Member'}</Text>
            </View>
            <View style={styles.headerIcons}>
              {/* Membership Icon */}
              <TouchableOpacity style={styles.headerBtn} onPress={() => setMembershipTip(!membershipTip)}>
                <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
              </TouchableOpacity>
              {/* Streak Fire Icon */}
              <TouchableOpacity style={styles.headerBtn} onPress={() => setStreakVisible(true)}>
                <Ionicons name="flame" size={20} color={COLORS.primary} />
                {streak > 0 && (
                  <View style={styles.streakMini}>
                    <Text style={styles.streakMiniText}>{streak}</Text>
                  </View>
                )}
              </TouchableOpacity>
              {/* Notification Bell */}
              <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate('Notifications')}>
                <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
                {unreadCount > 0 && (
                  <View style={styles.notifBadge}><Text style={styles.notifBadgeText}>{unreadCount}</Text></View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Membership Tooltip */}
          {membershipTip && (
            <TouchableOpacity style={styles.membershipTooltip} activeOpacity={0.9} onPress={() => setMembershipTip(false)}>
              <View style={styles.tooltipArrow} />
              <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
              <View style={{ marginLeft: 8, flex: 1 }}>
                <Text style={styles.tooltipTitle}>{user?.membershipType || 'Premium'} — Active</Text>
                <Text style={styles.tooltipSub}>{daysRemaining} days remaining</Text>
              </View>
              <Ionicons name="close" size={14} color={COLORS.textTertiary} />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* ─── Challenges Carousel ─── */}
        <View style={styles.section}>
          <SectionHeader title="Challenges" icon="trophy" actionText="See All" onAction={() => {}} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.carouselContent}>
            {challenges.map((ch) => {
              const pct = Math.round((ch.currentDay / ch.days) * 100);
              return (
                <TouchableOpacity key={ch.id} activeOpacity={0.85} onPress={() => navigation.navigate('ChallengeDetail', { challenge: ch })}>
                  <View style={[styles.challengeCard, { backgroundColor: COLORS.surface }]}>
                    <Image source={{ uri: ch.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                    <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFillObject} />
                    
                    <View style={styles.challengeTop}>
                      <View style={[styles.challengeIconBox, { backgroundColor: ch.colors[0] }]}>
                        <Ionicons name={ch.icon} size={22} color="#FFF" />
                      </View>
                      <View style={styles.challengeDaysBadge}>
                        <Text style={styles.challengeDaysText}>{ch.days} Days</Text>
                      </View>
                    </View>
                    <Text style={styles.challengeName}>{ch.name}</Text>
                    <Text style={styles.challengeBody}>{ch.body} Focus</Text>
                    {/* Progress */}
                    <View style={styles.challengeProgressBg}>
                      <View style={[styles.challengeProgressFill, { width: `${pct}%`, backgroundColor: ch.colors[0] }]} />
                    </View>
                    <View style={styles.challengeBottom}>
                      <Text style={styles.challengeProgressText}>Day {ch.currentDay} of {ch.days}</Text>
                      <Text style={styles.challengePct}>{pct}%</Text>
                    </View>
                    <TouchableOpacity style={[styles.challengeBtn, { backgroundColor: ch.colors[0] }]} activeOpacity={0.8} onPress={() => navigation.navigate('ChallengeDetail', { challenge: ch })}>
                      <Text style={styles.challengeBtnText}>{ch.currentDay > 0 ? 'Continue' : 'Start'}</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* ─── Body Focus ─── */}
        <View style={styles.section}>
          <SectionHeader title="Body Focus" icon="body" actionText="See All" onAction={() => navigation.navigate('ExerciseLibrary')} />
          <View style={styles.bodyGrid}>
            {BODY_PARTS.map((part) => (
              <TouchableOpacity
                key={part.name}
                style={[styles.bodyCard, { overflow: 'hidden' }]}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('ExerciseLibrary', { category: part.name })}
              >
                <Image source={{ uri: part.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFillObject} />
                <View style={[styles.bodyIconBox, { backgroundColor: part.color }]}>
                  <Ionicons name={part.icon} size={20} color="#FFF" />
                </View>
                <Text style={styles.bodyName}>{part.name}</Text>
                <Text style={styles.bodyCount}>{part.count} exercises</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ─── Create Your Own Workout ─── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.createCard}
            activeOpacity={0.85}
            onPress={() => navigation.getParent()?.navigate('Workout')}
          >
            <LinearGradient colors={[COLORS.primary + '30', COLORS.primaryDark + '15']} style={styles.createGradient}>
              <View style={styles.createLeft}>
                <View style={styles.createIconBox}>
                  <Ionicons name="add-circle" size={28} color={COLORS.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.createTitle}>Create Your Own Workout</Text>
                  <Text style={styles.createSub}>Pick exercises, set reps & rest times</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* ─── Just For You ─── */}
        <View style={styles.section}>
          <SectionHeader title="Just For You" icon="sparkles" actionText="Refresh" onAction={refreshRecommended} />
          {recommendedWorkouts.map((rec) => (
            <TouchableOpacity key={rec.id} style={styles.jfyCard} activeOpacity={0.85}>
              <Image source={{ uri: rec.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.85)']} style={StyleSheet.absoluteFillObject} />
              
              <View style={styles.jfyContent}>
                <View style={styles.jfyTop}>
                  <View style={[styles.jfyBadge, { backgroundColor: rec.color }]}>
                    <Ionicons name={rec.icon} size={14} color="#FFF" />
                    <Text style={styles.jfyBadgeText}>{rec.level}</Text>
                  </View>
                  <View style={[styles.jfyPlayBtn, { backgroundColor: rec.color + '80' }]}>
                    <Ionicons name="play" size={18} color="#FFF" />
                  </View>
                </View>
                
                <View style={styles.jfyBottom}>
                  <Text style={styles.jfyTitle}>{rec.name}</Text>
                  <View style={styles.jfyMeta}>
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.jfyMetaText}>{rec.duration}</Text>
                    <View style={styles.jfyDot} />
                    <Ionicons name="barbell-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.jfyMetaText}>{rec.exercises} exercises</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Titans Shop ─── */}
        <View style={styles.section}>
          <SectionHeader title="Titans Shop" icon="cart" actionText="Browse All" onAction={() => navigation.navigate('MemberShop')} />
          <TouchableOpacity style={styles.shopBanner} onPress={() => navigation.navigate('MemberShop')} activeOpacity={0.9}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1593079831268-3381b0c13d39?q=80&w=800' }} style={styles.shopBannerBg} />
            <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.85)']} style={styles.shopOverlay}>
              <View style={{ flex: 1 }}>
                <Text style={styles.shopTitle}>Shop Supplements & Gear</Text>
                <Text style={styles.shopSub}>Fuel your workout. Order now & pick up at the gym.</Text>
              </View>
              <View style={styles.shopIconBox}>
                <Ionicons name="arrow-forward" size={20} color="#FFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={{ height: SIZES.tabBarHeight + 30 }} />
      </ScrollView>

      {/* ─── Streak Modal ─── */}
      <Modal visible={streakVisible} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setStreakVisible(false)}>
          <TouchableOpacity style={styles.streakModal} activeOpacity={1}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.streakTop}>
              <Ionicons name="flame" size={48} color="#FFF" />
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak 🔥</Text>
              <View style={styles.decorCircle1} />
              <View style={styles.decorCircle2} />
            </LinearGradient>
            <View style={styles.streakBody}>
              <Text style={styles.streakWeekTitle}>This Week</Text>
              <View style={styles.weekRow}>
                {WEEK_DAYS.map((day, i) => (
                  <View key={i} style={styles.weekDay}>
                    <View style={[
                      styles.weekCircle,
                      weekCompleted[i] ? styles.weekCircleDone : styles.weekCircleEmpty,
                    ]}>
                      {weekCompleted[i] && <Ionicons name="checkmark" size={14} color="#FFF" />}
                    </View>
                    <Text style={[styles.weekDayText, weekCompleted[i] && { color: COLORS.primary }]}>{day}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.streakStats}>
                <View style={styles.streakStatItem}>
                  <Text style={styles.streakStatVal}>{dashboardStats?.total_workouts || 0}</Text>
                  <Text style={styles.streakStatLabel}>Total Workouts</Text>
                </View>
                <View style={styles.streakStatDivider} />
                <View style={styles.streakStatItem}>
                  <Text style={styles.streakStatVal}>{streak}</Text>
                  <Text style={styles.streakStatLabel}>Best Streak</Text>
                </View>
              </View>
              <Text style={styles.streakMotivation}>Keep the fire burning! 💪</Text>
            </View>
            <TouchableOpacity style={styles.streakClose} onPress={() => setStreakVisible(false)}>
              <Text style={styles.streakCloseText}>Got it!</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  // Header
  header: { paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingBase },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: 4 },
  userName: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  headerIcons: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 42, height: 42, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  streakMini: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.primary, width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  streakMiniText: { fontSize: 9, fontWeight: '800', color: '#FFF' },
  notifBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: COLORS.danger, width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  notifBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
  // Membership Tooltip
  membershipTooltip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: 12, marginTop: 12, borderWidth: 1, borderColor: COLORS.success + '30' },
  tooltipArrow: { position: 'absolute', top: -6, right: 100, width: 12, height: 12, backgroundColor: COLORS.surface, transform: [{ rotate: '45deg' }], borderTopWidth: 1, borderLeftWidth: 1, borderColor: COLORS.success + '30' },
  tooltipTitle: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  tooltipSub: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  // Section
  section: { paddingHorizontal: SIZES.spacingLg, marginTop: SIZES.spacingXl },
  // Challenges Carousel
  carouselContent: { paddingRight: SIZES.spacingLg, gap: 14 },
  challengeCard: { width: CHALLENGE_CARD_W, borderRadius: SIZES.radiusXl, padding: SIZES.spacingLg, overflow: 'hidden' },
  challengeTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  challengeIconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  challengeDaysBadge: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  challengeDaysText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  challengeName: { fontSize: SIZES.lg, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  challengeBody: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 14 },
  challengeProgressBg: { height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.25)', marginBottom: 6 },
  challengeProgressFill: { height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  challengeBottom: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  challengeProgressText: { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  challengePct: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  challengeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.25)', paddingVertical: 8, borderRadius: SIZES.radiusMd },
  challengeBtnText: { fontSize: SIZES.sm, fontWeight: '700', color: '#FFF' },
  decorCircle1: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.06)', top: -20, right: -20 },
  decorCircle2: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -10, left: 30 },
  // Body Focus
  bodyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacingMd },
  bodyCard: { width: (width - SIZES.spacingLg * 2 - SIZES.spacingMd * 2) / 3, alignItems: 'center', paddingVertical: SIZES.spacingLg, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder },
  bodyIconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  bodyName: { fontSize: SIZES.sm, fontWeight: '800', color: '#FFF', marginBottom: 2 },
  bodyCount: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  // Create Workout
  createCard: { borderRadius: SIZES.radiusLg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.primary + '30' },
  createGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacingLg },
  createLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  createIconBox: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  createTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  createSub: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  // Recommended
  jfyCard: { height: 160, borderRadius: SIZES.radiusLg, overflow: 'hidden', marginBottom: SIZES.spacingMd },
  jfyContent: { flex: 1, padding: SIZES.spacingLg, justifyContent: 'space-between' },
  jfyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  jfyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  jfyBadgeText: { fontSize: 11, fontWeight: '800', color: '#FFF' },
  jfyPlayBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  jfyBottom: { gap: 6 },
  jfyTitle: { fontSize: SIZES.xl, fontWeight: '800', color: '#FFF' },
  jfyMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jfyMetaText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  jfyDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' },

  shopBanner: { marginHorizontal: 20, height: 130, borderRadius: 20, overflow: 'hidden', ...SHADOWS.medium },
  shopBannerBg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  shopOverlay: { flex: 1, padding: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  shopTitle: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  shopSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, maxWidth: '90%' },
  shopIconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },

  // Streak Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', padding: SIZES.spacingXl },
  streakModal: { width: '100%', maxWidth: 340, borderRadius: SIZES.radiusXl, overflow: 'hidden', backgroundColor: COLORS.backgroundSecondary },
  streakTop: { alignItems: 'center', paddingVertical: 28, overflow: 'hidden' },
  streakNumber: { fontSize: 56, fontWeight: '900', color: '#FFF', marginTop: 4 },
  streakLabel: { fontSize: SIZES.lg, fontWeight: '600', color: 'rgba(255,255,255,0.9)' },
  streakBody: { padding: SIZES.spacingXl },
  streakWeekTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 14, textAlign: 'center' },
  weekRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  weekDay: { alignItems: 'center', gap: 6 },
  weekCircle: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  weekCircleDone: { backgroundColor: COLORS.primary },
  weekCircleEmpty: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  weekDayText: { fontSize: 11, fontWeight: '600', color: COLORS.textTertiary },
  streakStats: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginBottom: 16 },
  streakStatItem: { alignItems: 'center' },
  streakStatVal: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  streakStatLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  streakStatDivider: { width: 1, backgroundColor: COLORS.border },
  streakMotivation: { fontSize: SIZES.md, color: COLORS.textSecondary, textAlign: 'center' },
  streakClose: { backgroundColor: COLORS.primary, margin: SIZES.spacingLg, marginTop: 0, paddingVertical: 14, borderRadius: SIZES.radiusMd, alignItems: 'center' },
  streakCloseText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
});
