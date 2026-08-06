import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput, FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

// ── Embedded exercise list (subset from ExerciseLibrary) ──
const ALL_EXERCISES = [
  { id: 1,  name: 'Bench Press',           category: 'Chest',     muscles: 'Chest, Triceps' },
  { id: 2,  name: 'Incline Dumbbell Press', category: 'Chest',     muscles: 'Upper Chest' },
  { id: 3,  name: 'Cable Crossover',        category: 'Chest',     muscles: 'Chest, Front Delts' },
  { id: 4,  name: 'Dumbbell Flyes',         category: 'Chest',     muscles: 'Chest' },
  { id: 5,  name: 'Lat Pulldown',           category: 'Back',      muscles: 'Lats, Biceps' },
  { id: 6,  name: 'Barbell Rows',           category: 'Back',      muscles: 'Back, Biceps' },
  { id: 7,  name: 'Pull-Ups',              category: 'Back',      muscles: 'Lats, Biceps, Core' },
  { id: 8,  name: 'Deadlifts',             category: 'Back',      muscles: 'Back, Glutes, Hamstrings' },
  { id: 9,  name: 'Barbell Squats',         category: 'Legs',      muscles: 'Quads, Glutes' },
  { id: 10, name: 'Leg Press',             category: 'Legs',      muscles: 'Quads, Glutes' },
  { id: 11, name: 'Romanian Deadlift',      category: 'Legs',      muscles: 'Hamstrings' },
  { id: 12, name: 'Bulgarian Split Squat',  category: 'Legs',      muscles: 'Quads, Glutes' },
  { id: 13, name: 'Shoulder Press',         category: 'Shoulders', muscles: 'Shoulders, Triceps' },
  { id: 14, name: 'Lateral Raises',         category: 'Shoulders', muscles: 'Side Delts' },
  { id: 15, name: 'Face Pulls',            category: 'Shoulders', muscles: 'Rear Delts' },
  { id: 16, name: 'Barbell Curls',          category: 'Arms',      muscles: 'Biceps' },
  { id: 17, name: 'Hammer Curls',          category: 'Arms',      muscles: 'Biceps, Forearms' },
  { id: 18, name: 'Tricep Dips',           category: 'Arms',      muscles: 'Triceps' },
  { id: 19, name: 'Skull Crushers',         category: 'Arms',      muscles: 'Triceps' },
  { id: 20, name: 'Bicycle Crunches',       category: 'Core',      muscles: 'Abs, Obliques' },
  { id: 21, name: 'Plank',                 category: 'Core',      muscles: 'Core' },
  { id: 22, name: 'Cable Crunch',           category: 'Core',      muscles: 'Abs' },
  { id: 23, name: 'Jumping Jacks',          category: 'Cardio',    muscles: 'Full Body' },
  { id: 24, name: 'Walking',               category: 'Cardio',    muscles: 'Legs, Cardio' },
  { id: 25, name: 'Cycling',              category: 'Cardio',    muscles: 'Legs, Cardio' },
];
const CATS = ['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Cardio'];
const catColor: Record<string, string> = {
  Chest: '#EF4444', Back: '#8B5CF6', Legs: '#F59E0B',
  Shoulders: '#3B82F6', Arms: '#10B981', Core: '#EC4899', Cardio: '#F97316',
};

type ExEntry = { name: string; sets: string; reps: string; rest: string };

export default function WorkoutPlans({ navigation }: any) {
  const { clients, workoutPlans, addWorkoutPlan, toggleWorkoutExecuted, deleteWorkoutPlan } = useApp();

  // Create plan state
  const [showModal, setShowModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [exercises, setExercises] = useState<ExEntry[]>([]);

  // Exercise picker state
  const [showPicker, setShowPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCat, setPickerCat] = useState('All');

  const filtered = useMemo(() =>
    ALL_EXERCISES.filter(e => {
      const q = pickerSearch.toLowerCase();
      return (pickerCat === 'All' || e.category === pickerCat) &&
        (e.name.toLowerCase().includes(q) || e.muscles.toLowerCase().includes(q));
    }), [pickerSearch, pickerCat]);

  const addFromLibrary = (ex: typeof ALL_EXERCISES[0]) => {
    setExercises(prev => [...prev, { name: ex.name, sets: '3', reps: '10', rest: '60s' }]);
    setShowPicker(false);
    setPickerSearch('');
  };

  const updateExercise = (idx: number, field: string, value: string) =>
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  const removeExercise = (idx: number) =>
    setExercises(prev => prev.filter((_, i) => i !== idx));

  const resetModal = () => {
    setShowModal(false); setPlanName(''); setSelectedMemberId(null); setExercises([]);
  };

  const handleCreate = async () => {
    if (!planName.trim()) { Alert.alert('Error', 'Plan name is required'); return; }
    if (exercises.length === 0) { Alert.alert('Error', 'Add at least one exercise from the library'); return; }
    try {
      await addWorkoutPlan({
        title: planName.trim(),
        member_id: selectedMemberId || (clients[0]?.id),
        exercises: JSON.stringify(exercises.map(e => ({
          name: e.name, sets: parseInt(e.sets) || 3, reps: e.reps || '10', rest: e.rest || '60s',
        }))),
        start_date: new Date().toISOString().split('T')[0],
      });
      resetModal();
      Alert.alert('Created! 💪', 'Workout plan has been created.');
    } catch (e: any) { Alert.alert('Error', e.message || 'Failed to create plan'); }
  };

  const handlePlanPress = (plan: typeof workoutPlans[0]) => {
    Alert.alert(plan.name,
      `📅 ${plan.date}\n${plan.isExecuted ? '✅ Completed' : '⏳ Pending'}\n\n🏋️ Exercises:\n${plan.exercises.map((e, i) => `${i + 1}. ${e.name} — ${e.sets}×${e.reps}`).join('\n')}`,
      [
        { text: plan.isExecuted ? 'Mark Incomplete' : 'Mark Complete', onPress: () => toggleWorkoutExecuted(plan.id) },
        { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Delete?', `Remove "${plan.name}"?`, [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteWorkoutPlan(plan.id) },
        ]) },
        { text: 'Close' },
      ]
    );
  };

  const statusColors: Record<string, string> = { active: COLORS.success, upcoming: COLORS.accent, completed: COLORS.textTertiary };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#1A0533', COLORS.background]} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Workout Plans</Text>
          <Text style={styles.headerSub}>{workoutPlans.length} plans created</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Total', val: workoutPlans.length, color: '#8B5CF6' },
            { label: 'Done', val: workoutPlans.filter(w => w.isExecuted).length, color: COLORS.success },
            { label: 'Pending', val: workoutPlans.filter(w => !w.isExecuted).length, color: COLORS.warning },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={[styles.statNum, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {workoutPlans.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={52} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No plans yet</Text>
            <Text style={styles.emptySub}>Tap + to create your first workout plan</Text>
          </View>
        )}

        {workoutPlans.map(plan => (
          <TouchableOpacity key={plan.id} style={styles.planCard} activeOpacity={0.8} onPress={() => handlePlanPress(plan)}>
            <View style={styles.planHeader}>
              <View style={[styles.statusDot, { backgroundColor: statusColors[plan.status] || COLORS.accent }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.planName}>{plan.name}</Text>
                <Text style={styles.planMeta}>{plan.date} · {plan.exercises.length} exercises</Text>
              </View>
              {plan.isExecuted && <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />}
            </View>
            <View style={styles.exList}>
              {plan.exercises.slice(0, 3).map((ex, i) => (
                <View key={i} style={styles.exRow}>
                  <Text style={styles.exNum}>{i + 1}</Text>
                  <Text style={styles.exName} numberOfLines={1}>{ex.name}</Text>
                  <Text style={styles.exSets}>{ex.sets}×{ex.reps}</Text>
                </View>
              ))}
              {plan.exercises.length > 3 && <Text style={styles.moreText}>+{plan.exercises.length - 3} more</Text>}
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Create Plan Modal ── */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Workout Plan</Text>
                <TouchableOpacity onPress={resetModal}>
                  <Ionicons name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <Text style={styles.lbl}>Plan Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Upper Body Power"
                placeholderTextColor={COLORS.textMuted} value={planName} onChangeText={setPlanName} />

              {clients.length > 0 && (
                <>
                  <Text style={styles.lbl}>Assign to Client</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                    {clients.map(c => (
                      <TouchableOpacity key={c.id}
                        style={[styles.chip, selectedMemberId === c.id && styles.chipActive]}
                        onPress={() => setSelectedMemberId(c.id)}>
                        <Text style={[styles.chipText, selectedMemberId === c.id && styles.chipTextActive]}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </>
              )}

              {/* Exercise list */}
              <View style={styles.exSection}>
                <Text style={styles.lbl}>Exercises ({exercises.length})</Text>
                <TouchableOpacity style={styles.pickBtn} onPress={() => setShowPicker(true)}>
                  <Ionicons name="library-outline" size={16} color="#8B5CF6" />
                  <Text style={styles.pickBtnText}>Browse Library</Text>
                </TouchableOpacity>
              </View>

              {exercises.length === 0 && (
                <TouchableOpacity style={styles.emptyPickerHint} onPress={() => setShowPicker(true)}>
                  <Ionicons name="add-circle-outline" size={32} color="rgba(139,92,246,0.5)" />
                  <Text style={styles.emptyPickerText}>Tap to pick exercises from the library</Text>
                </TouchableOpacity>
              )}

              {exercises.map((ex, idx) => (
                <View key={idx} style={styles.exForm}>
                  <View style={styles.exFormTop}>
                    <View style={styles.exNumBadge}><Text style={styles.exNumText}>{idx + 1}</Text></View>
                    <Text style={styles.exFormName} numberOfLines={1}>{ex.name}</Text>
                    <TouchableOpacity onPress={() => removeExercise(idx)}>
                      <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.exFormRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.miniLbl}>Sets</Text>
                      <TextInput style={styles.miniInput} value={ex.sets}
                        onChangeText={v => updateExercise(idx, 'sets', v)} keyboardType="numeric" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.miniLbl}>Reps</Text>
                      <TextInput style={styles.miniInput} value={ex.reps}
                        onChangeText={v => updateExercise(idx, 'reps', v)} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.miniLbl}>Rest</Text>
                      <TextInput style={styles.miniInput} value={ex.rest}
                        onChangeText={v => updateExercise(idx, 'rest', v)} />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={handleCreate} activeOpacity={0.85} style={{ marginTop: 20 }}>
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.createBtn}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                  <Text style={styles.createBtnText}>Create Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Exercise Library Picker Modal ── */}
      <Modal visible={showPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { maxHeight: '88%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exercise Library</Text>
              <TouchableOpacity onPress={() => { setShowPicker(false); setPickerSearch(''); }}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={styles.searchBox}>
              <Ionicons name="search-outline" size={18} color={COLORS.textTertiary} />
              <TextInput style={styles.searchInput} placeholder="Search exercises..."
                placeholderTextColor={COLORS.textMuted} value={pickerSearch} onChangeText={setPickerSearch} />
              {pickerSearch.length > 0 && (
                <TouchableOpacity onPress={() => setPickerSearch('')}>
                  <Ionicons name="close-circle" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Category pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              style={{ maxHeight: 46 }} contentContainerStyle={styles.catRow}>
              {CATS.map(c => (
                <TouchableOpacity key={c}
                  style={[styles.catChip, pickerCat === c && { backgroundColor: catColor[c] || '#8B5CF6', borderColor: catColor[c] || '#8B5CF6' }]}
                  onPress={() => setPickerCat(c)}>
                  <Text style={[styles.catChipText, pickerCat === c && { color: '#FFF', fontWeight: '700' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.resultCount}>{filtered.length} exercises</Text>

            <FlatList
              data={filtered}
              keyExtractor={i => i.id.toString()}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const already = exercises.some(e => e.name === item.name);
                return (
                  <TouchableOpacity
                    style={[styles.libRow, already && styles.libRowAdded]}
                    onPress={() => { if (!already) addFromLibrary(item); }}
                    activeOpacity={already ? 1 : 0.7}
                  >
                    <View style={[styles.libIcon, { backgroundColor: (catColor[item.category] || '#8B5CF6') + '20' }]}>
                      <Ionicons name="barbell-outline" size={18} color={catColor[item.category] || '#8B5CF6'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.libName}>{item.name}</Text>
                      <Text style={styles.libMuscles}>{item.muscles} · {item.category}</Text>
                    </View>
                    {already
                      ? <View style={styles.addedBadge}><Text style={styles.addedText}>Added ✓</Text></View>
                      : <Ionicons name="add-circle-outline" size={22} color="#8B5CF6" />
                    }
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={{ alignItems: 'center', padding: 32 }}>
                  <Ionicons name="search-outline" size={40} color={COLORS.textTertiary} />
                  <Text style={{ color: COLORS.textTertiary, marginTop: 8 }}>No exercises found</Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 20 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text },
  headerSub: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  addBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#7C3AED', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  statNum: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4, fontWeight: '600' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textSecondary },
  emptySub: { fontSize: 13, color: COLORS.textTertiary },
  planCard: { backgroundColor: COLORS.cardBg, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  planHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  planName: { fontSize: 15, fontWeight: '700', color: COLORS.text },
  planMeta: { fontSize: 12, color: COLORS.textTertiary, marginTop: 2 },
  exList: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 12 },
  exRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  exNum: { width: 18, fontSize: 11, color: COLORS.textTertiary, fontWeight: '700' },
  exName: { flex: 1, fontSize: 13, color: COLORS.textSecondary },
  exSets: { fontSize: 13, color: '#8B5CF6', fontWeight: '700' },
  moreText: { fontSize: 11, color: COLORS.textTertiary, marginTop: 4 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'flex-end' },
  modalBox: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  lbl: { fontSize: 12, fontWeight: '700', color: COLORS.textTertiary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 14, height: 44, fontSize: 15, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  chipActive: { backgroundColor: '#7C3AED20', borderColor: '#7C3AED' },
  chipText: { fontSize: 13, color: COLORS.textTertiary, fontWeight: '500' },
  chipTextActive: { color: '#A78BFA', fontWeight: '700' },
  exSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  pickBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#7C3AED20', borderWidth: 1, borderColor: '#7C3AED40' },
  pickBtnText: { fontSize: 13, fontWeight: '700', color: '#8B5CF6' },
  emptyPickerHint: { alignItems: 'center', padding: 32, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(139,92,246,0.3)', borderRadius: 16, marginBottom: 16, gap: 8 },
  emptyPickerText: { fontSize: 13, color: COLORS.textTertiary, textAlign: 'center' },
  exForm: { backgroundColor: COLORS.surface, borderRadius: 12, padding: 14, marginBottom: 10 },
  exFormTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  exNumBadge: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#7C3AED20', justifyContent: 'center', alignItems: 'center' },
  exNumText: { fontSize: 11, fontWeight: '800', color: '#8B5CF6' },
  exFormName: { flex: 1, fontSize: 14, fontWeight: '600', color: COLORS.text },
  exFormRow: { flexDirection: 'row', gap: 8 },
  miniLbl: { fontSize: 10, color: COLORS.textTertiary, marginBottom: 4, fontWeight: '600' },
  miniInput: { backgroundColor: COLORS.backgroundSecondary, borderRadius: 8, paddingHorizontal: 10, height: 36, fontSize: 14, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, textAlign: 'center' },
  createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: 14 },
  createBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  // Picker
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: 12, paddingHorizontal: 12, height: 44, borderWidth: 1, borderColor: COLORS.border, gap: 8, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  catRow: { paddingBottom: 10, gap: 8, alignItems: 'center' },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  catChipText: { fontSize: 12, color: COLORS.textTertiary, fontWeight: '600' },
  resultCount: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '600', marginVertical: 8 },
  libRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: 12, backgroundColor: COLORS.surface, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border },
  libRowAdded: { opacity: 0.55 },
  libIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center' },
  libName: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  libMuscles: { fontSize: 11, color: COLORS.textTertiary, fontWeight: '500' },
  addedBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: COLORS.success + '20' },
  addedText: { fontSize: 11, color: COLORS.success, fontWeight: '700' },
});
