import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Modal, TextInput, Alert, RefreshControl, ImageBackground, Image, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import SectionHeader from '../../components/SectionHeader';
import { socialApi } from '../../services/api';
import { useNavigation } from '@react-navigation/native';

type TabType = 'progress' | 'activities';

export default function MemberProgress() {
  const navigation = useNavigation<any>();
  const { user, progressEntries, addProgressEntry, refreshProgress, activities = [], refreshActivities, addActivity, updateActivityPhoto } = useApp();
  const [activeTab, setActiveTab] = useState<TabType>('progress');
  const [refreshing, setRefreshing] = useState(false);
  
  // Progress Modals
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');

  // Advanced Calculator State
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcActivity, setCalcActivity] = useState<'lifting' | 'running' | 'cycling' | 'swimming'>('lifting');
  const [calcDuration, setCalcDuration] = useState('60');
  const [calcWeightInput, setCalcWeightInput] = useState('');


  // Activities State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActType, setNewActType] = useState('Strength Training');
  const [newActDuration, setNewActDuration] = useState('');
  const [newActNotes, setNewActNotes] = useState('');
  const [newActPhoto, setNewActPhoto] = useState<string | null>(null);

  // Comment State
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  // Derived Progress Stats
  const sorted = [...progressEntries].sort((a, b) => b.date.localeCompare(a.date));
  const latestWeight = sorted[0]?.weight || '--';
  const weightChange = sorted.length > 1 ? (sorted[0].weight - sorted[1].weight).toFixed(1) : '0';
  const bmi = user?.height && sorted[0]?.weight ? (sorted[0].weight / ((user.height / 100) ** 2)) : 0;

  // Derived Activity Stats (Dynamic)
  const sortedActivities = [...activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Calculate this week's stats
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thisWeekActs = sortedActivities.filter(a => new Date(a.date) >= oneWeekAgo);
  
  const weeklySessions = thisWeekActs.length;
  const weeklyHours = (thisWeekActs.reduce((sum, a) => sum + (a.duration || 0), 0) / 60).toFixed(1);
  const weeklyKcal = thisWeekActs.reduce((sum, a) => sum + ((a.duration || 0) * 8), 0); // Rough estimate: 8 kcal/min

  // Mock Calendar & Streak based on real data
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Simple active days calculation (last 7 days)
  const activeDays = daysOfWeek.map((_, i) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (6 - i));
    const targetDayStr = targetDate.toISOString().split('T')[0];
    return sortedActivities.some(a => a.date.startsWith(targetDayStr));
  });

  // Calculate streak (consecutive days)
  let currentStreak = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    if (sortedActivities.some(a => a.date.startsWith(dateStr))) {
      currentStreak++;
    } else if (i > 0) { // allow missing today
      break;
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refreshProgress(); } catch (e) {}
    setRefreshing(false);
  };

  const handleAddWeight = async () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) { Alert.alert('Error', 'Enter valid weight'); return; }
    try {
      await addProgressEntry({ weight: w, body_fat_percentage: parseFloat(newBodyFat) || undefined });
      setShowWeightModal(false);
      setNewWeight(''); setNewBodyFat('');
      Alert.alert('Logged! 💪', 'Weight tracked successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to log');
    }
  };

  const pickImage = async (activityId?: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled) {
      if (activityId) {
        await updateActivityPhoto(activityId, result.assets[0].uri);
        Alert.alert('Success', 'Activity photo updated!');
      } else {
        setNewActPhoto(result.assets[0].uri);
      }
    }
  };

  const handleAddActivity = async () => {
    if (!newActDuration) { Alert.alert('Error', 'Enter duration'); return; }
    await addActivity({
      type: newActType,
      duration: parseInt(newActDuration),
      date: new Date().toISOString(),
      photoUri: newActPhoto,
      notes: newActNotes
    });
    setShowActivityModal(false);
    setNewActDuration(''); setNewActNotes(''); setNewActPhoto(null);
  };

  const handleToggleLike = async (id: number) => {
    try {
      await socialApi.toggleLike(id);
      await refreshActivities();
    } catch (e) {
      console.log(e);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !activeCommentId) return;
    try {
      await socialApi.addComment(activeCommentId, commentText.trim());
      setCommentText('');
      setShowCommentModal(false);
      setActiveCommentId(null);
      await refreshActivities();
    } catch (e) {
      console.log(e);
    }
  };

  // Advanced Calculator Logic
  const calculateMetrics = () => {
    const w = parseFloat(calcWeightInput) || parseFloat(latestWeight as string) || 70;
    const d = parseFloat(calcDuration) || 0;
    
    // MET Values
    const mets = {
      lifting: 3.5,
      running: 9.8,
      cycling: 7.5,
      swimming: 8.3
    };
    
    const met = mets[calcActivity];
    const caloriesBurned = Math.round((met * w * d) / 60);
    
    // Basic Max HR formula: 220 - age (mock age to 30 if undefined)
    const age = user?.age || 30;
    const maxHR = 220 - age;
    const targetHRMin = Math.round(maxHR * 0.5); // 50%
    const targetHRMax = Math.round(maxHR * 0.7); // 70% (Fat burn zone)

    return { caloriesBurned, targetHRMin, targetHRMax };
  };

  const calcResults = calculateMetrics();

  const renderProgressTab = () => (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}>
      
      {/* This Week Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>THIS WEEK</Text>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FFF" />
            <Text style={styles.streakText}>{currentStreak} Day Streak</Text>
          </View>
        </View>
        
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{weeklyHours}<Text style={styles.statUnit}>hrs</Text></Text>
            <Text style={styles.statLab}>TRAINED</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{weeklySessions}</Text>
            <Text style={styles.statLab}>SESSIONS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{weeklyKcal}</Text>
            <Text style={styles.statLab}>KCAL</Text>
          </View>
        </View>

        {/* Mini Calendar Row */}
        <View style={styles.calRow}>
          {daysOfWeek.map((day, i) => (
            <View key={day} style={styles.calDay}>
              <Text style={styles.calDayText}>{day}</Text>
              <View style={[styles.calDot, activeDays[i] && styles.calDotActive]} />
            </View>
          ))}
        </View>
      </View>

      <SectionHeader title="Body Metrics" />
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Ionicons name="scale" size={24} color={COLORS.primary} />
          <Text style={styles.metricVal}>{latestWeight} kg</Text>
          <Text style={styles.metricLab}>CURRENT WEIGHT</Text>
          <View style={[styles.trendBadge, { backgroundColor: parseFloat(weightChange) <= 0 ? COLORS.success + '20' : COLORS.danger + '20' }]}>
            <Ionicons name={parseFloat(weightChange) <= 0 ? 'trending-down' : 'trending-up'} size={12} color={parseFloat(weightChange) <= 0 ? COLORS.success : COLORS.danger} />
            <Text style={[styles.trendText, { color: parseFloat(weightChange) <= 0 ? COLORS.success : COLORS.danger }]}>{weightChange} kg</Text>
          </View>
        </View>
        <View style={styles.metricCard}>
          <Ionicons name="body" size={24} color={COLORS.accent} />
          <Text style={styles.metricVal}>{bmi ? bmi.toFixed(1) : '--'}</Text>
          <Text style={styles.metricLab}>CURRENT BMI</Text>
          <TouchableOpacity style={styles.updateBtn} onPress={() => setShowWeightModal(true)}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Advanced Calculator Button */}
      <TouchableOpacity style={styles.calcPromoBtn} activeOpacity={0.8} onPress={() => {
        setCalcWeightInput(latestWeight !== '--' ? String(latestWeight) : '70');
        setShowCalcModal(true);
      }}>
        <LinearGradient colors={[COLORS.accent, '#FF8C00']} style={styles.calcPromoGrad} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
          <View style={{ flex: 1 }}>
            <Text style={styles.calcPromoTitle}>Advanced Calculator</Text>
            <Text style={styles.calcPromoSub}>Estimate calories burned & target heart rates</Text>
          </View>
          <Ionicons name="calculator" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Weight Trend Chart */}
      {sorted.length >= 2 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight Trend</Text>
          <WeightChart entries={sorted.slice(0, 7).reverse()} />
        </View>
      )}

      {/* History List */}
      <SectionHeader title="Weight History" />
      {sorted.map((item) => (
        <View key={item.id} style={styles.historyItem}>
          <View style={styles.historyDate}>
            <Text style={styles.historyDay}>{new Date(item.date).getDate()}</Text>
            <Text style={styles.historyMonth}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
          </View>
          <View style={styles.historyContent}>
            <Text style={styles.historyValue}>{item.weight} kg</Text>
            {item.bodyFat !== undefined && <Text style={styles.historyNote}>{item.bodyFat}% Body Fat</Text>}
          </View>
        </View>
      ))}
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  const renderActivitiesTab = () => (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Achievements */}
        <SectionHeader title="Achievements" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementsRow}>
          {[
            { id: 1, icon: 'trophy', color: '#FFD700', label: 'First Workout' },
            { id: 2, icon: 'flame', color: '#FF4500', label: '3 Day Streak' },
            { id: 3, icon: 'barbell', color: COLORS.primary, label: 'Heavy Lifter' },
            { id: 4, icon: 'star', color: '#C0C0C0', label: 'Consistent', locked: true },
          ].map(badge => (
            <View key={badge.id} style={[styles.badgeCard, badge.locked && styles.badgeLocked]}>
              <View style={[styles.badgeIconBg, { backgroundColor: badge.locked ? COLORS.surface : badge.color + '20' }]}>
                <Ionicons name={badge.icon as any} size={28} color={badge.locked ? COLORS.textTertiary : badge.color} />
              </View>
              <Text style={styles.badgeLabel}>{badge.label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.feedHeader}>
          <SectionHeader title="Activity Feed" />
          <TouchableOpacity style={styles.addActBtn} onPress={() => setShowActivityModal(true)}>
            <Ionicons name="add" size={16} color="#FFF" />
            <Text style={styles.addActText}>Post</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Feed */}
        {sortedActivities.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="body-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No activities yet</Text>
            <Text style={styles.emptySub}>Complete a workout to see it here!</Text>
          </View>
        )}
        {sortedActivities.map((act: any) => (
          <View key={act.id} style={styles.actCard}>
            <TouchableOpacity style={styles.actHeader} activeOpacity={0.8} onPress={() => navigation.navigate('Profile', { screen: 'PublicProfile', params: { userId: act.userId } })}>
              {act.userAvatar ? (
                <Image source={{ uri: act.userAvatar }} style={{ width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border }} />
              ) : (
                <View style={styles.actAvatar}><Ionicons name="person" size={16} color={COLORS.primary} /></View>
              )}
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: COLORS.text }}>{act.userName || user?.name}</Text>
                <Text style={styles.actType}>{act.title || act.type}</Text>
                <Text style={styles.actTime}>{new Date(act.date).toLocaleDateString()} • {act.duration} mins</Text>
              </View>
            </TouchableOpacity>
            {act.notes && <Text style={styles.actNotes}>{act.notes}</Text>}
            {act.photoUri ? (
              <TouchableOpacity activeOpacity={0.9} onPress={() => pickImage(act.id)}>
                <Image source={{ uri: act.photoUri }} style={styles.actPhoto} />
                {act.userId === user?.id && (
                  <View style={styles.editPhotoOverlay}>
                    <Ionicons name="camera" size={16} color="#FFF" />
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              act.userId === user?.id && (
                <TouchableOpacity style={styles.addPhotoBtn} onPress={() => pickImage(act.id)}>
                  <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )
            )}
            <View style={styles.actActions}>
              <TouchableOpacity style={styles.actActionBtn} onPress={() => handleToggleLike(act.id)}>
                <Ionicons name={act.isLiked ? "heart" : "heart-outline"} size={20} color={act.isLiked ? COLORS.danger : COLORS.textSecondary} />
                <Text style={[styles.actActionText, act.isLiked && { color: COLORS.danger }]}>{act.likes > 0 ? act.likes : 'Like'}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actActionBtn, { marginLeft: 20 }]} onPress={() => { setActiveCommentId(act.id); setShowCommentModal(true); }}>
                <Ionicons name="chatbox-outline" size={20} color={COLORS.textSecondary} />
                <Text style={styles.actActionText}>{act.comments?.length > 0 ? act.comments.length : 'Comment'}</Text>
              </TouchableOpacity>
              
              {act.userId !== user?.id && (
                <TouchableOpacity style={[styles.actActionBtn, { marginLeft: 'auto' }]} onPress={() => navigation.navigate('Profile', { screen: 'CommunityMessages', params: { friendId: act.userId, friendName: act.userName, friendAvatar: act.userAvatar } })}>
                  <Ionicons name="chatbubble-outline" size={20} color={COLORS.textSecondary} />
                  <Text style={styles.actActionText}>Message</Text>
                </TouchableOpacity>
              )}
            </View>

            {act.comments && act.comments.length > 0 && (
              <View style={styles.commentsSection}>
                {act.comments.slice(0, 2).map((c: any) => (
                  <View key={c.id} style={styles.commentRow}>
                    <Text style={styles.commentUser}>{c.userName}:</Text>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                ))}
                {act.comments.length > 2 && (
                  <TouchableOpacity onPress={() => { setActiveCommentId(act.id); setShowCommentModal(true); }}>
                    <Text style={styles.viewAllComments}>View all {act.comments.length} comments</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Immersive Header */}
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1470&auto=format&fit=crop' }} 
        style={styles.immersiveHeaderBg}
      >
        <LinearGradient colors={['rgba(0,0,0,0.5)', COLORS.background]} style={styles.immersiveHeaderGradient}>
          <Text style={styles.headerTitle}>Progress</Text>
          
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'progress' && styles.tabBtnActive]} onPress={() => setActiveTab('progress')}>
              <Text style={[styles.tabText, activeTab === 'progress' && styles.tabTextActive]}>Metrics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tabBtn, activeTab === 'activities' && styles.tabBtnActive]} onPress={() => setActiveTab('activities')}>
              <Text style={[styles.tabText, activeTab === 'activities' && styles.tabTextActive]}>Activities</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </ImageBackground>

      {activeTab === 'progress' ? renderProgressTab() : renderActivitiesTab()}

      {/* Add Weight Modal */}
      <Modal visible={showWeightModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Body Metrics</Text>
              <TouchableOpacity onPress={() => setShowWeightModal(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. 75.5" placeholderTextColor={COLORS.textMuted} value={newWeight} onChangeText={setNewWeight} keyboardType="decimal-pad" />

            <Text style={styles.inputLabel}>BODY FAT % (OPTIONAL)</Text>
            <TextInput style={styles.modalInput} placeholder="e.g. 15.2" placeholderTextColor={COLORS.textMuted} value={newBodyFat} onChangeText={setNewBodyFat} keyboardType="decimal-pad" />

            <TouchableOpacity onPress={handleAddWeight} activeOpacity={0.8} style={{ marginTop: 20 }}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalActionBtn}>
                <Text style={styles.modalActionBtnText}>Save Metrics</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </Modal>

      {/* Add Activity Modal */}
      <Modal visible={showActivityModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Workout</Text>
              <TouchableOpacity onPress={() => setShowActivityModal(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={styles.inputLabel}>PHOTO / PROOF</Text>
              <TouchableOpacity style={styles.photoUploadBtn} onPress={() => pickImage()}>
                {newActPhoto ? (
                  <Image source={{ uri: newActPhoto }} style={styles.uploadedPhoto} />
                ) : (
                  <>
                    <Ionicons name="camera" size={32} color={COLORS.primary} />
                    <Text style={styles.photoUploadText}>Add a photo</Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={styles.inputLabel}>WORKOUT TYPE</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Strength Training" placeholderTextColor={COLORS.textMuted} value={newActType} onChangeText={setNewActType} />

              <Text style={styles.inputLabel}>DURATION (MINS)</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. 60" placeholderTextColor={COLORS.textMuted} value={newActDuration} onChangeText={setNewActDuration} keyboardType="number-pad" />

              <Text style={styles.inputLabel}>HOW DID IT FEEL?</Text>
              <TextInput style={[styles.modalInput, { height: 80 }]} placeholder="Share your experience..." placeholderTextColor={COLORS.textMuted} value={newActNotes} onChangeText={setNewActNotes} multiline />

              <TouchableOpacity onPress={handleAddActivity} activeOpacity={0.8} style={{ marginTop: 20, marginBottom: 40 }}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalActionBtn}>
                  <Text style={styles.modalActionBtnText}>Post Activity</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      {/* Advanced Calculator Modal */}
      <Modal visible={showCalcModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Metric Calculator</Text>
              <TouchableOpacity onPress={() => setShowCalcModal(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              
              <Text style={styles.inputLabel}>ACTIVITY TYPE</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                {[
                  { key: 'lifting', label: 'Weight Lifting', icon: 'barbell' },
                  { key: 'running', label: 'Running', icon: 'walk' },
                  { key: 'cycling', label: 'Cycling', icon: 'bicycle' },
                  { key: 'swimming', label: 'Swimming', icon: 'water' }
                ].map(act => (
                  <TouchableOpacity key={act.key} 
                    style={[styles.calcTypeChip, calcActivity === act.key && styles.calcTypeChipActive]}
                    onPress={() => setCalcActivity(act.key as any)}>
                    <Ionicons name={act.icon as any} size={16} color={calcActivity === act.key ? '#FFF' : COLORS.textTertiary} />
                    <Text style={[styles.calcTypeText, calcActivity === act.key && styles.calcTypeTextActive]}>{act.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={{ flexDirection: 'row', gap: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>DURATION (MINS)</Text>
                  <TextInput style={styles.modalInput} value={calcDuration} onChangeText={setCalcDuration} keyboardType="number-pad" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>WEIGHT (KG)</Text>
                  <TextInput style={styles.modalInput} value={calcWeightInput} onChangeText={setCalcWeightInput} keyboardType="decimal-pad" />
                </View>
              </View>

              {/* Live Results Panel */}
              <View style={styles.calcResultsPanel}>
                <View style={styles.calcResultBox}>
                  <Ionicons name="flame" size={24} color="#FF4500" />
                  <Text style={styles.calcResultVal}>{calcResults.caloriesBurned}</Text>
                  <Text style={styles.calcResultLab}>EST. KCAL BURNED</Text>
                </View>
                <View style={styles.calcResultDivider} />
                <View style={styles.calcResultBox}>
                  <Ionicons name="heart" size={24} color={COLORS.primary} />
                  <Text style={styles.calcResultVal}>{calcResults.targetHRMin}-{calcResults.targetHRMax}</Text>
                  <Text style={styles.calcResultLab}>TARGET HR (FAT BURN)</Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setShowCalcModal(false)} activeOpacity={0.8} style={{ marginTop: 10, marginBottom: 40 }}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalActionBtn}>
                  <Text style={styles.modalActionBtnText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

      {/* Add Comment Modal */}
      <Modal visible={showCommentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setShowCommentModal(false)} style={styles.modalCloseBtn}><Ionicons name="close" size={20} color={COLORS.text} /></TouchableOpacity>
            </View>
            
            <ScrollView style={{ maxHeight: 300, marginBottom: 16 }} showsVerticalScrollIndicator={false}>
              {activeCommentId && activities.find(a => a.id === activeCommentId)?.comments?.map((c: any) => (
                <View key={c.id} style={{ flexDirection: 'row', marginBottom: 12 }}>
                  <Image source={{ uri: c.userAvatar || 'https://via.placeholder.com/150' }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 10 }} />
                  <View style={{ flex: 1, backgroundColor: COLORS.surface, padding: 12, borderRadius: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.text }}>{c.userName}</Text>
                      <Text style={{ fontSize: 10, color: COLORS.textTertiary }}>{c.time}</Text>
                    </View>
                    <Text style={{ fontSize: 14, color: COLORS.textSecondary, marginTop: 4 }}>{c.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 8, marginBottom: 20 }}>
              <TextInput style={{ flex: 1, color: COLORS.text, fontSize: 15 }} placeholder="Add a comment..." placeholderTextColor={COLORS.textTertiary} value={commentText} onChangeText={setCommentText} />
              <TouchableOpacity onPress={handleAddComment} disabled={!commentText.trim()} style={{ backgroundColor: commentText.trim() ? COLORS.primary : COLORS.border, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="send" size={16} color="#FFF" style={{ marginLeft: 2 }} />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

    </View>
  );
}

// ── WeightChart Component ── (pure RN, no extra library needed)
function WeightChart({ entries }: { entries: any[] }) {
  const { width } = Dimensions.get('window');
  const chartWidth = width - 80; // minus horizontal padding
  const chartHeight = 90;
  const padding = 8;

  if (!entries || entries.length < 2) return null;

  const weights = entries.map(e => parseFloat(e.weight));
  const min = Math.min(...weights) - 1;
  const max = Math.max(...weights) + 1;
  const range = max - min || 1;

  const points = weights.map((w, i) => ({
    x: padding + (i / (entries.length - 1)) * (chartWidth - padding * 2),
    y: chartHeight - padding - ((w - min) / range) * (chartHeight - padding * 2),
  }));

  const accent = COLORS.primary;

  return (
    <View style={{ width: chartWidth, height: chartHeight + 36, position: 'relative' }}>
      {/* Dotted baseline */}
      <View style={{ position: 'absolute', bottom: 36, left: padding, right: padding, height: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderStyle: 'dashed' }} />

      {/* Bars (gradient columns) */}
      {points.map((pt, i) => {
        const barH = Math.max(4, chartHeight - padding - pt.y);
        return (
          <View key={i} style={{
            position: 'absolute',
            bottom: 36,
            left: pt.x - 6,
            width: 12,
            height: barH,
            backgroundColor: i === points.length - 1 ? accent : accent + '50',
            borderRadius: 6,
          }} />
        );
      })}

      {/* Point dots + top labels */}
      {points.map((pt, i) => (
        <View key={`dot-${i}`} style={{ position: 'absolute', top: pt.y - 5, left: pt.x - 5 }}>
          <View style={{
            width: 10, height: 10, borderRadius: 5,
            backgroundColor: i === points.length - 1 ? accent : 'rgba(255,255,255,0.4)',
            borderWidth: 2, borderColor: '#09090B',
          }} />
        </View>
      ))}

      {/* X-axis labels */}
      {points.map((pt, i) => (
        <Text key={`lbl-${i}`} style={{
          position: 'absolute', bottom: 0, left: pt.x - 20, width: 40,
          fontSize: 9, color: 'rgba(255,255,255,0.35)', fontWeight: '600', textAlign: 'center',
        }}>
          {new Date(entries[i].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  immersiveHeaderBg: { width: '100%', paddingTop: 50 },
  immersiveHeaderGradient: { paddingHorizontal: SIZES.spacingLg, paddingBottom: 20, paddingTop: 10 },
  headerTitle: { fontSize: 36, fontWeight: '900', color: '#FFF', marginBottom: 20, textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 10 },
  tabContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  tabBtnActive: { backgroundColor: 'rgba(255,255,255,0.15)' },
  tabText: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '700' },
  tabTextActive: { color: '#FFF', fontWeight: '800' },
  
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: 20 },
  
  // Progress Tab
  summaryCard: { backgroundColor: COLORS.cardBg, borderRadius: 24, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', ...SHADOWS.large },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primary, letterSpacing: 1 },
  streakBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FF4500', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, gap: 4 },
  streakText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  statItem: { alignItems: 'center', flex: 1 },
  statVal: { fontSize: 28, fontWeight: '900', color: COLORS.text },
  statUnit: { fontSize: 14, color: COLORS.textTertiary, fontWeight: '700' },
  statLab: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '800', marginTop: 4, letterSpacing: 1 },
  statDivider: { width: 1, height: 40, backgroundColor: COLORS.border },
  calRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.surface, padding: 12, borderRadius: 16 },
  calDay: { alignItems: 'center', gap: 6 },
  calDayText: { fontSize: 10, color: COLORS.textSecondary, fontWeight: '600' },
  calDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.border },
  calDotActive: { backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: {width:0, height:0}, shadowOpacity: 0.8, shadowRadius: 4 },
  
  metricsRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  metricCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  metricVal: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginTop: 12 },
  metricLab: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '800', letterSpacing: 0.5, marginTop: 4, marginBottom: 12 },
  trendBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  trendText: { fontSize: 12, fontWeight: '700' },
  updateBtn: { backgroundColor: COLORS.surface, paddingVertical: 6, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  updateBtnText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },

  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  historyDate: { width: 50, alignItems: 'center', borderRightWidth: 1, borderRightColor: COLORS.border, paddingRight: 12, marginRight: 12 },
  historyDay: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  historyMonth: { fontSize: 10, color: COLORS.textTertiary, textTransform: 'uppercase', fontWeight: '700' },
  historyContent: { flex: 1 },
  historyValue: { fontSize: 16, color: COLORS.text, fontWeight: '800' },
  historyNote: { fontSize: 12, color: COLORS.textTertiary, marginTop: 4 },

  // Activities Tab
  achievementsRow: { paddingRight: 20, marginBottom: 24 },
  badgeCard: { width: 80, alignItems: 'center', marginRight: 16 },
  badgeLocked: { opacity: 0.5 },
  badgeIconBg: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  badgeLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '700', textAlign: 'center' },

  feedHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  addActBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  addActText: { fontSize: 12, fontWeight: '800', color: '#FFF' },

  actCard: { backgroundColor: COLORS.cardBg, borderRadius: 20, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.small },
  actHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  actAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  actType: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  actTime: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', marginTop: 2 },
  actNotes: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 12, lineHeight: 20 },
  actPhoto: { width: '100%', height: 200, borderRadius: 16, marginBottom: 12 },
  editPhotoOverlay: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.5)', padding: 6, borderRadius: 12 },
  addPhotoBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.primary + '15', paddingVertical: 12, borderRadius: 12, gap: 8, marginBottom: 12 },
  addPhotoText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  actActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  actActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actActionText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },

  commentsSection: { marginTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: 12 },
  commentRow: { flexDirection: 'row', marginBottom: 4 },
  commentUser: { fontSize: 13, fontWeight: '800', color: COLORS.text, marginRight: 6 },
  commentText: { fontSize: 13, color: COLORS.textSecondary, flex: 1 },
  viewAllComments: { fontSize: 13, color: COLORS.textTertiary, marginTop: 6, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, marginTop: 12 },
  emptySub: { fontSize: 13, color: COLORS.textTertiary, marginTop: 4 },

  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingHorizontal: SIZES.spacingXl, paddingTop: 20, paddingBottom: 20, maxHeight: '90%', ...SHADOWS.large },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: COLORS.text },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  inputLabel: { fontSize: 11, fontWeight: '800', color: COLORS.textTertiary, marginBottom: 8, letterSpacing: 1, marginTop: 16 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: 16, paddingHorizontal: 16, height: 52, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, textAlignVertical: 'top' },
  modalActionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 60, borderRadius: 16, ...SHADOWS.medium },
  modalActionBtnText: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  
  photoUploadBtn: { width: '100%', height: 160, backgroundColor: COLORS.surface, borderRadius: 16, borderWidth: 2, borderColor: COLORS.border, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  photoUploadText: { fontSize: 14, color: COLORS.primary, fontWeight: '700', marginTop: 8 },
  uploadedPhoto: { width: '100%', height: '100%', borderRadius: 14 },

  calcPromoBtn: { marginBottom: 24, borderRadius: 20, ...SHADOWS.medium },
  calcPromoGrad: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 20 },
  calcPromoTitle: { fontSize: 18, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  calcPromoSub: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  
  calcTypeChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginRight: 10, borderWidth: 1, borderColor: COLORS.border, gap: 6 },
  calcTypeChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  calcTypeText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  calcTypeTextActive: { color: '#FFF' },
  
  calcResultsPanel: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  calcResultBox: { flex: 1, alignItems: 'center' },
  calcResultVal: { fontSize: 24, fontWeight: '900', color: COLORS.text, marginVertical: 8 },
  calcResultLab: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '800', textAlign: 'center' },
  calcResultDivider: { width: 1, backgroundColor: COLORS.border, marginHorizontal: 15 },

  // Weight Chart
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)',
  },
  chartTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16 },
});
