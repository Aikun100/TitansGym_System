import React, { useState, useCallback, memo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Dimensions, Modal, TextInput, Alert, Image, FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import SectionHeader from '../../components/SectionHeader';

// ─── GIF URL helper (same as ActiveWorkoutScreen) ───
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

// ─── Memoized exercise row with GIF (lazy-load prevents lag) ───
const ExercisePickerItem = memo(({ ex, onAdd }: { ex: any; onAdd: (ex: any) => void }) => {
  const [gifLoaded, setGifLoaded] = useState(false);
  return (
    <TouchableOpacity style={styles.pickerItem} activeOpacity={0.7} onPress={() => onAdd(ex)}>
      <View style={styles.pickerGifBox}>
        <Image
          source={{ uri: gifUrl(ex.gif) }}
          style={styles.pickerGif}
          resizeMode="cover"
          onLoad={() => setGifLoaded(true)}
        />
        {!gifLoaded && (
          <View style={styles.pickerGifPlaceholder}>
            <Ionicons name={ex.icon} size={22} color={COLORS.primary} />
          </View>
        )}
      </View>
      <View style={styles.pickerItemInfo}>
        <Text style={styles.pickerItemName}>{ex.name}</Text>
        <Text style={styles.pickerItemMuscles}>{ex.muscles} • {ex.category}</Text>
      </View>
      <View style={styles.pickerAddBtn}>
        <Ionicons name="add" size={20} color={COLORS.primary} />
      </View>
    </TouchableOpacity>
  );
});

const { width } = Dimensions.get('window');

// Exercise data (same categories as ExerciseLibrary)
const ALL_EXERCISES = [
  { id: 1, name: 'Bench Press', category: 'Chest', muscles: 'Chest, Triceps', icon: 'body-outline' as const, gif: 'bench-press.gif' },
  { id: 2, name: 'Incline Dumbbell Press', category: 'Chest', muscles: 'Upper Chest', icon: 'body-outline' as const, gif: 'incline-dumbbell-flyes.gif' },
  { id: 3, name: 'Cable Crossover', category: 'Chest', muscles: 'Chest, Front Delts', icon: 'body-outline' as const, gif: 'cable-crossover.gif' },
  { id: 4, name: 'Dumbbell Flyes', category: 'Chest', muscles: 'Chest', icon: 'body-outline' as const, gif: 'dumbbell-flyes.gif' },
  { id: 5, name: 'Decline Bench Press', category: 'Chest', muscles: 'Lower Chest', icon: 'body-outline' as const, gif: 'decline-barbell-bench-press.gif' },
  { id: 6, name: 'Lat Pulldown', category: 'Back', muscles: 'Lats, Biceps', icon: 'arrow-undo-outline' as const, gif: 'lat-pulldown.gif' },
  { id: 7, name: 'Barbell Rows', category: 'Back', muscles: 'Back, Biceps', icon: 'arrow-undo-outline' as const, gif: 'barbell rows.gif' },
  { id: 8, name: 'Dumbbell Rows', category: 'Back', muscles: 'Lats', icon: 'arrow-undo-outline' as const, gif: 'dumbbell-rows.gif' },
  { id: 9, name: 'T-Bar Rows', category: 'Back', muscles: 'Middle Back', icon: 'arrow-undo-outline' as const, gif: 't-bar-rows.gif' },
  { id: 10, name: 'Pull-Ups', category: 'Back', muscles: 'Lats, Biceps, Core', icon: 'arrow-undo-outline' as const, gif: 'chin-ups.gif' },
  { id: 11, name: 'Barbell Squats', category: 'Legs', muscles: 'Quads, Glutes', icon: 'walk-outline' as const, gif: 'barbell-back-squats.gif' },
  { id: 12, name: 'Leg Press', category: 'Legs', muscles: 'Quads, Glutes', icon: 'walk-outline' as const, gif: 'hack-squats.gif' },
  { id: 13, name: 'Romanian Deadlift', category: 'Legs', muscles: 'Hamstrings', icon: 'walk-outline' as const, gif: 'romanian-deadlifts.gif' },
  { id: 14, name: 'Leg Extension', category: 'Legs', muscles: 'Quadriceps', icon: 'walk-outline' as const, gif: 'LEG-EXTENSION.gif' },
  { id: 15, name: 'Leg Curl', category: 'Legs', muscles: 'Hamstrings', icon: 'walk-outline' as const, gif: 'LEG_CURL.gif' },
  { id: 16, name: 'Shoulder Press', category: 'Shoulders', muscles: 'Shoulders, Triceps', icon: 'man-outline' as const, gif: 'dumbbell-shoulder-press.gif' },
  { id: 17, name: 'Lateral Raises', category: 'Shoulders', muscles: 'Side Delts', icon: 'man-outline' as const, gif: 'lateral-raises.gif' },
  { id: 18, name: 'Face Pulls', category: 'Shoulders', muscles: 'Rear Delts', icon: 'man-outline' as const, gif: 'face-pulls.gif' },
  { id: 19, name: 'Barbell Curls', category: 'Arms', muscles: 'Biceps', icon: 'barbell-outline' as const, gif: 'cable-bicep-curl.gif' },
  { id: 20, name: 'Hammer Curls', category: 'Arms', muscles: 'Biceps, Forearms', icon: 'barbell-outline' as const, gif: 'hammer-curls.gif' },
  { id: 21, name: 'Tricep Dips', category: 'Arms', muscles: 'Triceps', icon: 'barbell-outline' as const, gif: 'Triceps-Dips.gif' },
  { id: 22, name: 'Skull Crushers', category: 'Arms', muscles: 'Triceps', icon: 'barbell-outline' as const, gif: 'SKULL_CRUSHERS.gif' },
  { id: 23, name: 'Bicycle Crunches', category: 'Core', muscles: 'Abs, Obliques', icon: 'fitness-outline' as const, gif: 'Bicycle-Crunch.gif' },
  { id: 24, name: 'Russian Twist', category: 'Core', muscles: 'Obliques', icon: 'fitness-outline' as const, gif: 'Russian-Twist.gif' },
  { id: 25, name: 'Jumping Jacks', category: 'Cardio', muscles: 'Full Body', icon: 'heart-outline' as const, gif: 'jumping-jacks.gif' },
  { id: 26, name: 'Decline Push-Ups', category: 'Chest', muscles: 'Upper Chest, Triceps', icon: 'body-outline' as const, gif: 'decline-push-ups.gif' },
  { id: 27, name: 'Arnold Press', category: 'Shoulders', muscles: 'Shoulders', icon: 'man-outline' as const, gif: 'arnold-press.gif' },
  { id: 28, name: 'Back Deadlifts', category: 'Back', muscles: 'Back, Glutes, Hamstrings', icon: 'arrow-undo-outline' as const, gif: 'back-deadlifts.gif' },
  { id: 29, name: 'Bulgarian Split Squat', category: 'Legs', muscles: 'Quads, Glutes', icon: 'walk-outline' as const, gif: 'Bulgarian-Split-Squat.gif' },
  { id: 30, name: 'Glute Kickback', category: 'Legs', muscles: 'Glutes', icon: 'walk-outline' as const, gif: 'GLUTE_Kickback-machine.gif' },
  { id: 31, name: 'Dumbbell Shrugs', category: 'Shoulders', muscles: 'Traps', icon: 'man-outline' as const, gif: 'dumbbell-shrugs.gif' },
  { id: 32, name: 'Front Squat', category: 'Legs', muscles: 'Quads, Core', icon: 'walk-outline' as const, gif: 'Front-Squat.gif' },
  { id: 33, name: 'Concentration Curls', category: 'Arms', muscles: 'Biceps', icon: 'barbell-outline' as const, gif: 'Concentration-Curl.gif' },
  { id: 34, name: 'Preacher Curls', category: 'Arms', muscles: 'Biceps', icon: 'barbell-outline' as const, gif: 'preacher-curl.gif' },
  { id: 35, name: 'Side Plank', category: 'Core', muscles: 'Obliques, Core', icon: 'fitness-outline' as const, gif: 'hyperextensions.gif' },
  { id: 36, name: 'Oblique Crunches', category: 'Core', muscles: 'Obliques', icon: 'fitness-outline' as const, gif: 'oblique-crunches.gif' },
  { id: 37, name: 'Cable Crunch', category: 'Core', muscles: 'Abs', icon: 'fitness-outline' as const, gif: 'Cable-Crunch.gif' },
  { id: 38, name: 'Walking', category: 'Cardio', muscles: 'Legs, Cardio', icon: 'heart-outline' as const, gif: 'walking.gif' },
  { id: 39, name: 'Cycling', category: 'Cardio', muscles: 'Legs, Cardio', icon: 'heart-outline' as const, gif: 'cycling.gif' },
  { id: 40, name: 'Dumbbell Bench Press', category: 'Chest', muscles: 'Chest, Triceps', icon: 'body-outline' as const, gif: 'dumbbell-bench-press.gif' },
  { id: 41, name: 'Close Grip Bench Press', category: 'Arms', muscles: 'Triceps, Chest', icon: 'barbell-outline' as const, gif: 'close-grip-bench-press.gif' },
  { id: 42, name: 'Wide Grip Lat Pulldown', category: 'Back', muscles: 'Lats, Rear Delts', icon: 'arrow-undo-outline' as const, gif: 'wide-grip-lat-pulldown.gif' },
  { id: 43, name: 'Close Grip Lat Pulldown', category: 'Back', muscles: 'Lats, Biceps', icon: 'arrow-undo-outline' as const, gif: 'close-grip-lat-pulldown.gif' },
  { id: 44, name: 'Chest Supported Rows', category: 'Back', muscles: 'Mid Back, Rear Delts', icon: 'arrow-undo-outline' as const, gif: 'chest-supported-rows.gif' },
  { id: 45, name: 'Barbell Hip Thrust', category: 'Legs', muscles: 'Glutes, Hamstrings', icon: 'walk-outline' as const, gif: 'Barbell-Hip-Thrust.gif' },
  { id: 46, name: 'Hyperextensions', category: 'Back', muscles: 'Lower Back, Glutes', icon: 'arrow-undo-outline' as const, gif: 'hyperextensions.gif' },
  { id: 47, name: 'Tricep Kickbacks', category: 'Arms', muscles: 'Triceps', icon: 'barbell-outline' as const, gif: 'tricep-kickback.gif' },
  { id: 48, name: 'Overhead Tricep Extension', category: 'Arms', muscles: 'Triceps', icon: 'barbell-outline' as const, gif: 'overhead-triceps-extensions.gif' },
  { id: 49, name: 'Front Raises', category: 'Shoulders', muscles: 'Front Delts', icon: 'man-outline' as const, gif: 'front-raises.gif' },
  { id: 50, name: 'Rear Delt Flyes', category: 'Shoulders', muscles: 'Rear Delts', icon: 'man-outline' as const, gif: 'rear-delt-flyes.gif' },
  { id: 51, name: 'Upright Rows', category: 'Shoulders', muscles: 'Traps, Side Delts', icon: 'man-outline' as const, gif: 'upright-rows.gif' },
  { id: 52, name: 'Sit-Ups', category: 'Core', muscles: 'Abs, Hip Flexors', icon: 'fitness-outline' as const, gif: 'SIT_UPS.gif' },
  { id: 53, name: 'Incline Barbell Bench Press', category: 'Chest', muscles: 'Upper Chest, Triceps', icon: 'body-outline' as const, gif: 'incline-barbell-bench-press.gif' },
  { id: 54, name: 'Pec Deck Machine', category: 'Chest', muscles: 'Chest, Front Delts', icon: 'body-outline' as const, gif: 'pec-deck-machine.gif' },
  { id: 55, name: 'Cable Lateral Raises', category: 'Shoulders', muscles: 'Side Delts', icon: 'man-outline' as const, gif: 'cable-lateral-raises.gif' },
  { id: 56, name: 'Sumo Deadlifts', category: 'Legs', muscles: 'Glutes, Hamstrings, Quads', icon: 'walk-outline' as const, gif: 'sumo-deadlifts.gif' },
  { id: 57, name: 'Rack Pulls', category: 'Back', muscles: 'Upper Back, Traps', icon: 'arrow-undo-outline' as const, gif: 'rack-pulls.gif' },
  { id: 58, name: 'Diamond Push-Ups', category: 'Chest', muscles: 'Triceps, Inner Chest', icon: 'body-outline' as const, gif: 'diamond-push-ups.gif' },
  { id: 59, name: 'Barbell Overhead Press', category: 'Shoulders', muscles: 'Shoulders, Triceps, Core', icon: 'man-outline' as const, gif: 'barbell-overhead-press.gif' },
  { id: 60, name: 'Incline Dumbbell Curl', category: 'Arms', muscles: 'Biceps', icon: 'barbell-outline' as const, gif: 'incline-dumbbell-curl.gif' },
];

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];

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
  icon?: any;
}

export default function WorkoutScreen() {
  const navigation = useNavigation<any>();
  const [view, setView] = useState<'folder' | 'builder'>('folder');
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const pickCoverImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo library access to pick a cover image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setCoverImage(result.assets[0].uri);
    }
  };
  
  // Folder state
  const [savedWorkouts, setSavedWorkouts] = useState<any[]>([
    { id: 1, name: 'Chest & Triceps Power', exercises: [], exerciseCount: 5, duration: '45 min', color: '#FF5252', image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=600', isSystemPreset: true },
    { id: 2, name: 'Leg Day Killer', exercises: [], exerciseCount: 6, duration: '60 min', color: '#00E676', image: 'https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=600', isSystemPreset: true },
    { id: 3, name: 'Full Body Blast', exercises: [], exerciseCount: 5, duration: '40 min', color: '#FFD740', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=600', isSystemPreset: true },
    { id: 4, name: 'Core Crusher', exercises: [], exerciseCount: 4, duration: '20 min', color: '#A855F7', image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600', isSystemPreset: true },
    { id: 5, name: 'Cardio Shred', exercises: [], exerciseCount: 4, duration: '30 min', color: '#00D4FF', image: 'https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=600', isSystemPreset: true },
  ]);

  // Builder state
  const [workoutName, setWorkoutName] = useState('My Workout');
  const [exercises, setExercises] = useState<WorkoutExercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [pickerCategory, setPickerCategory] = useState('All');
  const [pickerSearch, setPickerSearch] = useState('');

  const filteredExercises = ALL_EXERCISES.filter(e => {
    const matchCat = pickerCategory === 'All' || e.category === pickerCategory;
    const matchSearch = e.name.toLowerCase().includes(pickerSearch.toLowerCase());
    const alreadyAdded = exercises.some(w => w.id === e.id);
    return matchCat && matchSearch && !alreadyAdded;
  });

  const addExercise = (ex: typeof ALL_EXERCISES[0]) => {
    setExercises(prev => [...prev, {
      ...ex, sets: 3, reps: '12', weight: '', restSeconds: 60,
    }]);
    setShowPicker(false);
  };

  const removeExercise = (idx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const moveExercise = (idx: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= exercises.length) return;
    const copy = [...exercises];
    [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
    setExercises(copy);
  };

  const updateExercise = (idx: number, field: string, value: any) => {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const saveWorkout = () => {
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise to save.');
      return;
    }
    const newWorkout = {
      id: Date.now(),
      name: workoutName,
      exercises: [...exercises],
      exerciseCount: exercises.length,
      duration: `${exercises.length * 8} min`,
      color: COLORS.primary,
      image: coverImage || undefined,
      isSystemPreset: false,
    };
    setSavedWorkouts(prev => [newWorkout, ...prev]);
    setCoverImage(null);
    setView('folder');
  };

  const deleteWorkout = (id: number) => {
    Alert.alert('Delete Workout', 'Are you sure you want to delete this workout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setSavedWorkouts(prev => prev.filter(w => w.id !== id)) }
    ]);
  };

  const startSavedWorkout = (workout: any) => {
    let exs = workout.exercises;
    if (!exs || exs.length === 0) {
      if (workout.id === 1) { // Chest & Triceps
        exs = [
          { ...ALL_EXERCISES.find(e => e.id === 1), sets: 4, reps: '10', weight: '60', restSeconds: 60 },
          { ...ALL_EXERCISES.find(e => e.id === 2), sets: 3, reps: '12', weight: '20', restSeconds: 60 },
          { ...ALL_EXERCISES.find(e => e.id === 3), sets: 3, reps: '15', weight: '15', restSeconds: 45 },
          { ...ALL_EXERCISES.find(e => e.id === 21), sets: 3, reps: '12', weight: '0', restSeconds: 60 },
          { ...ALL_EXERCISES.find(e => e.id === 22), sets: 3, reps: '10', weight: '25', restSeconds: 60 }
        ];
      } else if (workout.id === 2) { // Leg Day
        exs = [
          { ...ALL_EXERCISES.find(e => e.id === 11), sets: 4, reps: '8', weight: '80', restSeconds: 90 },
          { ...ALL_EXERCISES.find(e => e.id === 12), sets: 3, reps: '12', weight: '120', restSeconds: 60 },
          { ...ALL_EXERCISES.find(e => e.id === 13), sets: 3, reps: '10', weight: '60', restSeconds: 60 },
          { ...ALL_EXERCISES.find(e => e.id === 14), sets: 3, reps: '15', weight: '40', restSeconds: 45 },
          { ...ALL_EXERCISES.find(e => e.id === 15), sets: 3, reps: '15', weight: '35', restSeconds: 45 },
          { ...ALL_EXERCISES.find(e => e.id === 30), sets: 4, reps: '20', weight: '30', restSeconds: 45 }
        ];
      } else if (workout.id === 3) { // Full Body Blast
        exs = [
          { ...ALL_EXERCISES.find(e => e.id === 26), sets: 3, reps: '15', weight: '0', restSeconds: 45 }, // Decline Push-Ups
          { ...ALL_EXERCISES.find(e => e.id === 32), sets: 3, reps: '12', weight: '40', restSeconds: 60 }, // Front Squat
          { ...ALL_EXERCISES.find(e => e.id === 10), sets: 3, reps: '8', weight: '0', restSeconds: 60 },  // Pull-Ups
          { ...ALL_EXERCISES.find(e => e.id === 27), sets: 3, reps: '12', weight: '20', restSeconds: 60 }, // Arnold Press
          { ...ALL_EXERCISES.find(e => e.id === 35), sets: 3, reps: '60s', weight: '0', restSeconds: 45 } // Side Plank
        ];
      } else if (workout.id === 4) { // Core Crusher
        exs = [
          { ...ALL_EXERCISES.find(e => e.id === 35), sets: 3, reps: '60s', weight: '0', restSeconds: 30 }, // Side Plank
          { ...ALL_EXERCISES.find(e => e.id === 24), sets: 3, reps: '20', weight: '10', restSeconds: 30 }, // Russian Twist
          { ...ALL_EXERCISES.find(e => e.id === 23), sets: 3, reps: '30', weight: '0', restSeconds: 30 }, // Bicycle Crunches
          { ...ALL_EXERCISES.find(e => e.id === 36), sets: 3, reps: '20', weight: '0', restSeconds: 45 }, // Oblique Crunches
          { ...ALL_EXERCISES.find(e => e.id === 37), sets: 3, reps: '15', weight: '30', restSeconds: 45 }  // Cable Crunch
        ];
      } else if (workout.id === 5) { // Cardio Shred
        exs = [
          { ...ALL_EXERCISES.find(e => e.id === 25), sets: 3, reps: '50', weight: '0', restSeconds: 30 }, // Jumping Jacks
          { ...ALL_EXERCISES.find(e => e.id === 38), sets: 1, reps: '15m', weight: '0', restSeconds: 120 }, // Walking
          { ...ALL_EXERCISES.find(e => e.id === 39), sets: 3, reps: '5m', weight: '0', restSeconds: 60 } // Cycling
        ];
      } else {
        exs = [
          { ...ALL_EXERCISES[0], sets: 3, reps: '12', weight: '20', restSeconds: 60 }
        ];
      }
    }
    navigation.navigate('ActiveWorkout', { workoutName: workout.name, exercises: exs });
  };

  const openBuilder = () => {
    setWorkoutName('New Workout');
    setExercises([]);
    setCoverImage(null);
    setView('builder');
  };

  const renderExerciseItem = useCallback(({ item }: { item: any }) => (
    <ExercisePickerItem ex={item} onAdd={addExercise} />
  ), [addExercise]);

  if (view === 'folder') {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
        <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={styles.header}>
          <Text style={styles.headerTitle}>My Workouts</Text>
          <Text style={styles.headerSub}>Select a routine or build a new one</Text>
        </LinearGradient>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {savedWorkouts.map((wo) => (
            <View key={wo.id} style={styles.savedCard}>
              {wo.image ? (
                <>
                  <Image source={{ uri: wo.image }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
                  <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.9)']} style={StyleSheet.absoluteFillObject} />
                </>
              ) : (
                <LinearGradient colors={[COLORS.cardBg, COLORS.backgroundSecondary]} style={StyleSheet.absoluteFillObject} />
              )}
              
              <View style={styles.savedCardTop}>
                {wo.isSystemPreset && (
                  <View style={[styles.presetBadge, { backgroundColor: wo.color }]}>
                    <Text style={styles.presetBadgeText}>PRESET</Text>
                  </View>
                )}
                {!wo.isSystemPreset && (
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteWorkout(wo.id)}>
                    <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.savedCardBottom}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.savedName}>{wo.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <Ionicons name="barbell-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.savedDetails}>{wo.exerciseCount} Exercises</Text>
                    <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
                    <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.savedDetails}>{wo.duration}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.startBtn, { backgroundColor: wo.color }]} activeOpacity={0.8} onPress={() => startSavedWorkout(wo)}>
                  <Ionicons name="play" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={styles.folderFabContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={openBuilder}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.folderFab}>
              <Ionicons name="add" size={28} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <LinearGradient colors={[COLORS.background, COLORS.backgroundSecondary]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => setView('folder')}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.headerTitle}>Build Workout</Text>
            <Text style={styles.headerSub}>{exercises.length} exercises added</Text>
          </View>
        </View>
        {/* Workout Name Input */}
        <View style={styles.nameInputBox}>
          <Ionicons name="create-outline" size={18} color={COLORS.textTertiary} />
          <TextInput
            style={styles.nameInput}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Workout name..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>
        {/* Cover Photo Picker */}
        <TouchableOpacity style={styles.coverPickerBtn} activeOpacity={0.8} onPress={pickCoverImage}>
          {coverImage ? (
            <Image source={{ uri: coverImage }} style={styles.coverPreview} resizeMode="cover" />
          ) : (
            <View style={styles.coverPickerEmpty}>
              <Ionicons name="image-outline" size={22} color={COLORS.primary} />
              <Text style={styles.coverPickerText}>Add Cover Photo</Text>
            </View>
          )}
          {coverImage && (
            <View style={styles.coverEditBadge}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
      </LinearGradient>

      {/* Exercise List */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {exercises.map((ex, idx) => (
          <View key={`${ex.id}-${idx}`} style={styles.exerciseCard}>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseOrder}>
                <Text style={styles.exerciseOrderText}>{idx + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseMuscles}>{ex.muscles}</Text>
              </View>
              <View style={styles.exerciseActions}>
                <TouchableOpacity onPress={() => moveExercise(idx, 'up')} disabled={idx === 0}>
                  <Ionicons name="chevron-up" size={18} color={idx === 0 ? COLORS.textMuted : COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => moveExercise(idx, 'down')} disabled={idx === exercises.length - 1}>
                  <Ionicons name="chevron-down" size={18} color={idx === exercises.length - 1 ? COLORS.textMuted : COLORS.textSecondary} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeExercise(idx)}>
                  <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Details Row */}
            <View style={styles.detailsRow}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Sets</Text>
                <View style={styles.detailControl}>
                  <TouchableOpacity onPress={() => updateExercise(idx, 'sets', Math.max(1, ex.sets - 1))}>
                    <Ionicons name="remove-circle-outline" size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.detailValue}>{ex.sets}</Text>
                  <TouchableOpacity onPress={() => updateExercise(idx, 'sets', ex.sets + 1)}>
                    <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Reps</Text>
                <TextInput style={styles.detailInput} value={ex.reps} onChangeText={v => updateExercise(idx, 'reps', v)} keyboardType="numeric" />
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Weight</Text>
                <TextInput style={styles.detailInput} value={ex.weight} onChangeText={v => updateExercise(idx, 'weight', v)} placeholder="kg" placeholderTextColor={COLORS.textMuted} />
              </View>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Rest (s)</Text>
                <TextInput style={styles.detailInput} value={`${ex.restSeconds}`} onChangeText={v => updateExercise(idx, 'restSeconds', parseInt(v) || 0)} keyboardType="numeric" />
              </View>
            </View>
          </View>
        ))}

        {/* Add Exercise Button */}
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8} onPress={() => setShowPicker(true)}>
          <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          <Text style={styles.addBtnText}>Add Exercise</Text>
        </TouchableOpacity>

        {exercises.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={56} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptySub}>Tap "Add Exercise" to build your workout</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Save Workout FAB */}
      {exercises.length > 0 && (
        <View style={styles.fabContainer}>
          <TouchableOpacity activeOpacity={0.9} onPress={saveWorkout}>
            <LinearGradient colors={[COLORS.success, '#00C853']} style={styles.fab}>
              <Ionicons name="save" size={22} color="#FFF" />
              <Text style={styles.fabText}>Save Workout</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ─── Exercise Picker Modal ─── */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerContent}>
            <View style={styles.pickerHeader}>
              <Text style={styles.pickerTitle}>Add Exercise</Text>
              <TouchableOpacity onPress={() => setShowPicker(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.pickerSearch}>
              <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
              <TextInput
                style={styles.pickerSearchInput}
                placeholder="Search exercises..."
                placeholderTextColor={COLORS.textMuted}
                value={pickerSearch}
                onChangeText={setPickerSearch}
                autoCorrect={false}
              />
              {pickerSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPickerSearch('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category Filter — fixed scrollable row */}
            <View style={styles.pickerFilterRow}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pickerFilterContent}
                keyboardShouldPersistTaps="handled"
              >
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.filterChip, pickerCategory === cat && styles.filterChipActive]}
                    onPress={() => setPickerCategory(cat)}
                  >
                    <Text style={[styles.filterText, pickerCategory === cat && styles.filterTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Exercise List — FlatList for performance */}
            <FlatList
              data={filteredExercises}
              keyExtractor={item => String(item.id)}
              renderItem={renderExerciseItem}
              style={styles.pickerList}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={8}
              maxToRenderPerBatch={6}
              windowSize={5}
              removeClippedSubviews
              ListEmptyComponent={
                <View style={{ alignItems: 'center', paddingVertical: 40 }}>
                  <Ionicons name="search-outline" size={40} color={COLORS.textMuted} />
                  <Text style={{ color: COLORS.textTertiary, marginTop: 8 }}>No exercises found</Text>
                </View>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingBase },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacingBase },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  headerSub: { fontSize: SIZES.sm, color: COLORS.textTertiary },
  headerBadge: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center' },
  backBtn: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  nameInputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: 14, height: 44, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  nameInput: { flex: 1, fontSize: SIZES.md, color: COLORS.text, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: SIZES.spacingLg },
  // Saved Folder Card
  savedCard: { height: 160, borderRadius: SIZES.radiusXl, overflow: 'hidden', marginBottom: SIZES.spacingMd, ...SHADOWS.medium },
  savedCardTop: { flexDirection: 'row', justifyContent: 'space-between', padding: SIZES.spacingLg },
  presetBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radiusFull, alignSelf: 'flex-start' },
  presetBadgeText: { fontSize: 10, color: '#FFF', fontWeight: '800' },
  deleteBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', marginLeft: 'auto' },
  savedCardBottom: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', padding: SIZES.spacingLg },
  savedName: { fontSize: SIZES.xl, fontWeight: '800', color: '#FFF' },
  savedDetails: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  startBtn: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', ...SHADOWS.small },
  folderFabContainer: { position: 'absolute', bottom: 100, right: SIZES.spacingLg },
  folderFab: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', ...SHADOWS.medium },
  // Exercise Card
  exerciseCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  exerciseHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  exerciseOrder: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  exerciseOrderText: { fontSize: 12, fontWeight: '800', color: COLORS.primary },
  exerciseName: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  exerciseMuscles: { fontSize: SIZES.xs, color: COLORS.textSecondary },
  exerciseActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  // Details
  detailsRow: { flexDirection: 'row', gap: 8 },
  detailBox: { flex: 1, alignItems: 'center' },
  detailLabel: { fontSize: 10, color: COLORS.textTertiary, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  detailControl: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailValue: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, minWidth: 20, textAlign: 'center' },
  detailInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, paddingHorizontal: 8, paddingVertical: 6, fontSize: SIZES.sm, color: COLORS.text, textAlign: 'center', borderWidth: 1, borderColor: COLORS.border, width: '100%' },
  // Add Button
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary + '12', borderRadius: SIZES.radiusMd, paddingVertical: 14, borderWidth: 1, borderColor: COLORS.primary + '30', borderStyle: 'dashed' },
  addBtnText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.primary },
  // Empty
  emptyState: { alignItems: 'center', paddingVertical: 50 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.textSecondary, marginTop: 12 },
  emptySub: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: 4 },
  // FAB
  fabContainer: { position: 'absolute', bottom: 100, left: SIZES.spacingLg, right: SIZES.spacingLg },
  fab: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: SIZES.radiusMd, ...SHADOWS.medium },
  fabText: { fontSize: SIZES.base, fontWeight: '800', color: '#FFF' },
  // Cover Photo Picker
  coverPickerBtn: { marginTop: SIZES.spacingBase, borderRadius: SIZES.radiusMd, overflow: 'hidden', height: 80, borderWidth: 1, borderColor: COLORS.border, borderStyle: 'dashed' },
  coverPickerEmpty: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: COLORS.primary + '08' },
  coverPickerText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.primary },
  coverPreview: { width: '100%', height: '100%' },
  coverEditBadge: { position: 'absolute', bottom: 8, right: 8, backgroundColor: COLORS.primary, borderRadius: 12, padding: 4 },
  // Picker Modal
  pickerOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  pickerContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 16 },
  pickerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacingLg, paddingBottom: SIZES.spacingBase },
  pickerTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  pickerSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, marginHorizontal: SIZES.spacingLg, borderRadius: SIZES.radiusMd, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  pickerSearchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.text },
  pickerFilterRow: { marginTop: 10 },
  pickerFilterContent: { paddingHorizontal: SIZES.spacingLg, gap: 8, paddingBottom: 4 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '600' },
  filterTextActive: { color: '#FFF', fontWeight: '700' },
  pickerList: { marginTop: 8, paddingHorizontal: SIZES.spacingLg },
  // Exercise picker item with GIF
  pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: COLORS.border + '80' },
  pickerGifBox: { width: 60, height: 60, borderRadius: SIZES.radiusMd, overflow: 'hidden', backgroundColor: COLORS.surface, marginRight: 12, position: 'relative' },
  pickerGif: { width: 60, height: 60, position: 'absolute' },
  pickerGifPlaceholder: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.primary + '15' },
  pickerItemInfo: { flex: 1 },
  pickerItemName: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  pickerItemMuscles: { fontSize: SIZES.xs, color: COLORS.textTertiary, fontWeight: '500' },
  pickerAddBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
});
