import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Image, Dimensions, Modal
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width, height } = Dimensions.get('window');

// Mock data for the challenge breakdown
const WEEKS = [
  {
    weekNum: 1,
    title: 'Foundations & Form',
    days: [
      { day: 1, status: 'completed' },
      { day: 2, status: 'completed' },
      { day: 3, status: 'rest' },
      { day: 4, status: 'completed' },
      { day: 5, status: 'completed' },
      { day: 6, status: 'completed' },
      { day: 7, status: 'rest' },
    ]
  },
  {
    weekNum: 2,
    title: 'Intensity Building',
    days: [
      { day: 8, status: 'completed' },
      { day: 9, status: 'current' }, // This is the active day
      { day: 10, status: 'locked' },
      { day: 11, status: 'locked' },
      { day: 12, status: 'rest' },
      { day: 13, status: 'locked' },
      { day: 14, status: 'locked' },
    ]
  },
  {
    weekNum: 3,
    title: 'Peak Performance',
    days: [
      { day: 15, status: 'locked' },
      { day: 16, status: 'locked' },
      { day: 17, status: 'locked' },
      { day: 18, status: 'rest' },
      { day: 19, status: 'locked' },
      { day: 20, status: 'locked' },
      { day: 21, status: 'locked' },
    ]
  }
];

const EXERCISE_DB: Record<string, any[]> = {
  'Chest': [
    { id: 1, name: 'Bench Press', category: 'Chest', muscles: 'Chest, Triceps', gif: 'bench-press.gif', sets: 4, reps: '10', weight: 'Barbell', restSeconds: 60 },
    { id: 2, name: 'Incline Dumbbell Press', category: 'Chest', muscles: 'Upper Chest', gif: 'incline-dumbbell-flyes.gif', sets: 3, reps: '12', weight: 'Dumbbells', restSeconds: 60 },
    { id: 40, name: 'Dumbbell Bench Press', category: 'Chest', muscles: 'Chest, Triceps', gif: 'dumbbell-bench-press.gif', sets: 3, reps: '12', weight: 'Dumbbells', restSeconds: 60 },
    { id: 58, name: 'Diamond Push-Ups', category: 'Chest', muscles: 'Triceps, Inner Chest', gif: 'diamond-push-ups.gif', sets: 3, reps: '15', weight: 'Bodyweight', restSeconds: 45 },
  ],
  'Arms': [
    { id: 19, name: 'Barbell Curls', category: 'Arms', muscles: 'Biceps', gif: 'cable-bicep-curl.gif', sets: 4, reps: '12', weight: 'Barbell', restSeconds: 60 },
    { id: 21, name: 'Tricep Dips', category: 'Arms', muscles: 'Triceps', gif: 'Triceps-Dips.gif', sets: 3, reps: '12', weight: 'Bodyweight', restSeconds: 60 },
    { id: 20, name: 'Hammer Curls', category: 'Arms', muscles: 'Biceps, Forearms', gif: 'hammer-curls.gif', sets: 3, reps: '12', weight: 'Dumbbells', restSeconds: 60 },
    { id: 22, name: 'Skull Crushers', category: 'Arms', muscles: 'Triceps', gif: 'SKULL_CRUSHERS.gif', sets: 3, reps: '10', weight: 'EZ Bar', restSeconds: 60 },
  ],
  'Core': [
    { id: 52, name: 'Sit-Ups', category: 'Core', muscles: 'Abs', gif: 'SIT_UPS.gif', sets: 3, reps: '20', weight: 'Bodyweight', restSeconds: 45 },
    { id: 37, name: 'Cable Crunch', category: 'Core', muscles: 'Abs', gif: 'Cable-Crunch.gif', sets: 3, reps: '15', weight: 'Cable', restSeconds: 45 },
    { id: 23, name: 'Bicycle Crunches', category: 'Core', muscles: 'Abs, Obliques', gif: 'Bicycle-Crunch.gif', sets: 3, reps: '20', weight: 'Bodyweight', restSeconds: 45 },
    { id: 35, name: 'Side Plank', category: 'Core', muscles: 'Obliques, Core', gif: 'hyperextensions.gif', sets: 3, reps: '60s', weight: 'Bodyweight', restSeconds: 45 },
  ],
  'Shoulders': [
    { id: 16, name: 'Shoulder Press', category: 'Shoulders', muscles: 'Shoulders', gif: 'dumbbell-shoulder-press.gif', sets: 4, reps: '10', weight: 'Dumbbells', restSeconds: 60 },
    { id: 17, name: 'Lateral Raises', category: 'Shoulders', muscles: 'Side Delts', gif: 'lateral-raises.gif', sets: 3, reps: '15', weight: 'Dumbbells', restSeconds: 45 },
    { id: 49, name: 'Front Raises', category: 'Shoulders', muscles: 'Front Delts', gif: 'front-raises.gif', sets: 3, reps: '12', weight: 'Dumbbells', restSeconds: 45 },
    { id: 18, name: 'Face Pulls', category: 'Shoulders', muscles: 'Rear Delts', gif: 'face-pulls.gif', sets: 3, reps: '15', weight: 'Cable', restSeconds: 45 },
  ],
  'Legs': [
    { id: 11, name: 'Barbell Squats', category: 'Legs', muscles: 'Quads, Glutes', gif: 'barbell-back-squats.gif', sets: 4, reps: '8', weight: 'Barbell', restSeconds: 90 },
    { id: 12, name: 'Leg Press', category: 'Legs', muscles: 'Quads, Glutes', gif: 'hack-squats.gif', sets: 3, reps: '12', weight: 'Machine', restSeconds: 60 },
    { id: 13, name: 'Romanian Deadlift', category: 'Legs', muscles: 'Hamstrings', gif: 'romanian-deadlifts.gif', sets: 3, reps: '10', weight: 'Barbell', restSeconds: 90 },
    { id: 29, name: 'Bulgarian Split Squat', category: 'Legs', muscles: 'Quads, Glutes', gif: 'Bulgarian-Split-Squat.gif', sets: 3, reps: '10', weight: 'Dumbbells', restSeconds: 60 },
  ]
};

export default function ChallengeDetailScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const challenge = route.params?.challenge;
  const [showWorkoutModal, setShowWorkoutModal] = React.useState(false);
  const [currentDay, setCurrentDay] = React.useState(challenge?.currentDay || 1);

  useFocusEffect(
    React.useCallback(() => {
      if (challenge) {
        AsyncStorage.getItem('challengeProgress').then(res => {
          if (res) {
            const progress = JSON.parse(res);
            if (progress[challenge.id]) {
              setCurrentDay(progress[challenge.id]);
            }
          }
        });
      }
    }, [challenge])
  );

  if (!challenge) return null;

  const pct = Math.round((currentDay / challenge.days) * 100);
  const themeColor = challenge.colors[0];
  
  // Dynamic Progressive Overload & Variation
  const todayWorkout = React.useMemo(() => {
    const baseExercises = EXERCISE_DB[challenge.body] || EXERCISE_DB['Core'];
    const week = Math.ceil(currentDay / 7);
    
    // Scale factor: Every 3 days, difficulty increases
    const scaleFactor = Math.floor(currentDay / 3);

    // Deep copy to safely modify properties
    let dynamicWorkout = JSON.parse(JSON.stringify(baseExercises));

    // Daily Rotation: Shift the starting exercise based on the current day
    const shiftAmount = currentDay % dynamicWorkout.length;
    dynamicWorkout = [...dynamicWorkout.slice(shiftAmount), ...dynamicWorkout.slice(0, shiftAmount)];

    // Progressive Overload
    return dynamicWorkout.map((ex: any) => {
      if (week === 2) ex.sets += 1;
      if (week >= 3) ex.sets += 2;

      if (ex.reps.includes('s')) { 
        const currentSecs = parseInt(ex.reps);
        ex.reps = `${currentSecs + (scaleFactor * 5)}s`;
      } else if (!ex.reps.includes('-') && !ex.reps.includes('/')) {
        const currentReps = parseInt(ex.reps);
        ex.reps = `${currentReps + scaleFactor}`;
      }
      
      return ex;
    });
  }, [challenge, currentDay]);

  const startChallengeWorkout = () => {
    setShowWorkoutModal(false);
    navigation.navigate('ActiveWorkout', {
      workoutName: `${challenge.name} - Day ${currentDay}`,
      exercises: todayWorkout,
      challengeId: challenge.id,
      challengeDay: currentDay
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header with Image */}
      <View style={styles.headerContainer}>
        <Image source={{ uri: challenge.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <LinearGradient colors={['rgba(0,0,0,0.3)', COLORS.background]} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.headerContent}>
          <View style={[styles.iconBadge, { backgroundColor: themeColor }]}>
            <Ionicons name={challenge.icon} size={24} color="#FFF" />
          </View>
          <Text style={styles.title}>{challenge.name}</Text>
          <Text style={styles.subtitle}>{challenge.days} Days • {challenge.body} Focus</Text>

          <View style={styles.progressContainer}>
            <View style={styles.progressRow}>
              <Text style={styles.progressText}>Day {currentDay} of {challenge.days}</Text>
              <Text style={[styles.progressText, { color: themeColor, fontWeight: '800' }]}>{pct}%</Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${pct}%`, backgroundColor: themeColor }]} />
            </View>
          </View>
        </View>
      </View>

      {/* Weeks & Days Timeline */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {WEEKS.map((week, wIndex) => (
          <View key={wIndex} style={styles.weekContainer}>
            <Text style={styles.weekTitle}>Week {week.weekNum}: <Text style={{ color: COLORS.textSecondary }}>{week.title}</Text></Text>
            
            <View style={styles.daysGrid}>
              {week.days.map((d, dIndex) => {
                let circleStyle: any = styles.dayCircle;
                let textStyle: any = styles.dayText;
                let isCheck = false;
                let isRest = false;

                // Dynamically color the timeline circles based on currentDay
                if (d.day < currentDay) {
                  circleStyle = [styles.dayCircle, { backgroundColor: themeColor, borderColor: themeColor }];
                  textStyle = [styles.dayText, { color: '#FFF' }];
                  isCheck = true;
                } else if (d.day === currentDay) {
                  circleStyle = [styles.dayCircle, { borderColor: themeColor, borderWidth: 2, backgroundColor: themeColor + '20' }];
                  textStyle = [styles.dayText, { color: themeColor, fontWeight: '800' }];
                } else if (d.status === 'rest') {
                  circleStyle = [styles.dayCircle, { backgroundColor: COLORS.surface, borderColor: 'transparent' }];
                  textStyle = [styles.dayText, { color: COLORS.textTertiary }];
                  isRest = true;
                }

                return (
                  <View key={dIndex} style={styles.dayItem}>
                    <View style={circleStyle}>
                      {isCheck ? (
                        <Ionicons name="checkmark" size={16} color="#FFF" />
                      ) : isRest ? (
                        <Ionicons name="cafe" size={14} color={COLORS.textTertiary} />
                      ) : (
                        <Text style={textStyle}>{d.day}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ))}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Bottom Action Area */}
      <LinearGradient colors={['transparent', COLORS.background, COLORS.background]} style={styles.bottomArea}>
        <TouchableOpacity style={styles.previewBtn} onPress={() => setShowWorkoutModal(true)}>
          <Text style={styles.previewBtnText}>See Today's Workout</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: themeColor }]} activeOpacity={0.9} onPress={startChallengeWorkout}>
          <Text style={styles.startBtnText}>Continue Day {currentDay}</Text>
          <Ionicons name="play" size={20} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Today's Workout Preview Modal */}
      <Modal visible={showWorkoutModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Day {currentDay} Workout</Text>
              <TouchableOpacity onPress={() => setShowWorkoutModal(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Complete these to light up your streak!</Text>
            
            <ScrollView style={styles.modalList}>
              {todayWorkout.map((ex: any, idx: number) => (
                <View key={idx} style={styles.workoutItem}>
                  <View style={styles.workoutIcon}>
                    <Ionicons name="barbell-outline" size={20} color={themeColor} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.workoutName}>{ex.name}</Text>
                    <Text style={styles.workoutSets}>{ex.sets} Sets • {ex.reps} Reps</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={[styles.modalStartBtn, { backgroundColor: themeColor }]} onPress={startChallengeWorkout}>
              <Text style={styles.modalStartText}>Let's Go!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerContainer: { height: height * 0.38, position: 'relative' },
  headerTop: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  headerContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24 },
  iconBadge: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  subtitle: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.8)', fontWeight: '600', marginBottom: 20 },
  progressContainer: { width: '100%' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: SIZES.sm, color: '#FFF', fontWeight: '600' },
  progressBarBg: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  progressBarFill: { height: 8, borderRadius: 4 },
  
  scrollView: { flex: 1, marginTop: 10 },
  scrollContent: { padding: 20 },
  weekContainer: { marginBottom: 30 },
  weekTitle: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text, marginBottom: 16 },
  daysGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  dayItem: { alignItems: 'center' },
  dayCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.backgroundSecondary },
  dayText: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textSecondary },

  bottomArea: { position: 'absolute', bottom: 85, left: 0, right: 0, padding: 24, paddingTop: 40 },
  previewBtn: { alignSelf: 'center', marginBottom: 16 },
  previewBtnText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '700', textDecorationLine: 'underline' },
  startBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 18, borderRadius: 16, ...SHADOWS.medium },
  startBtnText: { fontSize: SIZES.lg, fontWeight: '800', color: '#FFF', marginRight: 8 },

  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 24, paddingBottom: 40, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  modalSub: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 4, marginBottom: 20 },
  modalList: { marginBottom: 20 },
  workoutItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, padding: 16, borderRadius: 16, marginBottom: 10 },
  workoutIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  workoutName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  workoutSets: { fontSize: SIZES.sm, color: COLORS.textTertiary },
  modalStartBtn: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  modalStartText: { fontSize: SIZES.lg, fontWeight: '800', color: '#FFF' },
});
