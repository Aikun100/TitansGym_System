import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Modal, TextInput, Alert, RefreshControl, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import SectionHeader from '../../components/SectionHeader';

const { width } = Dimensions.get('window');

export default function MemberProgress() {
  const { user, progressEntries, addProgressEntry, deleteProgressEntry, refreshProgress } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleAdd = async () => {
    const w = parseFloat(newWeight);
    if (isNaN(w) || w <= 0) { Alert.alert('Error', 'Enter a valid weight'); return; }
    const bf = parseFloat(newBodyFat);
    try {
      await addProgressEntry({
        weight: w,
        body_fat_percentage: isNaN(bf) ? undefined : bf,
        notes: newNotes.trim() || undefined,
      });
      setShowModal(false);
      setNewWeight(''); setNewBodyFat(''); setNewNotes('');
      Alert.alert('Logged! 💪', `Weight: ${w} kg${!isNaN(bf) ? ` | Body Fat: ${bf}%` : ''}`);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to log progress');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Entry', 'Remove this progress entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteProgressEntry(id) },
    ]);
  };

  const sorted = [...progressEntries].sort((a, b) => b.date.localeCompare(a.date));
  const weights = sorted.map(p => p.weight).reverse();
  const maxW = weights.length ? Math.max(...weights) : 80;
  const minW = weights.length ? Math.min(...weights) : 70;
  const rangeW = maxW - minW || 1;

  const latest = sorted[0];
  const prev = sorted[1];
  const weightChange = latest && prev ? (latest.weight - prev.weight).toFixed(1) : '0';
  const bmi = user?.height ? (latest?.weight || 0) / ((user.height / 100) ** 2) : 0;

  const onRefresh = async () => {
    setRefreshing(true);
    try { await refreshProgress(); } catch (e) {}
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Progress</Text>
        <TouchableOpacity style={styles.addButton} activeOpacity={0.7} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>

        {/* Current Stats */}
        <View style={styles.currentStats}>
          <View style={styles.bigStatCard}>
            <View style={[styles.bigStatIcon, { backgroundColor: COLORS.accent + '18' }]}>
              <Ionicons name="scale-outline" size={28} color={COLORS.accent} />
            </View>
            <Text style={styles.bigStatValue}>{latest?.weight || '--'} kg</Text>
            <Text style={styles.bigStatLabel}>Current Weight</Text>
            <View style={[styles.trendBadge, { backgroundColor: parseFloat(weightChange) <= 0 ? COLORS.successBg : COLORS.dangerBg }]}>
              <Ionicons name={parseFloat(weightChange) <= 0 ? 'trending-down' : 'trending-up'} size={14} color={parseFloat(weightChange) <= 0 ? COLORS.success : COLORS.danger} />
              <Text style={[styles.trendText, { color: parseFloat(weightChange) <= 0 ? COLORS.success : COLORS.danger }]}>{weightChange} kg</Text>
            </View>
          </View>
          <View style={styles.bigStatCard}>
            <View style={[styles.bigStatIcon, { backgroundColor: COLORS.primary + '18' }]}>
              <Ionicons name="body-outline" size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.bigStatValue}>{user?.height || '--'} cm</Text>
            <Text style={styles.bigStatLabel}>Height</Text>
            <View style={styles.bmiBadge}>
              <Text style={styles.bmiText}>BMI: {bmi.toFixed(1)}</Text>
            </View>
          </View>
        </View>

        {/* Weight Chart */}
        {weights.length > 1 && (
          <View style={styles.section}>
            <SectionHeader title="Weight Trend" icon="trending-down-outline" />
            <View style={styles.chartCard}>
              <View style={styles.chartContainer}>
                <View style={styles.yAxis}>
                  <Text style={styles.yLabel}>{maxW.toFixed(0)}</Text>
                  <Text style={styles.yLabel}>{((maxW + minW) / 2).toFixed(0)}</Text>
                  <Text style={styles.yLabel}>{minW.toFixed(0)}</Text>
                </View>
                <View style={styles.chartArea}>
                  <View style={[styles.gridLine, { top: 0 }]} />
                  <View style={[styles.gridLine, { top: '50%' }]} />
                  <View style={[styles.gridLine, { bottom: 0 }]} />
                  <View style={styles.barsRow}>
                    {weights.map((w, idx) => {
                      const barH = ((w - minW) / rangeW) * 100;
                      return (
                        <View key={idx} style={styles.barContainer}>
                          <View style={styles.barWrapper}>
                            <View style={[styles.bar, { height: `${Math.max(barH, 8)}%`, backgroundColor: idx === weights.length - 1 ? COLORS.primary : COLORS.primary + '60' }]} />
                          </View>
                          <Text style={styles.xLabel}>{sorted[sorted.length - 1 - idx]?.date.slice(5)}</Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* History */}
        <View style={styles.section}>
          <SectionHeader title="History" icon="time-outline" />
          {sorted.map((item) => (
            <TouchableOpacity key={item.id} style={styles.historyItem} activeOpacity={0.7}
              onLongPress={() => handleDelete(item.id)}>
              <View style={styles.historyDate}>
                <Text style={styles.historyDay}>{new Date(item.date).getDate()}</Text>
                <Text style={styles.historyMonth}>{new Date(item.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
              </View>
              <View style={styles.historyContent}>
                <View style={styles.historyRow}>
                  <Ionicons name="scale-outline" size={16} color={COLORS.accent} />
                  <Text style={styles.historyValue}>{item.weight} kg</Text>
                </View>
                {item.bodyFat !== undefined && (
                  <View style={styles.historyRow}>
                    <Ionicons name="water-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.historyValue}>{item.bodyFat}% BF</Text>
                  </View>
                )}
                {item.notes && <Text style={styles.historyNote}>📝 {item.notes}</Text>}
              </View>
              <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
          {sorted.length === 0 && (
            <View style={styles.emptyCard}>
              <Ionicons name="analytics-outline" size={40} color={COLORS.textTertiary} />
              <Text style={styles.emptyText}>No progress entries yet</Text>
              <Text style={styles.emptySubtext}>Tap + to log your first entry!</Text>
            </View>
          )}
        </View>

        <View style={{ height: SIZES.tabBarHeight + 30 }} />
      </ScrollView>

      {/* Add Progress Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Progress</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Weight (kg) *</Text>
            <TextInput style={styles.modalInput} placeholder="78.5" placeholderTextColor={COLORS.textMuted}
              value={newWeight} onChangeText={setNewWeight} keyboardType="decimal-pad" />

            <Text style={styles.modalLabel}>Body Fat % (optional)</Text>
            <TextInput style={styles.modalInput} placeholder="16.0" placeholderTextColor={COLORS.textMuted}
              value={newBodyFat} onChangeText={setNewBodyFat} keyboardType="decimal-pad" />

            <Text style={styles.modalLabel}>Notes (optional)</Text>
            <TextInput style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]} placeholder="How are you feeling?" placeholderTextColor={COLORS.textMuted}
              value={newNotes} onChangeText={setNewNotes} multiline />

            <TouchableOpacity onPress={handleAdd} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalButton}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.modalButtonText}>Log Progress</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingBase },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  addButton: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingSm },
  currentStats: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingMd },
  bigStatCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, ...SHADOWS.small },
  bigStatIcon: { width: 52, height: 52, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingSm },
  bigStatValue: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  bigStatLabel: { fontSize: SIZES.sm, color: COLORS.textSecondary, marginBottom: SIZES.spacingSm },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  trendText: { fontSize: SIZES.xs, fontWeight: '600' },
  bmiBadge: { backgroundColor: COLORS.primary + '18', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  bmiText: { fontSize: SIZES.xs, fontWeight: '600', color: COLORS.primary },
  section: { marginTop: SIZES.spacingXl },
  chartCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, borderWidth: 1, borderColor: COLORS.cardBorder },
  chartContainer: { flexDirection: 'row', height: 160 },
  yAxis: { width: 36, justifyContent: 'space-between', alignItems: 'flex-end', paddingRight: 8, paddingBottom: 20 },
  yLabel: { fontSize: 10, color: COLORS.textTertiary },
  chartArea: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: COLORS.border },
  barsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: '100%', paddingBottom: 20 },
  barContainer: { alignItems: 'center', flex: 1 },
  barWrapper: { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar: { width: 14, borderRadius: 4, minHeight: 6 },
  xLabel: { fontSize: 8, color: COLORS.textTertiary, marginTop: 4 },
  historyItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, marginBottom: SIZES.spacingSm, borderWidth: 1, borderColor: COLORS.cardBorder },
  historyDate: { width: 44, alignItems: 'center', marginRight: SIZES.spacingMd },
  historyDay: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  historyMonth: { fontSize: SIZES.xs, color: COLORS.textTertiary, textTransform: 'uppercase' },
  historyContent: { flex: 1, gap: 4 },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyValue: { fontSize: SIZES.md, color: COLORS.text, fontWeight: '500' },
  historyNote: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  emptyCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: 40, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  emptyText: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: 8 },
  emptySubtext: { fontSize: SIZES.sm, color: COLORS.textMuted, marginTop: 4 },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.spacingXl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  modalLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 48, fontSize: SIZES.base, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: SIZES.radiusMd, marginTop: 8 },
  modalButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
});
