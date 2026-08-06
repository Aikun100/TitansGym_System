import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Image, Dimensions, Modal, Animated, FlatList
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Constants from 'expo-constants';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.spacingLg * 2 - SIZES.spacingMd) / 2;

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

const EXERCISES = [
  { id: 1, name: 'Bench Press', category: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Chest, Triceps', gif: 'bench-press.gif', instructions: '1. Lie on bench\n2. Grip bar shoulder-width\n3. Lower to chest\n4. Press back up' },
  { id: 2, name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Upper Chest', gif: 'incline-dumbbell-flyes.gif', instructions: '1. Set bench to 30-45 degrees\n2. Press dumbbells up\n3. Lower with control\n4. Squeeze chest at top' },
  { id: 3, name: 'Cable Crossover', category: 'Chest', equipment: 'Cable Machine', difficulty: 'Intermediate', muscles: 'Chest, Front Delts', gif: 'cable-crossover.gif', instructions: '1. Set pulleys high\n2. Pull handles down and together\n3. Squeeze chest\n4. Return slowly' },
  { id: 4, name: 'Dumbbell Flyes', category: 'Chest', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Chest', gif: 'dumbbell-flyes.gif', instructions: '1. Lie flat on bench\n2. Open arms wide with slight bend\n3. Bring dumbbells together\n4. Squeeze at top' },
  { id: 5, name: 'Decline Bench Press', category: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Lower Chest', gif: 'decline-barbell-bench-press.gif', instructions: '1. Lie on decline bench\n2. Grip bar shoulder-width\n3. Lower to lower chest\n4. Press back up' },
  { id: 6, name: 'Lat Pulldown', category: 'Back', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Lats, Biceps', gif: 'lat-pulldown.gif', instructions: '1. Grip bar wide\n2. Pull down to upper chest\n3. Squeeze lats\n4. Return slowly' },
  { id: 7, name: 'Barbell Rows', category: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Back, Biceps', gif: 'barbell rows.gif', instructions: '1. Bend at hips\n2. Keep back straight\n3. Pull bar to stomach\n4. Lower with control' },
  { id: 8, name: 'Dumbbell Rows', category: 'Back', equipment: 'Dumbbell', difficulty: 'Beginner', muscles: 'Lats', gif: 'dumbbell-rows.gif', instructions: '1. Support on bench\n2. Pull dumbbell up\n3. Squeeze back\n4. Lower slowly' },
  { id: 9, name: 'T-Bar Rows', category: 'Back', equipment: 'T-Bar', difficulty: 'Intermediate', muscles: 'Middle Back', gif: 't-bar-rows.gif', instructions: '1. Stand over bar\n2. Grip handles\n3. Pull to chest\n4. Lower slowly' },
  { id: 10, name: 'Pull-Ups', category: 'Back', equipment: 'Pull-Up Bar', difficulty: 'Advanced', muscles: 'Lats, Biceps, Core', gif: 'chin-ups.gif', instructions: '1. Hang from bar\n2. Pull body up\n3. Chin over bar\n4. Lower with control' },
  { id: 11, name: 'Barbell Squats', category: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', muscles: 'Quads, Glutes', gif: 'barbell-back-squats.gif', instructions: '1. Rest bar on traps\n2. Squat down\n3. Keep chest up\n4. Drive up through heels' },
  { id: 12, name: 'Leg Press', category: 'Legs', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Quads, Glutes', gif: 'hack-squats.gif', instructions: '1. Sit in machine\n2. Place feet on platform\n3. Press weight up\n4. Lower slowly' },
  { id: 13, name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Hamstrings', gif: 'romanian-deadlifts.gif', instructions: '1. Hold bar at hips\n2. Hinge forward\n3. Keep legs straight\n4. Stand back up' },
  { id: 14, name: 'Leg Extension', category: 'Legs', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Quadriceps', gif: 'LEG-EXTENSION.gif', instructions: '1. Sit in machine\n2. Extend legs fully\n3. Squeeze quads\n4. Lower slowly' },
  { id: 15, name: 'Leg Curl', category: 'Legs', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Hamstrings', gif: 'LEG_CURL.gif', instructions: '1. Lie face down\n2. Curl legs up\n3. Squeeze hamstrings\n4. Lower slowly' },
  { id: 16, name: 'Shoulder Press', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Shoulders, Triceps', gif: 'dumbbell-shoulder-press.gif', instructions: '1. Sit upright\n2. Press dumbbells overhead\n3. Don\'t lock elbows\n4. Lower to ears' },
  { id: 17, name: 'Lateral Raises', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Side Delts', gif: 'lateral-raises.gif', instructions: '1. Hold dumbbells at sides\n2. Raise arms out to sides\n3. Keep slight bend in elbows\n4. Lower slowly' },
  { id: 18, name: 'Face Pulls', category: 'Shoulders', equipment: 'Cable Machine', difficulty: 'Intermediate', muscles: 'Rear Delts', gif: 'face-pulls.gif', instructions: '1. Set pulley high\n2. Pull rope to face\n3. Flare elbows out\n4. Squeeze rear delts' },
  { id: 19, name: 'Barbell Curls', category: 'Arms', equipment: 'Barbell', difficulty: 'Beginner', muscles: 'Biceps', gif: 'cable-bicep-curl.gif', instructions: '1. Stand straight\n2. Curl bar up\n3. Keep elbows stationary\n4. Lower slowly' },
  { id: 20, name: 'Hammer Curls', category: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Biceps, Forearms', gif: 'hammer-curls.gif', instructions: '1. Hold dumbbells neutral grip\n2. Curl up\n3. Squeeze biceps\n4. Lower slowly' },
  { id: 21, name: 'Tricep Dips', category: 'Arms', equipment: 'Dip Bar', difficulty: 'Intermediate', muscles: 'Triceps', gif: 'Triceps-Dips.gif', instructions: '1. Support body on bars\n2. Lower until 90 degrees\n3. Keep chest up\n4. Push back up' },
  { id: 22, name: 'Skull Crushers', category: 'Arms', equipment: 'EZ Bar', difficulty: 'Intermediate', muscles: 'Triceps', gif: 'SKULL_CRUSHERS.gif', instructions: '1. Lie on bench\n2. Lower bar to forehead\n3. Keep elbows pointed up\n4. Extend arms up' },
  { id: 23, name: 'Bicycle Crunches', category: 'Core', equipment: 'None', difficulty: 'Intermediate', muscles: 'Abs, Obliques', gif: 'Bicycle-Crunch.gif', instructions: '1. Lie on back\n2. Alternate elbow to knee\n3. Twist torso\n4. Keep continuous motion' },
  { id: 24, name: 'Russian Twist', category: 'Core', equipment: 'Medicine Ball', difficulty: 'Intermediate', muscles: 'Obliques', gif: 'Russian-Twist.gif', instructions: '1. Sit on floor\n2. Lean back slightly\n3. Twist torso side to side\n4. Touch ball to floor' },
  { id: 25, name: 'Jumping Jacks', category: 'Cardio', equipment: 'None', difficulty: 'Beginner', muscles: 'Full Body', gif: 'jumping-jacks.gif', instructions: '1. Stand with feet together\n2. Jump feet apart, arms up\n3. Jump back together\n4. Repeat quickly' },
  { id: 26, name: 'Decline Push-Ups', category: 'Chest', equipment: 'None', difficulty: 'Intermediate', muscles: 'Upper Chest, Triceps', gif: 'decline-push-ups.gif', instructions: '1. Feet on elevated surface\n2. Hands on floor\n3. Lower chest down\n4. Push back up' },
  { id: 27, name: 'Arnold Press', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Shoulders', gif: 'arnold-press.gif', instructions: '1. Start with palms facing you\n2. Press and rotate wrists\n3. Finish with palms forward\n4. Reverse motion' },
  { id: 28, name: 'Back Deadlifts', category: 'Back', equipment: 'Barbell', difficulty: 'Advanced', muscles: 'Back, Glutes, Hamstrings', gif: 'back-deadlifts.gif', instructions: '1. Stand over bar\n2. Hinge at hips, grip bar\n3. Drive through heels\n4. Stand tall, squeeze glutes' },
  { id: 29, name: 'Bulgarian Split Squat', category: 'Legs', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Quads, Glutes', gif: 'Bulgarian-Split-Squat.gif', instructions: '1. Back foot on bench\n2. Lower hips down\n3. Front knee at 90 degrees\n4. Push back to start' },
  { id: 30, name: 'Glute Kickback', category: 'Legs', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Glutes', gif: 'GLUTE_Kickback-machine.gif', instructions: '1. Support on machine\n2. Kick leg back\n3. Squeeze glutes\n4. Return slowly' },
  { id: 31, name: 'Dumbbell Shrugs', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Traps', gif: 'dumbbell-shrugs.gif', instructions: '1. Hold dumbbells at sides\n2. Shrug shoulders to ears\n3. Squeeze at top\n4. Lower slowly' },
  { id: 32, name: 'Front Squat', category: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Quads, Core', gif: 'Front-Squat.gif', instructions: '1. Bar rests on front shoulders\n2. Keep elbows high\n3. Squat down deep\n4. Drive up through heels' },
  { id: 33, name: 'Concentration Curls', category: 'Arms', equipment: 'Dumbbell', difficulty: 'Beginner', muscles: 'Biceps', gif: 'Concentration-Curl.gif', instructions: '1. Sit on bench\n2. Rest elbow on inner thigh\n3. Curl dumbbell up\n4. Lower slowly' },
  { id: 34, name: 'Preacher Curls', category: 'Arms', equipment: 'EZ Bar', difficulty: 'Intermediate', muscles: 'Biceps', gif: 'preacher-curl.gif', instructions: '1. Sit at preacher bench\n2. Armpits snug against pad\n3. Curl bar up\n4. Lower with control' },
  { id: 35, name: 'Side Plank', category: 'Core', equipment: 'None', difficulty: 'Beginner', muscles: 'Obliques, Core', gif: 'hyperextensions.gif', instructions: '1. Forearm side plank\n2. Body in straight line\n3. Lift hips\n4. Hold for time' },
  { id: 36, name: 'Oblique Crunches', category: 'Core', equipment: 'None', difficulty: 'Beginner', muscles: 'Obliques', gif: 'oblique-crunches.gif', instructions: '1. Lie on side\n2. Crunch sideways\n3. Squeeze obliques\n4. Lower slowly' },
  { id: 37, name: 'Cable Crunch', category: 'Core', equipment: 'Cable Machine', difficulty: 'Intermediate', muscles: 'Abs', gif: 'Cable-Crunch.gif', instructions: '1. Kneel at cable\n2. Pull rope behind neck\n3. Crunch down\n4. Squeeze abs' },
  { id: 38, name: 'Walking', category: 'Cardio', equipment: 'Treadmill', difficulty: 'Beginner', muscles: 'Legs, Cardio', gif: 'walking.gif', instructions: '1. Start treadmill slowly\n2. Maintain brisk pace\n3. Keep chest up\n4. Pump arms' },
  { id: 39, name: 'Cycling', category: 'Cardio', equipment: 'Bike', difficulty: 'Beginner', muscles: 'Legs, Cardio', gif: 'cycling.gif', instructions: '1. Adjust seat\n2. Push pedals smoothly\n3. Maintain cadence\n4. Adjust resistance' },
  { id: 40, name: 'Dumbbell Bench Press', category: 'Chest', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Chest, Triceps', gif: 'dumbbell-bench-press.gif', instructions: '1. Lie on bench with dumbbells\n2. Press up together\n3. Squeeze chest at top\n4. Lower with control' },
  { id: 41, name: 'Close Grip Bench Press', category: 'Arms', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Triceps, Chest', gif: 'close-grip-bench-press.gif', instructions: '1. Grip bar narrow\n2. Keep elbows tucked in\n3. Lower to chest\n4. Press up powerfully' },
  { id: 42, name: 'Wide Grip Lat Pulldown', category: 'Back', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Lats, Rear Delts', gif: 'wide-grip-lat-pulldown.gif', instructions: '1. Grip bar wide\n2. Lean back slightly\n3. Pull to upper chest\n4. Squeeze lats' },
  { id: 43, name: 'Close Grip Lat Pulldown', category: 'Back', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Lats, Biceps', gif: 'close-grip-lat-pulldown.gif', instructions: '1. Grip bar close\n2. Keep torso upright\n3. Pull to chin\n4. Return slowly' },
  { id: 44, name: 'Chest Supported Rows', category: 'Back', equipment: 'Dumbbell, Bench', difficulty: 'Beginner', muscles: 'Mid Back, Rear Delts', gif: 'chest-supported-rows.gif', instructions: '1. Lie prone on incline bench\n2. Hold dumbbells hanging\n3. Row up to sides\n4. Squeeze shoulder blades' },
  { id: 45, name: 'Barbell Hip Thrust', category: 'Legs', equipment: 'Barbell, Bench', difficulty: 'Intermediate', muscles: 'Glutes, Hamstrings', gif: 'Barbell-Hip-Thrust.gif', instructions: '1. Shoulders on bench\n2. Bar across hips\n3. Drive hips up\n4. Squeeze glutes at top' },
  { id: 46, name: 'Hyperextensions', category: 'Back', equipment: 'GHD Machine', difficulty: 'Beginner', muscles: 'Lower Back, Glutes', gif: 'hyperextensions.gif', instructions: '1. Lock legs in machine\n2. Cross arms on chest\n3. Lower torso down\n4. Raise back to level' },
  { id: 47, name: 'Tricep Kickbacks', category: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Triceps', gif: 'tricep-kickback.gif', instructions: '1. Hinge forward at hips\n2. Upper arm parallel to floor\n3. Extend forearm back\n4. Squeeze at top' },
  { id: 48, name: 'Overhead Tricep Extension', category: 'Arms', equipment: 'Dumbbell', difficulty: 'Beginner', muscles: 'Triceps', gif: 'overhead-triceps-extensions.gif', instructions: '1. Hold dumbbell overhead\n2. Lower behind head\n3. Extend arms up\n4. Keep elbows close' },
  { id: 49, name: 'Front Raises', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Front Delts', gif: 'front-raises.gif', instructions: '1. Hold dumbbells at thighs\n2. Raise arms forward\n3. Go to shoulder height\n4. Lower with control' },
  { id: 50, name: 'Rear Delt Flyes', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Rear Delts', gif: 'rear-delt-flyes.gif', instructions: '1. Bend forward at hips\n2. Arms hanging down\n3. Raise arms out to sides\n4. Squeeze rear delts' },
  { id: 51, name: 'Upright Rows', category: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Traps, Side Delts', gif: 'upright-rows.gif', instructions: '1. Hold bar close grip\n2. Pull bar up to chin\n3. Elbows lead the motion\n4. Lower slowly' },
  { id: 52, name: 'Sit-Ups', category: 'Core', equipment: 'None', difficulty: 'Beginner', muscles: 'Abs, Hip Flexors', gif: 'SIT_UPS.gif', instructions: '1. Lie on back\n2. Knees bent, feet flat\n3. Curl torso all the way up\n4. Lower with control' },
  { id: 53, name: 'Incline Barbell Bench Press', category: 'Chest', equipment: 'Barbell, Bench', difficulty: 'Intermediate', muscles: 'Upper Chest, Triceps', gif: 'incline-barbell-bench-press.gif', instructions: '1. Set bench to 30-45 degrees\n2. Grip bar shoulder-width\n3. Lower to upper chest\n4. Press back up' },
  { id: 54, name: 'Pec Deck Machine', category: 'Chest', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Chest, Front Delts', gif: 'pec-deck-machine.gif', instructions: '1. Sit in machine\n2. Grip handles\n3. Bring arms together\n4. Squeeze chest' },
  { id: 55, name: 'Cable Lateral Raises', category: 'Shoulders', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Side Delts', gif: 'cable-lateral-raises.gif', instructions: '1. Stand beside cable\n2. Hold low pulley\n3. Raise arm to side\n4. Lower slowly' },
  { id: 56, name: 'Sumo Deadlifts', category: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', muscles: 'Glutes, Hamstrings, Quads', gif: 'sumo-deadlifts.gif', instructions: '1. Wide stance, toes out\n2. Grip bar inside legs\n3. Drive hips forward\n4. Stand tall' },
  { id: 57, name: 'Rack Pulls', category: 'Back', equipment: 'Barbell, Rack', difficulty: 'Intermediate', muscles: 'Upper Back, Traps', gif: 'rack-pulls.gif', instructions: '1. Set bar at knee height\n2. Deadlift from rack pins\n3. Drive hips forward\n4. Lower with control' },
  { id: 58, name: 'Diamond Push-Ups', category: 'Chest', equipment: 'None', difficulty: 'Intermediate', muscles: 'Triceps, Inner Chest', gif: 'diamond-push-ups.gif', instructions: '1. Hands form diamond shape\n2. Lower chest to hands\n3. Keep elbows close\n4. Push back up' },
  { id: 59, name: 'Barbell Overhead Press', category: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Shoulders, Triceps, Core', gif: 'barbell-overhead-press.gif', instructions: '1. Bar at shoulder height\n2. Press overhead\n3. Lock arms at top\n4. Lower with control' },
  { id: 60, name: 'Incline Dumbbell Curl', category: 'Arms', equipment: 'Dumbbells, Bench', difficulty: 'Intermediate', muscles: 'Biceps', gif: 'incline-dumbbell-curl.gif', instructions: '1. Sit on incline bench\n2. Arms hang straight down\n3. Curl up slowly\n4. Lower fully each rep' },
];

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
const difficultyColors: Record<string, string> = { Beginner: COLORS.success, Intermediate: COLORS.warning, Advanced: COLORS.danger };
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Chest: 'body-outline', Back: 'arrow-undo-outline', Legs: 'walk-outline',
  Shoulders: 'man-outline', Arms: 'barbell-outline', Core: 'fitness-outline',
  Cardio: 'heart-outline',
};

export default function ExerciseLibrary({ navigation, route }: any) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(route?.params?.category || 'All');
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISES[0] | null>(null);

  React.useEffect(() => {
    if (route?.params?.category) {
      setCategory(route.params.category);
    }
  }, [route?.params?.category]);

  const filtered = React.useMemo(() => {
    return EXERCISES.filter(e => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || e.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category]);

  const renderExerciseCard = React.useCallback(({ item: exercise }: { item: typeof EXERCISES[0] }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.8}
      onPress={() => setSelectedExercise(exercise)}>
      <View style={styles.cardImageBox}>
        <Image source={{ uri: gifUrl(exercise.gif) }}
          style={styles.cardImage} resizeMode="cover"
          defaultSource={undefined} />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={styles.cardOverlay} />
        <View style={[styles.diffBadge, { backgroundColor: (difficultyColors[exercise.difficulty] || COLORS.accent) + 'CC' }]}>
          <Text style={styles.diffText}>{exercise.difficulty}</Text>
        </View>
        <View style={styles.categoryTag}>
          <Text style={styles.categoryTagText}>{exercise.category}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardName} numberOfLines={1}>{exercise.name}</Text>
        <Text style={styles.cardMuscles} numberOfLines={1}>{exercise.muscles}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.equipChip}>
            <Ionicons name="barbell-outline" size={10} color={COLORS.textTertiary} />
            <Text style={styles.equipText} numberOfLines={1}>{exercise.equipment.split(',')[0]}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Exercise Library</Text>
            <Text style={styles.headerSubtitle}>{filtered.length} exercises available</Text>
          </View>
          <View style={styles.headerBadge}>
            <Ionicons name="barbell" size={20} color={COLORS.primary} />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} />
          <TextInput style={styles.searchInput} placeholder="Search exercises or muscles..."
            placeholderTextColor={COLORS.textMuted} value={search} onChangeText={setSearch} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.textTertiary} />
          </TouchableOpacity>}
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.filterChip, category === cat && styles.filterChipActive]}
            onPress={() => setCategory(cat)} activeOpacity={0.7}>
            {cat !== 'All' && <Ionicons name={categoryIcons[cat] || 'ellipse'} size={14}
              color={category === cat ? '#FFF' : COLORS.textTertiary} />}
            <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Exercise Grid */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id.toString()}
        renderItem={renderExerciseCard}
        numColumns={2}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridColumnWrapper}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or category</Text>
          </View>
        }
        ListFooterComponent={<View style={{ height: 120 }} />}
      />

      {/* Exercise Detail Modal */}
      <Modal visible={!!selectedExercise} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedExercise && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalImageBox}>
                  <Image source={{ uri: gifUrl(selectedExercise.gif) }}
                    style={styles.modalImage} resizeMode="contain" />
                  <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedExercise(null)}>
                    <Ionicons name="close" size={24} color="#FFF" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <Text style={styles.modalTitle}>{selectedExercise.name}</Text>

                  <View style={styles.modalTags}>
                    <View style={[styles.modalTag, { backgroundColor: COLORS.primary + '20' }]}>
                      <Ionicons name="body-outline" size={14} color={COLORS.primary} />
                      <Text style={[styles.modalTagText, { color: COLORS.primary }]}>{selectedExercise.category}</Text>
                    </View>
                    <View style={[styles.modalTag, { backgroundColor: (difficultyColors[selectedExercise.difficulty] || COLORS.accent) + '20' }]}>
                      <Ionicons name="speedometer-outline" size={14} color={difficultyColors[selectedExercise.difficulty]} />
                      <Text style={[styles.modalTagText, { color: difficultyColors[selectedExercise.difficulty] }]}>{selectedExercise.difficulty}</Text>
                    </View>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Target Muscles</Text>
                    <Text style={styles.modalSectionText}>{selectedExercise.muscles}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Equipment</Text>
                    <Text style={styles.modalSectionText}>{selectedExercise.equipment}</Text>
                  </View>

                  <View style={styles.modalSection}>
                    <Text style={styles.modalSectionTitle}>Instructions</Text>
                    {selectedExercise.instructions.split('\n').map((line, i) => (
                      <View key={i} style={styles.instructionRow}>
                        <View style={styles.instructionDot}>
                          <Text style={styles.instructionNum}>{i + 1}</Text>
                        </View>
                        <Text style={styles.instructionText}>{line.replace(/^\d+\.\s*/, '')}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SIZES.spacingBase, gap: 12 },
  backBtn: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  headerSubtitle: { fontSize: SIZES.sm, color: COLORS.textTertiary },
  headerBadge: { marginLeft: 'auto', width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 46, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.text },
  filterScroll: { maxHeight: 50, minHeight: 50 },
  filterContent: { paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingSm, alignItems: 'center' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  filterTextActive: { color: '#FFF', fontWeight: '700' },
  scrollView: { flex: 1 },
  gridContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingMd },
  gridColumnWrapper: { justifyContent: 'space-between', marginBottom: SIZES.spacingMd },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacingMd },
  card: { width: CARD_WIDTH, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, ...SHADOWS.small },
  cardImageBox: { height: 130, backgroundColor: COLORS.surface, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 40 },
  diffBadge: { position: 'absolute', top: 8, right: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusFull },
  diffText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  categoryTag: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusFull, backgroundColor: 'rgba(0,0,0,0.5)' },
  categoryTagText: { fontSize: 9, fontWeight: '600', color: '#FFF' },
  cardBody: { padding: 10 },
  cardName: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  cardMuscles: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 6 },
  cardFooter: { flexDirection: 'row' },
  equipChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.surface, paddingHorizontal: 6, paddingVertical: 2, borderRadius: SIZES.radiusFull },
  equipText: { fontSize: 9, color: COLORS.textTertiary },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SIZES.spacingBase },
  emptySubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  modalImageBox: { height: 260, backgroundColor: COLORS.surface, position: 'relative' },
  modalImage: { width: '100%', height: '100%', backgroundColor: COLORS.surface },
  modalClose: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBody: { padding: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: SIZES.spacingMd },
  modalTags: { flexDirection: 'row', gap: SIZES.spacingSm, marginBottom: SIZES.spacingXl },
  modalTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  modalTagText: { fontSize: SIZES.sm, fontWeight: '600' },
  modalSection: { marginBottom: SIZES.spacingXl },
  modalSectionTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 8 },
  modalSectionText: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  instructionDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  instructionNum: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  instructionText: { flex: 1, fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 20 },
});
