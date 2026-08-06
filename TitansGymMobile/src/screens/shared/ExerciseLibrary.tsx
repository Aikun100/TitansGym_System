import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  TextInput, Image, Dimensions, Modal, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.spacingLg * 2 - SIZES.spacingMd) / 2;

// Base URL for exercise GIFs served from Laravel
const GIF_BASE = 'http://10.0.0.50:8001/lottie/exercises';

const EXERCISES = [
  { id: 1, name: 'Bench Press', category: 'Chest', equipment: 'Barbell, Bench', difficulty: 'Intermediate', muscles: 'Chest, Triceps, Shoulders', gif: 'bench-press.gif', instructions: '1. Lie on bench\n2. Grip barbell shoulder width\n3. Lower to chest slowly\n4. Push up explosively' },
  { id: 2, name: 'Incline Dumbbell Press', category: 'Chest', equipment: 'Dumbbells, Bench', difficulty: 'Intermediate', muscles: 'Upper Chest, Shoulders', gif: 'incline-dumbbell-flyes.gif', instructions: '1. Set bench to 30-45°\n2. Hold dumbbells at chest\n3. Press up and slightly in\n4. Lower with control' },
  { id: 3, name: 'Cable Crossover', category: 'Chest', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Chest, Front Delts', gif: 'cable-crossover.gif', instructions: '1. Set pulleys high\n2. Slight forward lean\n3. Bring hands together\n4. Squeeze chest hard' },
  { id: 4, name: 'Dumbbell Flyes', category: 'Chest', equipment: 'Dumbbells, Bench', difficulty: 'Beginner', muscles: 'Chest, Front Delts', gif: 'dumbbell-flyes.gif', instructions: '1. Lie flat with dumbbells\n2. Arms slightly bent\n3. Lower to sides\n4. Squeeze to top' },
  { id: 5, name: 'Decline Bench Press', category: 'Chest', equipment: 'Barbell, Bench', difficulty: 'Intermediate', muscles: 'Lower Chest, Triceps', gif: 'decline-barbell-bench-press.gif', instructions: '1. Set bench to decline\n2. Grip bar at shoulder width\n3. Lower to lower chest\n4. Press up powerfully' },
  { id: 6, name: 'Lat Pulldown', category: 'Back', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Lats, Biceps, Rear Delts', gif: 'lat-pulldown.gif', instructions: '1. Grip bar wide\n2. Sit with thighs secured\n3. Pull bar to upper chest\n4. Squeeze lats' },
  { id: 7, name: 'Barbell Rows', category: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Back, Biceps', gif: 'barbell rows.gif', instructions: '1. Hinge at hips\n2. Grip bar overhand\n3. Row to lower chest\n4. Squeeze shoulder blades' },
  { id: 8, name: 'Dumbbell Rows', category: 'Back', equipment: 'Dumbbell, Bench', difficulty: 'Beginner', muscles: 'Lats, Rhomboids', gif: 'dumbbell-rows.gif', instructions: '1. One knee on bench\n2. Pull dumbbell to hip\n3. Squeeze at top\n4. Lower slowly' },
  { id: 9, name: 'T-Bar Rows', category: 'Back', equipment: 'T-Bar', difficulty: 'Intermediate', muscles: 'Middle Back, Lats', gif: 't-bar-rows.gif', instructions: '1. Straddle the bar\n2. Grip close handles\n3. Row to chest\n4. Control the negative' },
  { id: 10, name: 'Pull-Ups', category: 'Back', equipment: 'Pull-up Bar', difficulty: 'Advanced', muscles: 'Lats, Biceps, Core', gif: 'chin-ups.gif', instructions: '1. Hang with overhand grip\n2. Pull chin above bar\n3. Squeeze shoulder blades\n4. Lower with control' },
  { id: 11, name: 'Barbell Squats', category: 'Legs', equipment: 'Barbell, Rack', difficulty: 'Intermediate', muscles: 'Quads, Glutes, Hamstrings', gif: 'barbell-back-squats.gif', instructions: '1. Bar on upper back\n2. Feet shoulder-width\n3. Squat to parallel\n4. Drive through heels' },
  { id: 12, name: 'Leg Press', category: 'Legs', equipment: 'Leg Press Machine', difficulty: 'Beginner', muscles: 'Quads, Glutes', gif: 'hack-squats.gif', instructions: '1. Sit in machine\n2. Feet shoulder-width\n3. Lower weight slowly\n4. Push through heels' },
  { id: 13, name: 'Romanian Deadlift', category: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', muscles: 'Hamstrings, Glutes', gif: 'romanian-deadlifts.gif', instructions: '1. Hold bar at hips\n2. Push hips back\n3. Lower along legs\n4. Feel hamstring stretch' },
  { id: 14, name: 'Leg Extension', category: 'Legs', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Quadriceps', gif: 'LEG-EXTENSION.gif', instructions: '1. Sit in machine\n2. Hook ankles under pad\n3. Extend legs fully\n4. Squeeze quads at top' },
  { id: 15, name: 'Leg Curl', category: 'Legs', equipment: 'Machine', difficulty: 'Beginner', muscles: 'Hamstrings', gif: 'LEG_CURL.gif', instructions: '1. Lie face down\n2. Hook ankles under pad\n3. Curl weight up\n4. Squeeze hamstrings' },
  { id: 16, name: 'Shoulder Press', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'Shoulders, Triceps', gif: 'dumbbell-shoulder-press.gif', instructions: '1. Hold dumbbells at shoulders\n2. Press overhead\n3. Lock arms at top\n4. Lower with control' },
  { id: 17, name: 'Lateral Raises', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Side Delts', gif: 'lateral-raises.gif', instructions: '1. Stand with dumbbells\n2. Raise arms to sides\n3. Go to shoulder height\n4. Lower slowly' },
  { id: 18, name: 'Face Pulls', category: 'Shoulders', equipment: 'Cable, Rope', difficulty: 'Beginner', muscles: 'Rear Delts, Traps', gif: 'face-pulls.gif', instructions: '1. Set cable face height\n2. Grip rope overhand\n3. Pull towards face\n4. Rotate hands outward' },
  { id: 19, name: 'Arnold Press', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Intermediate', muscles: 'All Delts', gif: 'arnold-press.gif', instructions: '1. Start palms facing you\n2. Rotate as you press up\n3. End palms forward\n4. Reverse on the way down' },
  { id: 20, name: 'Front Raises', category: 'Shoulders', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Front Delts', gif: 'front-raises.gif', instructions: '1. Hold dumbbells at thighs\n2. Raise arms forward\n3. Go to shoulder height\n4. Lower with control' },
  { id: 21, name: 'Barbell Curls', category: 'Arms', equipment: 'Barbell', difficulty: 'Beginner', muscles: 'Biceps', gif: 'cable-bicep-curl.gif', instructions: '1. Stand with barbell\n2. Curl to shoulders\n3. Squeeze at top\n4. Lower slowly' },
  { id: 22, name: 'Hammer Curls', category: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Biceps, Forearms', gif: 'hammer-curls.gif', instructions: '1. Neutral grip dumbbells\n2. Curl to shoulders\n3. Keep elbows stationary\n4. Lower with control' },
  { id: 23, name: 'Tricep Dips', category: 'Arms', equipment: 'Dip Station', difficulty: 'Intermediate', muscles: 'Triceps, Chest', gif: 'Triceps-Dips.gif', instructions: '1. Grip bars, arms straight\n2. Lower by bending elbows\n3. Go until parallel\n4. Push back up' },
  { id: 24, name: 'Skull Crushers', category: 'Arms', equipment: 'EZ Bar, Bench', difficulty: 'Intermediate', muscles: 'Triceps', gif: 'SKULL_CRUSHERS.gif', instructions: '1. Lie on bench with EZ bar\n2. Lower to forehead\n3. Extend arms up\n4. Keep elbows in' },
  { id: 25, name: 'Tricep Kickbacks', category: 'Arms', equipment: 'Dumbbells', difficulty: 'Beginner', muscles: 'Triceps', gif: 'tricep-kickback.gif', instructions: '1. Hinge forward at hips\n2. Upper arm parallel\n3. Extend forearm back\n4. Squeeze at top' },
  { id: 26, name: 'Bicycle Crunches', category: 'Core', equipment: 'None', difficulty: 'Beginner', muscles: 'Abs, Obliques', gif: 'Bicycle-Crunch.gif', instructions: '1. Lie on back\n2. Hands behind head\n3. Alternate elbow to knee\n4. Keep legs moving' },
  { id: 27, name: 'Russian Twist', category: 'Core', equipment: 'Weight Plate', difficulty: 'Intermediate', muscles: 'Obliques, Abs', gif: 'Russian-Twist.gif', instructions: '1. Sit with knees bent\n2. Lean back slightly\n3. Twist side to side\n4. Touch floor each side' },
  { id: 28, name: 'Cable Crunch', category: 'Core', equipment: 'Cable Machine', difficulty: 'Beginner', muscles: 'Upper Abs', gif: 'Cable-Crunch.gif', instructions: '1. Kneel at cable\n2. Hold rope behind head\n3. Crunch downward\n4. Squeeze abs hard' },
  { id: 29, name: 'Side Plank', category: 'Core', equipment: 'None', difficulty: 'Intermediate', muscles: 'Obliques, Core', gif: 'side-plank.gif', instructions: '1. Lie on side\n2. Prop on forearm\n3. Lift hips up\n4. Hold straight line' },
  { id: 30, name: 'Sit-Ups', category: 'Core', equipment: 'None', difficulty: 'Beginner', muscles: 'Abs, Hip Flexors', gif: 'SIT_UPS.gif', instructions: '1. Lie on back\n2. Knees bent, feet flat\n3. Curl torso up\n4. Lower with control' },
  { id: 31, name: 'Jumping Jacks', category: 'Cardio', equipment: 'None', difficulty: 'Beginner', muscles: 'Full Body', gif: 'jumping-jacks.gif', instructions: '1. Stand with feet together\n2. Jump feet apart, arms up\n3. Jump back together\n4. Repeat quickly' },
  { id: 32, name: 'Walking', category: 'Cardio', equipment: 'Treadmill', difficulty: 'Beginner', muscles: 'Legs, Cardio', gif: 'walking.gif', instructions: '1. Set comfortable pace\n2. Swing arms naturally\n3. Heel to toe stride\n4. Keep posture upright' },
  { id: 33, name: 'Cycling', category: 'Cardio', equipment: 'Bike', difficulty: 'Beginner', muscles: 'Legs, Cardio', gif: 'cycling.gif', instructions: '1. Adjust seat height\n2. Set resistance level\n3. Maintain steady pace\n4. Keep core engaged' },
];

const CATEGORIES = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
const difficultyColors: Record<string, string> = { Beginner: COLORS.success, Intermediate: COLORS.warning, Advanced: COLORS.danger };
const categoryIcons: Record<string, keyof typeof Ionicons.glyphMap> = {
  Chest: 'body-outline', Back: 'arrow-undo-outline', Legs: 'walk-outline',
  Shoulders: 'man-outline', Arms: 'barbell-outline', Core: 'fitness-outline',
  Cardio: 'heart-outline',
};

export default function ExerciseLibrary({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [selectedExercise, setSelectedExercise] = useState<typeof EXERCISES[0] | null>(null);

  const filtered = EXERCISES.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.muscles.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'All' || e.category === category;
    return matchSearch && matchCategory;
  });

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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filtered.map(exercise => (
            <TouchableOpacity key={exercise.id} style={styles.card} activeOpacity={0.8}
              onPress={() => setSelectedExercise(exercise)}>
              <View style={styles.cardImageBox}>
                <Image source={{ uri: `${GIF_BASE}/${exercise.gif}` }}
                  style={styles.cardImage} resizeMode="cover" />
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
          ))}
        </View>
        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No exercises found</Text>
            <Text style={styles.emptySubtitle}>Try a different search or category</Text>
          </View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal visible={!!selectedExercise} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedExercise && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalImageBox}>
                  <Image source={{ uri: `${GIF_BASE}/${selectedExercise.gif}` }}
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
