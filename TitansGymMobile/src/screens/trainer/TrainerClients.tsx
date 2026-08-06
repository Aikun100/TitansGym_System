import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, TextInput, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import SectionHeader from '../../components/SectionHeader';

export default function TrainerClients() {
  const { clients, updateClientProgress } = useApp();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const progressColors: Record<string, string> = { 'Excellent': COLORS.success, 'On Track': COLORS.accent, 'Needs Attention': COLORS.warning };
  const progressOptions = ['Excellent', 'On Track', 'Needs Attention'];

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.membershipType.toLowerCase().includes(search.toLowerCase()));
  const onRefresh = () => { setRefreshing(true); setTimeout(() => setRefreshing(false), 800); };

  const handleClientPress = (client: typeof clients[0]) => {
    Alert.alert(
      client.name,
      `📧 ${client.email || '--'}\n📱 ${client.phone || '--'}\n🏋️ ${client.membershipType} Member\n📊 Progress: ${client.progress}\n📅 Last: ${client.lastSession}\n📅 Next: ${client.nextSession}`,
      [
        { text: 'Update Progress', onPress: () => {
          Alert.alert('Update Progress', `Set progress for ${client.name}:`, 
            progressOptions.map(p => ({ text: p, onPress: () => {
              updateClientProgress(client.id, p);
              Alert.alert('Updated!', `${client.name} marked as "${p}"`);
            }})).concat([{ text: 'Cancel', style: 'cancel' as const, onPress: undefined }])
          );
        }},
        { text: 'Close' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Clients</Text>
        <Text style={styles.headerCount}>{clients.length} total</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color={COLORS.textTertiary} />
          <TextInput style={styles.searchInput} placeholder="Search clients..." placeholderTextColor={COLORS.textMuted}
            value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}><Ionicons name="close-circle" size={18} color={COLORS.textTertiary} /></TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.trainerAccent} colors={[COLORS.trainerAccent]} />}>

        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.trainerAccent }]}>
            <Text style={styles.summaryNumber}>{clients.length}</Text><Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.success }]}>
            <Text style={[styles.summaryNumber, { color: COLORS.success }]}>{clients.filter(c => c.progress === 'Excellent').length}</Text><Text style={styles.summaryLabel}>Excellent</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: COLORS.warning }]}>
            <Text style={[styles.summaryNumber, { color: COLORS.warning }]}>{clients.filter(c => c.progress === 'Needs Attention').length}</Text><Text style={styles.summaryLabel}>Attention</Text>
          </View>
        </View>

        <SectionHeader title={`${filtered.length} Client${filtered.length !== 1 ? 's' : ''}`} icon="people" />

        {filtered.map((client) => {
          const initials = client.name.split(' ').map(n => n[0]).join('');
          const color = progressColors[client.progress] || COLORS.textTertiary;
          return (
            <TouchableOpacity key={client.id} style={styles.clientRow} activeOpacity={0.7} onPress={() => handleClientPress(client)}>
              <View style={[styles.clientAvatar, { backgroundColor: COLORS.trainerAccent + '20' }]}>
                <Text style={styles.clientInitials}>{initials}</Text>
              </View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <View style={styles.clientMeta}>
                  <Text style={styles.clientMetaText}>{client.membershipType}</Text>
                  <Text style={styles.clientMetaDot}>•</Text>
                  <Text style={styles.clientMetaText}>Next: {new Date(client.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                </View>
              </View>
              <View style={styles.clientRight}>
                <View style={[styles.progressBadge, { backgroundColor: color + '18' }]}>
                  <View style={[styles.progressDot, { backgroundColor: color }]} />
                  <Text style={[styles.progressText, { color }]}>{client.progress}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={48} color={COLORS.textTertiary} />
            <Text style={styles.emptyTitle}>No clients found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        )}

        <View style={{ height: SIZES.tabBarHeight + 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingSm },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  headerCount: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '600' },
  searchContainer: { paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 44, borderWidth: 1, borderColor: COLORS.border, gap: 8 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: COLORS.text },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingSm },
  summaryRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  summaryCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, borderLeftWidth: 3 },
  summaryNumber: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.trainerAccent },
  summaryLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  clientRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  clientAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd },
  clientInitials: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.trainerAccent },
  clientInfo: { flex: 1 },
  clientName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientMetaText: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  clientMetaDot: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  clientRight: { alignItems: 'flex-end', gap: 8 },
  progressBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: SIZES.radiusFull },
  progressDot: { width: 6, height: 6, borderRadius: 3 },
  progressText: { fontSize: 10, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginTop: SIZES.spacingBase },
  emptySubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary },
});
