import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

// Track progress for selected clients
export default function TrackProgress({ navigation }: any) {
  const { clients, progressEntries, addProgressEntry } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);
  const [newWeight, setNewWeight] = useState('');
  const [newBodyFat, setNewBodyFat] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleLogProgress = () => {
    const w = parseFloat(newWeight);
    if (!selectedClient) { Alert.alert('Error', 'Select a client first'); return; }
    if (isNaN(w) || w <= 0) { Alert.alert('Error', 'Enter a valid weight'); return; }
    const bf = parseFloat(newBodyFat);
    addProgressEntry({
      date: new Date().toISOString().split('T')[0],
      weight: w,
      bodyFat: isNaN(bf) ? undefined : bf,
      notes: `[${selectedClient.name}] ${newNotes}`.trim(),
    });
    setShowModal(false);
    setNewWeight(''); setNewBodyFat(''); setNewNotes('');
    Alert.alert('Logged! 📊', `Progress recorded for ${selectedClient.name}`);
  };

  // Show progress data grouped by recent dates
  const recentEntries = [...progressEntries].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Track Progress</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Instructions */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={22} color={COLORS.trainerAccent} />
          <Text style={styles.infoText}>Tap the + button to log a client's progress. Select a client, enter their weight and body fat measurements.</Text>
        </View>

        {/* Clients Quick Select */}
        <Text style={styles.sectionTitle}>Select Client</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clientScroll} contentContainerStyle={styles.clientScrollContent}>
          {clients.map(client => {
            const initials = client.name.split(' ').map(n => n[0]).join('');
            const isSelected = selectedClient?.id === client.id;
            return (
              <TouchableOpacity key={client.id} style={[styles.clientChip, isSelected && styles.clientChipActive]}
                onPress={() => { setSelectedClient(client); setShowModal(true); }} activeOpacity={0.7}>
                <View style={[styles.clientAvatar, isSelected && styles.clientAvatarActive]}>
                  <Text style={[styles.clientInitials, isSelected && styles.clientInitialsActive]}>{initials}</Text>
                </View>
                <Text style={[styles.clientChipName, isSelected && styles.clientChipNameActive]} numberOfLines={1}>{client.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Recent Entries */}
        <Text style={styles.sectionTitle}>Recent Progress Entries</Text>
        {recentEntries.slice(0, 10).map(entry => (
          <View key={entry.id} style={styles.entryCard}>
            <View style={styles.entryDate}>
              <Text style={styles.entryDay}>{new Date(entry.date).getDate()}</Text>
              <Text style={styles.entryMonth}>{new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
            </View>
            <View style={styles.entryContent}>
              <View style={styles.entryRow}><Ionicons name="scale-outline" size={14} color={COLORS.accent} /><Text style={styles.entryValue}>{entry.weight} kg</Text></View>
              {entry.bodyFat !== undefined && <View style={styles.entryRow}><Ionicons name="water-outline" size={14} color={COLORS.primary} /><Text style={styles.entryValue}>{entry.bodyFat}% BF</Text></View>}
              {entry.notes && <Text style={styles.entryNotes}>{entry.notes}</Text>}
            </View>
          </View>
        ))}

        {recentEntries.length === 0 && (
          <View style={styles.emptyState}><Ionicons name="analytics-outline" size={48} color={COLORS.textTertiary} /><Text style={styles.emptyText}>No progress entries yet</Text></View>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Log Progress Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log Client Progress</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
            </View>

            {/* Client Selector */}
            <Text style={styles.modalLabel}>Client</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
              {clients.map(c => (
                <TouchableOpacity key={c.id} style={[styles.selChip, selectedClient?.id === c.id && styles.selChipActive]}
                  onPress={() => setSelectedClient(c)}>
                  <Text style={[styles.selChipText, selectedClient?.id === c.id && styles.selChipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.modalLabel}>Weight (kg) *</Text>
            <TextInput style={styles.modalInput} placeholder="78.5" placeholderTextColor={COLORS.textMuted}
              value={newWeight} onChangeText={setNewWeight} keyboardType="decimal-pad" />

            <Text style={styles.modalLabel}>Body Fat % (optional)</Text>
            <TextInput style={styles.modalInput} placeholder="16.0" placeholderTextColor={COLORS.textMuted}
              value={newBodyFat} onChangeText={setNewBodyFat} keyboardType="decimal-pad" />

            <Text style={styles.modalLabel}>Notes</Text>
            <TextInput style={[styles.modalInput, { height: 70, textAlignVertical: 'top' }]} placeholder="Progress notes..." placeholderTextColor={COLORS.textMuted}
              value={newNotes} onChangeText={setNewNotes} multiline />

            <TouchableOpacity onPress={handleLogProgress} activeOpacity={0.8}>
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.modalButton}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  backBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  addBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.trainerAccent, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingMd },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: COLORS.trainerAccent + '10', borderRadius: SIZES.radiusMd, padding: SIZES.spacingBase, marginBottom: SIZES.spacingXl, borderWidth: 1, borderColor: COLORS.trainerAccent + '20' },
  infoText: { flex: 1, fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18 },
  sectionTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.spacingMd },
  clientScroll: { marginBottom: SIZES.spacingXl },
  clientScrollContent: { gap: SIZES.spacingMd },
  clientChip: { alignItems: 'center', padding: SIZES.spacingSm },
  clientChipActive: {},
  clientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: 6, borderWidth: 2, borderColor: COLORS.border },
  clientAvatarActive: { borderColor: COLORS.trainerAccent, backgroundColor: COLORS.trainerAccent + '20' },
  clientInitials: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.textTertiary },
  clientInitialsActive: { color: COLORS.trainerAccent },
  clientChipName: { fontSize: SIZES.xs, color: COLORS.textTertiary, fontWeight: '500' },
  clientChipNameActive: { color: COLORS.trainerAccent },
  entryCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, marginBottom: SIZES.spacingSm, borderWidth: 1, borderColor: COLORS.cardBorder },
  entryDate: { width: 40, alignItems: 'center', marginRight: SIZES.spacingMd },
  entryDay: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  entryMonth: { fontSize: SIZES.xs, color: COLORS.textTertiary, textTransform: 'uppercase' },
  entryContent: { flex: 1, gap: 4 },
  entryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  entryValue: { fontSize: SIZES.md, color: COLORS.text, fontWeight: '500' },
  entryNotes: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: SIZES.spacingMd },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.spacingXl, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  modalLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 44, fontSize: SIZES.md, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 },
  selChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, marginRight: 8 },
  selChipActive: { backgroundColor: COLORS.trainerAccent + '25', borderColor: COLORS.trainerAccent },
  selChipText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  selChipTextActive: { color: COLORS.trainerAccent, fontWeight: '600' },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: SIZES.radiusMd, marginTop: 8 },
  modalButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
});
