import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Dimensions, Modal, Alert, Vibration, Image, TextInput
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const { width } = Dimensions.get('window');

// Dynamic GIF base URL - auto-detects server IP from Expo connection
function getGifBase(): string {
  try {
    const debuggerHost =
      (Constants as any).expoGoConfig?.debuggerHost ||
      (Constants as any).manifest?.debuggerHost ||
      (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
        return `http://${ip}:8000/lottie/exercises`;
      }
    }
  } catch {}
  return 'http://10.0.0.50:8000/lottie/exercises';
}

function gifUrl(filename: string): string {
  return `${getGifBase()}/${encodeURIComponent(filename)}`;
}

interface WorkoutExercise {
  id: number;
  name: string;
  category: string;
  muscles: string;
  sets: number;
  reps: string;
  weight: string;
  restSeconds: number;
  gif?: string;
}

interface SetLog {
  reps: string;
  weight: string;
}

export default function ActiveWorkoutScreen() {
  const { addActivity } = useApp();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { workoutName, exercises: exerciseList, challengeId, challengeDay } = route.params as { 
    workoutName: string; 
    exercises: WorkoutExercise[];
    challengeId?: number;
    challengeDay?: number;
  };

  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<number, SetLog[]>>({});
  const [currentSetReps, setCurrentSetReps] = useState('');
  const [currentSetWeight, setCurrentSetWeight] = useState('');
  
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(60);
  const [restRemaining, setRestRemaining] = useState(0);
  const [customRest, setCustomRest] = useState(60);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutComplete, setWorkoutComplete] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentExercise = exerciseList[currentIdx];
  const totalExercises = exerciseList.length;

  // Elapsed timer
  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, []);

  // Update inputs when exercise changes
  useEffect(() => {
    setCurrentSetReps(exerciseList[currentIdx]?.reps || '');
    setCurrentSetWeight(exerciseList[currentIdx]?.weight || '');
  }, [currentIdx, exerciseList]);

  // Rest timer
  useEffect(() => {
    if (isResting && restRemaining > 0) {
      timerRef.current = setInterval(() => {
        setRestRemaining(prev => {
          if (prev <= 1) {
            setIsResting(false);
            Vibration.vibrate(500);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isResting, restRemaining]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getCompletedSetsCount = (exIdx: number) => (completedSets[exIdx] || []).length;

  const completeSet = async () => {
    const currentSets = completedSets[currentIdx] || [];
    const newSetLog = {
      reps: currentSetReps,
      weight: currentSetWeight
    };
    
    const updatedSets = [...currentSets, newSetLog];
    setCompletedSets(prev => ({ ...prev, [currentIdx]: updatedSets }));

    if (updatedSets.length >= currentExercise.sets) {
      // All sets done - start rest then move to next
      if (currentIdx < totalExercises - 1) {
        startRest(currentExercise.restSeconds);
      } else {
        // Workout complete!
        setWorkoutComplete(true);
        if (elapsedRef.current) clearInterval(elapsedRef.current);
        
        // Log to Activities Feed
        addActivity({
          type: workoutName,
          duration: Math.ceil(elapsedTime / 60),
          date: new Date().toISOString(),
          notes: `Completed ${totalExercises} exercises.`
        }).catch(() => {});

        // Save challenge progress if this is a challenge workout
        if (challengeId && challengeDay) {
          try {
            const stored = await AsyncStorage.getItem('challengeProgress');
            const progress = stored ? JSON.parse(stored) : {};
            
            // Advance the day if we just completed the current day
            if (!progress[challengeId] || progress[challengeId] <= challengeDay) {
              progress[challengeId] = challengeDay + 1;
              await AsyncStorage.setItem('challengeProgress', JSON.stringify(progress));
            }
          } catch (e) {
            console.warn('Failed to save challenge progress', e);
          }
        }
      }
    } else {
      // Rest between sets
      startRest(currentExercise.restSeconds);
    }
  };

  const startRest = (seconds: number) => {
    setRestTime(seconds);
    setRestRemaining(seconds);
    setCustomRest(seconds);
    setIsResting(true);
  };

  const skipRest = () => {
    setIsResting(false);
    setRestRemaining(0);
    if (timerRef.current) clearInterval(timerRef.current);
    const currentSets = completedSets[currentIdx] || [];
    if (currentSets.length >= currentExercise.sets && currentIdx < totalExercises - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const adjustRest = (delta: number) => {
    const newVal = Math.max(10, restRemaining + delta);
    setRestRemaining(newVal);
  };

  const goToExercise = (idx: number) => {
    if (isResting) return;
    setCurrentIdx(idx);
  };

  const exitWorkout = () => {
    Alert.alert('End Workout?', 'Your progress will be lost.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: () => navigation.goBack() },
    ]);
  };

  // Handle transition after rest when all sets are done
  useEffect(() => {
    if (!isResting && restRemaining === 0) {
      const currentSets = completedSets[currentIdx] || [];
      if (currentSets.length >= currentExercise?.sets && currentIdx < totalExercises - 1) {
        setCurrentIdx(prev => prev + 1);
      }
    }
  }, [isResting]);

  if (workoutComplete) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <View style={styles.completeScreen}>
          <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.completeCircle}>
            <Ionicons name="trophy" size={64} color="#FFF" />
          </LinearGradient>
          <Text style={styles.completeTitle}>Workout Complete! 🎉</Text>
          <Text style={styles.completeSub}>{workoutName}</Text>
          <View style={styles.completeStats}>
            <View style={styles.completeStat}>
              <Text style={styles.completeStatVal}>{formatTime(elapsedTime)}</Text>
              <Text style={styles.completeStatLabel}>Duration</Text>
            </View>
            <View style={styles.completeStatDivider} />
            <View style={styles.completeStat}>
              <Text style={styles.completeStatVal}>{totalExercises}</Text>
              <Text style={styles.completeStatLabel}>Exercises</Text>
            </View>
            <View style={styles.completeStatDivider} />
            <View style={styles.completeStat}>
              <Text style={styles.completeStatVal}>{Object.values(completedSets).reduce((a, b) => a + b.length, 0)}</Text>
              <Text style={styles.completeStatLabel}>Total Sets</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.completeBtn} onPress={() => navigation.goBack()}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.completeBtnGrad}>
              <Text style={styles.completeBtnText}>Done</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.topBtn} onPress={exitWorkout}>
          <Ionicons name="close" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle}>{workoutName}</Text>
          <Text style={styles.topTimer}>{formatTime(elapsedTime)}</Text>
        </View>
        <View style={styles.topBtn}>
          <Text style={styles.topProgress}>{currentIdx + 1}/{totalExercises}</Text>
        </View>
      </View>

      {/* Progress Dots */}
      <View style={styles.progressDots}>
        {exerciseList.map((_, i) => (
          <TouchableOpacity key={i} onPress={() => goToExercise(i)}>
            <View style={[
              styles.dot,
              i === currentIdx && styles.dotActive,
              getCompletedSetsCount(i) >= exerciseList[i].sets && styles.dotComplete,
            ]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Rest Timer Overlay */}
      {isResting ? (
        <View style={styles.restContainer}>
          <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.restGradient}>
            <Ionicons name="hourglass-outline" size={40} color={COLORS.accent} />
            <Text style={styles.restLabel}>Rest Time</Text>
            <Text style={styles.restTimer}>{formatTime(restRemaining)}</Text>

            {/* Circular progress */}
            <View style={styles.restProgressBg}>
              <View style={[styles.restProgressFill, { width: `${((restTime - restRemaining) / restTime) * 100}%` }]} />
            </View>

            {/* Adjust buttons */}
            <View style={styles.restAdjust}>
              <TouchableOpacity style={styles.restAdjustBtn} onPress={() => adjustRest(-15)}>
                <Text style={styles.restAdjustText}>-15s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restAdjustBtn} onPress={() => adjustRest(-5)}>
                <Text style={styles.restAdjustText}>-5s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restAdjustBtn} onPress={() => adjustRest(5)}>
                <Text style={styles.restAdjustText}>+5s</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.restAdjustBtn} onPress={() => adjustRest(15)}>
                <Text style={styles.restAdjustText}>+15s</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.restNext}>
              Next: {currentIdx < totalExercises - 1 ? exerciseList[currentIdx + 1]?.name : 'Done!'}
            </Text>

            <TouchableOpacity style={styles.skipBtn} onPress={skipRest}>
              <Text style={styles.skipBtnText}>Skip Rest</Text>
              <Ionicons name="play-skip-forward" size={16} color={COLORS.primary} />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      ) : (
        /* Current Exercise */
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Exercise Info */}
          <View style={styles.currentExCard}>
            <View style={styles.currentExHeader}>
              <View style={styles.currentExIcon}>
                <Ionicons name="barbell" size={28} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.currentExName}>{currentExercise.name}</Text>
                <Text style={styles.currentExMuscles}>{currentExercise.muscles} • {currentExercise.category}</Text>
              </View>
            </View>

            {currentExercise.gif && (
              <View style={styles.gifContainer}>
                <Image 
                  source={{ uri: gifUrl(currentExercise.gif) }} 
                  style={styles.gifImage} 
                  resizeMode="cover" 
                  defaultSource={undefined}
                />
              </View>
            )}

            {/* Set Details */}
            <View style={styles.setInfo}>
              <View style={styles.setInfoItem}>
                <Text style={styles.setInfoVal}>{currentExercise.sets}</Text>
                <Text style={styles.setInfoLabel}>Sets</Text>
              </View>
              <View style={styles.setInfoDivider} />
              <View style={styles.setInfoItem}>
                <Text style={styles.setInfoVal}>{currentExercise.reps}</Text>
                <Text style={styles.setInfoLabel}>Reps</Text>
              </View>
              <View style={styles.setInfoDivider} />
              <View style={styles.setInfoItem}>
                <Text style={styles.setInfoVal}>{currentExercise.weight || '—'}</Text>
                <Text style={styles.setInfoLabel}>kg</Text>
              </View>
              <View style={styles.setInfoDivider} />
              <View style={styles.setInfoItem}>
                <Text style={styles.setInfoVal}>{currentExercise.restSeconds}s</Text>
                <Text style={styles.setInfoLabel}>Rest</Text>
              </View>
            </View>
          </View>

          {/* Sets Logger */}
          <View style={styles.setsSection}>
            <Text style={styles.setsTitle}>Log Sets</Text>
            
            <View style={styles.logContainer}>
              {/* Headers */}
              <View style={styles.logHeader}>
                <Text style={styles.logHeaderCol}>SET</Text>
                <Text style={styles.logHeaderCol}>KG</Text>
                <Text style={styles.logHeaderCol}>REPS</Text>
                <View style={styles.logHeaderCheck} />
              </View>

              {/* Previous Sets */}
              {(completedSets[currentIdx] || []).map((setLog, i) => (
                <View key={i} style={styles.logRowDone}>
                  <View style={styles.logCol}><Text style={styles.logTextDone}>{i + 1}</Text></View>
                  <View style={styles.logCol}><Text style={styles.logTextDone}>{setLog.weight || '-'}</Text></View>
                  <View style={styles.logCol}><Text style={styles.logTextDone}>{setLog.reps}</Text></View>
                  <View style={styles.logCheck}><Ionicons name="checkmark-circle" size={24} color={COLORS.success} /></View>
                </View>
              ))}

              {/* Current Active Set */}
              {getCompletedSetsCount(currentIdx) < currentExercise.sets && (
                <View style={styles.logRowActive}>
                  <View style={styles.logCol}>
                    <View style={styles.activeSetBadge}>
                      <Text style={styles.activeSetText}>{getCompletedSetsCount(currentIdx) + 1}</Text>
                    </View>
                  </View>
                  <View style={styles.logCol}>
                    <TextInput style={styles.logInput} value={currentSetWeight} onChangeText={setCurrentSetWeight} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                  </View>
                  <View style={styles.logCol}>
                    <TextInput style={styles.logInput} value={currentSetReps} onChangeText={setCurrentSetReps} keyboardType="numeric" placeholder="0" placeholderTextColor={COLORS.textMuted} />
                  </View>
                  <View style={styles.logCheck}>
                    <Ionicons name="ellipse-outline" size={24} color={COLORS.primary} />
                  </View>
                </View>
              )}

              {/* Upcoming Sets */}
              {Array.from({ length: Math.max(0, currentExercise.sets - getCompletedSetsCount(currentIdx) - 1) }, (_, i) => (
                <View key={`upcoming-${i}`} style={styles.logRowUpcoming}>
                  <View style={styles.logCol}><Text style={styles.logTextUpcoming}>{getCompletedSetsCount(currentIdx) + 2 + i}</Text></View>
                  <View style={styles.logCol}><Text style={styles.logTextUpcoming}>{currentExercise.weight || '-'}</Text></View>
                  <View style={styles.logCol}><Text style={styles.logTextUpcoming}>{currentExercise.reps}</Text></View>
                  <View style={styles.logCheck}><Ionicons name="ellipse-outline" size={24} color={COLORS.border} /></View>
                </View>
              ))}
            </View>
          </View>

          {/* Exercise List Overview */}
          <View style={styles.overviewSection}>
            <Text style={styles.overviewTitle}>Workout Overview</Text>
            {exerciseList.map((ex, i) => {
              const done = getCompletedSetsCount(i) >= ex.sets;
              const isCurrent = i === currentIdx;
              return (
                <TouchableOpacity key={i} style={[styles.overviewItem, isCurrent && styles.overviewItemActive]} onPress={() => goToExercise(i)}>
                  <View style={[styles.overviewDot, done && styles.overviewDotDone, isCurrent && !done && styles.overviewDotCurrent]}>
                    {done ? <Ionicons name="checkmark" size={12} color="#FFF" /> : <Text style={styles.overviewDotText}>{i + 1}</Text>}
                  </View>
                  <Text style={[styles.overviewName, done && styles.overviewNameDone]}>{ex.name}</Text>
                  <Text style={styles.overviewSets}>{getCompletedSetsCount(i)}/{ex.sets}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {/* Complete Set Button (only when not resting) */}
      {!isResting && !workoutComplete && (
        <View style={styles.bottomBar}>
          <TouchableOpacity activeOpacity={0.9} onPress={completeSet}>
            <LinearGradient colors={[COLORS.success, COLORS.successDark]} style={styles.completeSetBtn}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
              <Text style={styles.completeSetText}>
                Complete Set {getCompletedSetsCount(currentIdx) + 1} of {currentExercise.sets}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Top Bar
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: 12 },
  topBtn: { width: 42, height: 42, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  topCenter: { alignItems: 'center' },
  topTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  topTimer: { fontSize: SIZES.sm, color: COLORS.accent, fontWeight: '600', marginTop: 2 },
  topProgress: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.primary },
  // Progress Dots
  progressDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.surface },
  dotActive: { width: 24, backgroundColor: COLORS.primary, borderRadius: 4 },
  dotComplete: { backgroundColor: COLORS.success },
  // Scroll
  scrollView: { flex: 1 },
  scrollContent: { padding: SIZES.spacingLg },
  // Current Exercise
  currentExCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusXl, padding: SIZES.spacingXl, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SIZES.spacingXl },
  currentExHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacingXl, gap: 14 },
  currentExIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center' },
  currentExName: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  currentExMuscles: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginTop: 2 },
  gifContainer: { height: 180, width: '100%', borderRadius: SIZES.radiusLg, overflow: 'hidden', backgroundColor: COLORS.surface, marginBottom: SIZES.spacingXl },
  gifImage: { width: '100%', height: '100%' },
  setInfo: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.spacingBase },
  setInfoItem: { alignItems: 'center' },
  setInfoVal: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  setInfoLabel: { fontSize: 10, color: COLORS.textTertiary, marginTop: 2, textTransform: 'uppercase' },
  setInfoDivider: { width: 1, backgroundColor: COLORS.border },
  // Set Logger
  setsSection: { alignItems: 'center', marginBottom: SIZES.spacingXl },
  setsTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 14 },
  logContainer: { width: '100%', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase },
  logHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, paddingHorizontal: 8 },
  logHeaderCol: { flex: 1, fontSize: 11, fontWeight: '700', color: COLORS.textTertiary, textAlign: 'center' },
  logHeaderCheck: { width: 32 },
  logRowDone: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, backgroundColor: COLORS.success + '10', borderRadius: SIZES.radiusMd, marginBottom: 6 },
  logRowActive: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, backgroundColor: COLORS.primary + '10', borderRadius: SIZES.radiusMd, marginBottom: 6, borderWidth: 1, borderColor: COLORS.primary + '30' },
  logRowUpcoming: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 8, marginBottom: 6 },
  logCol: { flex: 1, alignItems: 'center' },
  logCheck: { width: 32, alignItems: 'flex-end' },
  logTextDone: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.success },
  logTextUpcoming: { fontSize: SIZES.base, fontWeight: '600', color: COLORS.textTertiary },
  activeSetBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  activeSetText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  logInput: { width: 60, height: 36, backgroundColor: COLORS.background, borderRadius: SIZES.radiusSm, textAlign: 'center', fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, borderWidth: 1, borderColor: COLORS.primary + '50' },
  // Overview
  overviewSection: { marginBottom: SIZES.spacingXl },
  overviewTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  overviewItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: SIZES.radiusMd, marginBottom: 4 },
  overviewItemActive: { backgroundColor: COLORS.primary + '12' },
  overviewDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginRight: 10, borderWidth: 1, borderColor: COLORS.border },
  overviewDotDone: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  overviewDotCurrent: { borderColor: COLORS.primary, borderWidth: 2 },
  overviewDotText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary },
  overviewName: { flex: 1, fontSize: SIZES.md, color: COLORS.text, fontWeight: '500' },
  overviewNameDone: { textDecorationLine: 'line-through', color: COLORS.textTertiary },
  overviewSets: { fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' },
  // Bottom Bar
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: SIZES.spacingLg, paddingBottom: 100, backgroundColor: COLORS.background + 'F0' },
  completeSetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: SIZES.radiusMd, ...SHADOWS.medium },
  completeSetText: { fontSize: SIZES.base, fontWeight: '800', color: '#FFF' },
  // Rest
  restContainer: { flex: 1 },
  restGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.spacingXl },
  restLabel: { fontSize: SIZES.lg, color: COLORS.textSecondary, fontWeight: '600', marginTop: 16 },
  restTimer: { fontSize: 72, fontWeight: '900', color: COLORS.accent, marginVertical: 8 },
  restProgressBg: { width: '80%', height: 6, borderRadius: 3, backgroundColor: COLORS.surface, marginBottom: 24 },
  restProgressFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.accent },
  restAdjust: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  restAdjustBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  restAdjustText: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },
  restNext: { fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: 20 },
  skipBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 12, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.primary + '18' },
  skipBtnText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.primary },
  // Complete Screen
  completeScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SIZES.spacingXl },
  completeCircle: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  completeTitle: { fontSize: SIZES.xxl, fontWeight: '900', color: COLORS.text, marginBottom: 4 },
  completeSub: { fontSize: SIZES.base, color: COLORS.textSecondary, marginBottom: 28 },
  completeStats: { flexDirection: 'row', gap: 20, marginBottom: 36 },
  completeStat: { alignItems: 'center' },
  completeStatVal: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  completeStatLabel: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginTop: 2 },
  completeStatDivider: { width: 1, backgroundColor: COLORS.border },
  completeBtn: { width: '100%' },
  completeBtnGrad: { paddingVertical: 16, borderRadius: SIZES.radiusMd, alignItems: 'center', ...SHADOWS.medium },
  completeBtnText: { fontSize: SIZES.lg, fontWeight: '800', color: '#FFF' },
});
