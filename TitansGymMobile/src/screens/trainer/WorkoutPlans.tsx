import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function WorkoutPlans({ navigation }: any) {
  const { workoutPlans, addWorkoutPlan, toggleWorkoutExecuted, deleteWorkoutPlan } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [planName, setPlanName] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: '3', reps: '10', rest: '60s' }]);

  const handleAddExercise = () => {
    setExercises(prev => [...prev, { name: '', sets: '3', reps: '10', rest: '60s' }]);
  };

  const updateExercise = (idx: number, field: string, value: string) => {
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
  };

  const removeExercise = (idx: number) => {
    if (exercises.length <= 1) return;
    setExercises(prev => prev.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    if (!planName.trim()) { Alert.alert('Error', 'Plan name is required'); return; }
    const validExercises = exercises.filter(e => e.name.trim());
    if (validExercises.length === 0) { Alert.alert('Error', 'Add at least one exercise'); return; }

    addWorkoutPlan({
      name: planName.trim(),
      trainer: 'Coach Miguel',
      exercises: validExercises.map(e => ({
        name: e.name, sets: parseInt(e.sets) || 3, reps: e.reps || '10', rest: e.rest || '60s',
      })),
      status: 'active',
      isExecuted: false,
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(false);
    setPlanName('');
    setExercises([{ name: '', sets: '3', reps: '10', rest: '60s' }]);
    Alert.alert('Created! 💪', 'New workout plan has been created.');
  };

  const handlePlanPress = (plan: typeof workoutPlans[0]) => {
    Alert.alert(
      plan.name,
      `📅 ${plan.date}\n📊 Status: ${plan.status}\n${plan.isExecuted ? '✅ Completed' : '⏳ Not completed'}\n\n🏋️ Exercises:\n${plan.exercises.map((e, i) => `${i + 1}. ${e.name} — ${e.sets}×${e.reps} (${e.rest})`).join('\n')}`,
      [
        { text: plan.isExecuted ? 'Mark Incomplete' : 'Mark Complete', onPress: () => toggleWorkoutExecuted(plan.id) },
        { text: 'Delete', style: 'destructive', onPress: () => {
          Alert.alert('Delete Plan', `Remove "${plan.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteWorkoutPlan(plan.id) },
          ]);
        }},
        { text: 'Close' },
      ]
    );
  };

  const statusColors: Record<string, string> = { active: COLORS.success, upcoming: COLORS.accent, completed: COLORS.textTertiary };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Workout Plans</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: COLORS.trainerAccent }]}>{workoutPlans.length}</Text><Text style={styles.summaryLabel}>Total Plans</Text></View>
          <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: COLORS.success }]}>{workoutPlans.filter(w => w.isExecuted).length}</Text><Text style={styles.summaryLabel}>Completed</Text></View>
          <View style={styles.summaryCard}><Text style={[styles.summaryNum, { color: COLORS.warning }]}>{workoutPlans.filter(w => !w.isExecuted).length}</Text><Text style={styles.summaryLabel}>Pending</Text></View>
        </View>

        {workoutPlans.map(plan => {
          const color = statusColors[plan.status] || COLORS.accent;
          return (
            <TouchableOpacity key={plan.id} style={styles.planCard} activeOpacity={0.7} onPress={() => handlePlanPress(plan)}>
              <View style={styles.planHeader}>
                <View style={styles.planLeft}>
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDate}>{plan.date} • {plan.exercises.length} exercises</Text>
                  </View>
                </View>
                {plan.isExecuted && <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />}
              </View>
              <View style={styles.exerciseList}>
                {plan.exercises.slice(0, 3).map((ex, idx) => (
                  <View key={idx} style={styles.exerciseRow}>
                    <Text style={styles.exerciseNum}>{idx + 1}</Text>
                    <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
                    <Text style={styles.exerciseSets}>{ex.sets}×{ex.reps}</Text>
                  </View>
                ))}
                {plan.exercises.length > 3 && <Text style={styles.moreText}>+{plan.exercises.length - 3} more exercises</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Create Plan Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Workout Plan</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
              </View>

              <Text style={styles.modalLabel}>Plan Name</Text>
              <TextInput style={styles.modalInput} placeholder="e.g. Upper Body Power" placeholderTextColor={COLORS.textMuted}
                value={planName} onChangeText={setPlanName} />

              <Text style={styles.modalLabel}>Exercises</Text>
              {exercises.map((ex, idx) => (
                <View key={idx} style={styles.exerciseForm}>
                  <View style={styles.exerciseFormHeader}>
                    <Text style={styles.exerciseFormNum}>Exercise {idx + 1}</Text>
                    {exercises.length > 1 && (
                      <TouchableOpacity onPress={() => removeExercise(idx)}><Ionicons name="trash-outline" size={16} color={COLORS.danger} /></TouchableOpacity>
                    )}
                  </View>
                  <TextInput style={styles.modalInput} placeholder="Exercise name" placeholderTextColor={COLORS.textMuted}
                    value={ex.name} onChangeText={v => updateExercise(idx, 'name', v)} />
                  <View style={styles.exerciseFormRow}>
                    <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Sets</Text><TextInput style={styles.miniInput} value={ex.sets} onChangeText={v => updateExercise(idx, 'sets', v)} keyboardType="numeric" /></View>
                    <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Reps</Text><TextInput style={styles.miniInput} value={ex.reps} onChangeText={v => updateExercise(idx, 'reps', v)} /></View>
                    <View style={{ flex: 1 }}><Text style={styles.miniLabel}>Rest</Text><TextInput style={styles.miniInput} value={ex.rest} onChangeText={v => updateExercise(idx, 'rest', v)} /></View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addExerciseBtn} onPress={handleAddExercise}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.trainerAccent} />
                <Text style={styles.addExerciseText}>Add Exercise</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleCreate} activeOpacity={0.8} style={{ marginTop: SIZES.spacingLg }}>
                <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.modalButton}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                  <Text style={styles.modalButtonText}>Create Plan</Text>
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  backBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  addBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.trainerAccent, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingMd },
  summaryRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  summaryCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  summaryNum: { fontSize: SIZES.xxl, fontWeight: '800' },
  summaryLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  planCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.spacingMd },
  planLeft: { flexDirection: 'row', alignItems: 'flex-start', flex: 1, gap: 10 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  planName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  planDate: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  exerciseList: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusSm, padding: SIZES.spacingMd },
  exerciseRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  exerciseNum: { width: 20, fontSize: SIZES.xs, color: COLORS.textTertiary, fontWeight: '600' },
  exerciseName: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary },
  exerciseSets: { fontSize: SIZES.sm, color: COLORS.trainerAccent, fontWeight: '600' },
  moreText: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.spacingXl, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  modalLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 44, fontSize: SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  exerciseForm: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, marginBottom: SIZES.spacingMd },
  exerciseFormHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  exerciseFormNum: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.trainerAccent },
  exerciseFormRow: { flexDirection: 'row', gap: 8 },
  miniLabel: { fontSize: 10, color: COLORS.textTertiary, marginBottom: 4 },
  miniInput: { backgroundColor: COLORS.backgroundSecondary, borderRadius: SIZES.radiusSm, paddingHorizontal: 10, height: 36, fontSize: SIZES.sm, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border },
  addExerciseBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SIZES.spacingMd, borderRadius: SIZES.radiusMd, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.trainerAccent + '40' },
  addExerciseText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.trainerAccent },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: SIZES.radiusMd },
  modalButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
});
