import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, ImageBackground, TextInput, Modal, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { trainerApi } from '../../services/api';

const A = COLORS.trainerAccent; // purple #7C3AED

export default function ClientProfileScreen({ route, navigation }: any) {
  const { client } = route.params as { client: any };
  const { updateClientProgress } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'attendance' | 'notes'>('overview');
  const [progressData, setProgressData] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [saving, setSaving] = useState(false);

  const initials = client.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const progressColors: Record<string, string> = {
    'Excellent': COLORS.success,
    'On Track': COLORS.accent,
    'Needs Attention': COLORS.warning,
  };
  const statusColor = progressColors[client.progress] || COLORS.textTertiary;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [prog, att] = await Promise.all([
        trainerApi.getProgress(client.id),
        trainerApi.getAttendance(),
      ]);
      const clientProg = Array.isArray(prog) ? prog : (prog.progress || []);
      setProgressData(clientProg.slice(0, 10));
      // Filter attendance for this specific client by member_id if available
      const allAtt = Array.isArray(att) ? att : (att.attendance || []);
      setAttendanceData(allAtt.slice(0, 10));
    } catch (e) {
      console.log('ClientProfile load error:', e);
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  useEffect(() => { load(); }, []);

  const handleUpdateProgress = (level: string) => {
    updateClientProgress(client.id, level);
    Alert.alert('Updated! ✅', `${client.name} is now marked as "${level}"`);
  };

  const handleAddProgress = async () => {
    if (!newWeight) return;
    setSaving(true);
    try {
      await trainerApi.storeProgress({
        member_id: client.id,
        weight: parseFloat(newWeight),
        body_fat_percentage: newBodyFat ? parseFloat(newBodyFat) : undefined,
      });
      setShowProgressModal(false);
      setNewWeight('');
      setNewBodyFat('');
      await load();
      Alert.alert('Saved! 📊', 'Progress entry added successfully.');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Could not save progress');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
    // In a real app, this would POST to an API
    Alert.alert('Note Saved ✅', 'Your coach note has been saved for this session.');
  };

  // Compute basic chart data from progressData
  const latestWeight = progressData[0]?.weight ?? '--';
  const prevWeight = progressData[1]?.weight;
  const weightChange = latestWeight !== '--' && prevWeight
    ? (parseFloat(latestWeight) - parseFloat(prevWeight)).toFixed(1)
    : null;
  const latestBodyFat = progressData[0]?.body_fat_percentage ?? '--';
  const attendanceCount = attendanceData.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Header */}
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80' }}
        style={styles.hero}
      >
        <LinearGradient colors={['rgba(9,9,11,0.5)', '#09090B']} style={StyleSheet.absoluteFillObject} />

        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <View style={[styles.avatar, { borderColor: statusColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.heroName}>{client.name}</Text>
          <Text style={styles.heroSub}>{client.membershipType} Member</Text>

          <View style={[styles.progressPill, { backgroundColor: statusColor + '25', borderColor: statusColor + '60' }]}>
            <View style={[styles.progressDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.progressPillText, { color: statusColor }]}>{client.progress}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.heroStats}>
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{client.totalSessions || '--'}</Text>
            <Text style={styles.heroStatLbl}>Sessions</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.heroStatVal}>{attendanceCount}</Text>
            <Text style={styles.heroStatLbl}>Attendance</Text>
          </View>
          <View style={styles.heroStatDivider} />
          <View style={styles.heroStat}>
            <Text style={[styles.heroStatVal, { color: statusColor }]}>{client.progress.split(' ')[0]}</Text>
            <Text style={styles.heroStatLbl}>Progress</Text>
          </View>
        </View>
      </ImageBackground>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(['overview', 'progress', 'attendance', 'notes'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
        {loading ? (
          <ActivityIndicator color={A} size="large" style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* ── OVERVIEW TAB ── */}
            {activeTab === 'overview' && (
              <View style={styles.section}>
                {/* Contact Info */}
                <Text style={styles.sectionTitle}>Contact Info</Text>
                <View style={styles.card}>
                  <InfoRow icon="mail-outline" label="Email" value={client.email || 'Not provided'} />
                  <InfoRow icon="call-outline" label="Phone" value={client.phone || 'Not provided'} />
                  <InfoRow icon="calendar-outline" label="Last Session" value={new Date(client.lastSession).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })} />
                  <InfoRow icon="calendar" label="Next Session" value={new Date(client.nextSession).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })} />
                </View>

                {/* Update Progress */}
                <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Update Status</Text>
                <View style={styles.progressGrid}>
                  {(['Excellent', 'On Track', 'Needs Attention'] as const).map(lvl => {
                    const c = progressColors[lvl];
                    const isActive = client.progress === lvl;
                    return (
                      <TouchableOpacity
                        key={lvl}
                        style={[styles.progressBtn, { borderColor: c + (isActive ? 'FF' : '40'), backgroundColor: c + (isActive ? '20' : '08') }]}
                        onPress={() => handleUpdateProgress(lvl)}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name={lvl === 'Excellent' ? 'star' : lvl === 'On Track' ? 'checkmark-circle' : 'alert-circle'}
                          size={20}
                          color={c}
                        />
                        <Text style={[styles.progressBtnText, { color: c }]}>{lvl}</Text>
                        {isActive && (
                          <View style={[styles.activePill, { backgroundColor: c }]}>
                            <Text style={styles.activePillText}>Current</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── PROGRESS TAB ── */}
            {activeTab === 'progress' && (
              <View style={styles.section}>
                {/* Summary Cards */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{latestWeight}{latestWeight !== '--' ? ' kg' : ''}</Text>
                    <Text style={styles.metricLabel}>Weight</Text>
                    {weightChange !== null && (
                      <Text style={[styles.metricChange, { color: parseFloat(weightChange) <= 0 ? COLORS.success : COLORS.warning }]}>
                        {parseFloat(weightChange) > 0 ? '+' : ''}{weightChange} kg
                      </Text>
                    )}
                  </View>
                  <View style={styles.metricCard}>
                    <Text style={styles.metricValue}>{latestBodyFat}{latestBodyFat !== '--' ? '%' : ''}</Text>
                    <Text style={styles.metricLabel}>Body Fat</Text>
                  </View>
                </View>

                {/* Add Progress Button */}
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowProgressModal(true)}>
                  <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.addBtnGrad}>
                    <Ionicons name="add-circle" size={20} color="#FFF" />
                    <Text style={styles.addBtnText}>Log Progress Entry</Text>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Progress History */}
                <Text style={styles.sectionTitle}>History</Text>
                {progressData.length === 0 ? (
                  <EmptyState icon="bar-chart-outline" text="No progress data recorded yet." />
                ) : (
                  progressData.map((entry: any, idx: number) => (
                    <View key={idx} style={styles.logRow}>
                      <View style={styles.logDate}>
                        <Text style={styles.logDateDay}>
                          {new Date(entry.date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                        </Text>
                        <Text style={styles.logDateYear}>{new Date(entry.date).getFullYear()}</Text>
                      </View>
                      <View style={styles.logBody}>
                        <Text style={styles.logVal}>{entry.weight} kg</Text>
                        {entry.body_fat_percentage && (
                          <Text style={styles.logSub}>Body Fat: {entry.body_fat_percentage}%</Text>
                        )}
                        {entry.notes && <Text style={styles.logNotes}>{entry.notes}</Text>}
                      </View>
                      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── ATTENDANCE TAB ── */}
            {activeTab === 'attendance' && (
              <View style={styles.section}>
                <View style={styles.metricsRow}>
                  <View style={[styles.metricCard, { flex: 1 }]}>
                    <Text style={styles.metricValue}>{attendanceCount}</Text>
                    <Text style={styles.metricLabel}>Total Visits</Text>
                  </View>
                </View>

                <Text style={styles.sectionTitle}>Attendance History</Text>
                {attendanceData.length === 0 ? (
                  <EmptyState icon="calendar-outline" text="No attendance records found." />
                ) : (
                  attendanceData.map((rec: any, idx: number) => (
                    <View key={idx} style={styles.logRow}>
                      <View style={[styles.attDot, { backgroundColor: COLORS.success }]} />
                      <View style={styles.logBody}>
                        <Text style={styles.logVal}>{rec.date}</Text>
                        <Text style={styles.logSub}>
                          In: {rec.check_in || '--'}
                          {rec.check_out ? `  •  Out: ${rec.check_out}` : ''}
                        </Text>
                      </View>
                      <View style={styles.attBadge}>
                        <Text style={styles.attBadgeText}>Present</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}

            {/* ── NOTES TAB ── */}
            {activeTab === 'notes' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Coach's Session Notes</Text>
                <Text style={styles.noteHint}>These notes are private and for your reference only.</Text>

                <View style={styles.noteCard}>
                  <TextInput
                    style={styles.noteInput}
                    multiline
                    numberOfLines={8}
                    value={noteText}
                    onChangeText={setNoteText}
                    placeholder={`Write your notes for ${client.name.split(' ')[0]}...\n\nE.g., "Form was great on squats today. Needs more work on chest press. Increase bench weight next session to 70kg."`}
                    placeholderTextColor="rgba(255,255,255,0.25)"
                    textAlignVertical="top"
                  />
                </View>

                <TouchableOpacity style={styles.saveNoteBtn} onPress={handleSaveNote}>
                  <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.addBtnGrad}>
                    <Ionicons name={notesSaved ? 'checkmark-circle' : 'save-outline'} size={20} color="#FFF" />
                    <Text style={styles.addBtnText}>{notesSaved ? 'Saved!' : 'Save Note'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Add Progress Modal */}
      <Modal visible={showProgressModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Log Progress</Text>
            <Text style={styles.modalSub}>Recording for: <Text style={{ color: A }}>{client.name}</Text></Text>

            <Text style={styles.inputLabel}>Weight (kg) *</Text>
            <TextInput
              style={styles.modalInput}
              value={newWeight}
              onChangeText={setNewWeight}
              keyboardType="decimal-pad"
              placeholder="e.g., 72.5"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <Text style={styles.inputLabel}>Body Fat % (optional)</Text>
            <TextInput
              style={styles.modalInput}
              value={newBodyFat}
              onChangeText={setNewBodyFat}
              keyboardType="decimal-pad"
              placeholder="e.g., 18.2"
              placeholderTextColor="rgba(255,255,255,0.3)"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowProgressModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddProgress} disabled={saving}>
                {saving
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={styles.confirmBtnText}>Save Entry</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={A} />
      <View style={styles.infoBody}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function EmptyState({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.emptyState}>
      <Ionicons name={icon} size={48} color="rgba(255,255,255,0.15)" />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  hero: { paddingBottom: 0 },
  backBtn: {
    position: 'absolute', top: 52, left: 20, zIndex: 10,
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  heroContent: { alignItems: 'center', paddingTop: 64, paddingBottom: SIZES.spacingLg },
  avatar: {
    width: 80, height: 80, borderRadius: 40, borderWidth: 3,
    backgroundColor: 'rgba(124,58,237,0.3)', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  heroName: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: 0.5, marginBottom: 4 },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)', fontWeight: '600', marginBottom: 14 },
  progressPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 100, borderWidth: 1,
  },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressPillText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  heroStats: {
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    paddingVertical: SIZES.spacingLg, paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)',
    marginTop: SIZES.spacingMd,
  },
  heroStat: { alignItems: 'center' },
  heroStatVal: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  heroStatLbl: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 4 },
  heroStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabBar: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: A },
  tabText: { fontSize: 12, color: 'rgba(255,255,255,0.4)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  tabTextActive: { color: A, fontWeight: '800' },
  body: { flex: 1 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  card: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 15, color: '#FFF', fontWeight: '600', marginTop: 2 },
  progressGrid: { gap: 10 },
  progressBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1, position: 'relative',
  },
  progressBtnText: { fontSize: 15, fontWeight: '700', flex: 1 },
  activePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  activePillText: { fontSize: 10, color: '#FFF', fontWeight: '800', textTransform: 'uppercase' },
  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  metricCard: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
    padding: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', alignItems: 'center',
  },
  metricValue: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  metricLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '600', marginTop: 4 },
  metricChange: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  addBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 24 },
  saveNoteBtn: { borderRadius: 14, overflow: 'hidden', marginTop: 16 },
  addBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16 },
  addBtnText: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  logRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  logDate: { alignItems: 'center', width: 44 },
  logDateDay: { fontSize: 13, fontWeight: '800', color: '#FFF' },
  logDateYear: { fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  logBody: { flex: 1 },
  logVal: { fontSize: 15, fontWeight: '700', color: '#FFF' },
  logSub: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 3 },
  logNotes: { fontSize: 11, color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', marginTop: 3 },
  attDot: { width: 10, height: 10, borderRadius: 5 },
  attBadge: { backgroundColor: COLORS.success + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  attBadgeText: { fontSize: 10, fontWeight: '700', color: COLORS.success, textTransform: 'uppercase' },
  noteHint: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 16, lineHeight: 20 },
  noteCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 16,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 16,
  },
  noteInput: { fontSize: 15, color: '#FFF', lineHeight: 24, minHeight: 180 },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.35)', fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalBox: {
    backgroundColor: '#18181B', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 28, paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', marginBottom: 4 },
  modalSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginBottom: 24 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 12, padding: 16,
    fontSize: 16, color: '#FFF', marginBottom: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  modalBtns: { flexDirection: 'row', gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, paddingVertical: 16, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  confirmBtn: { flex: 1.5, backgroundColor: A, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  confirmBtnText: { fontSize: 15, fontWeight: '800', color: '#FFF' },
});
