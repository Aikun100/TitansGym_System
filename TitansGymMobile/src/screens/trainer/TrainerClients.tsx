import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  TextInput, RefreshControl, ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import SectionHeader from '../../components/SectionHeader';

export default function TrainerClients() {
  const navigation = useNavigation<any>();
  const { clients, updateClientProgress, refreshClients } = useApp();
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const progressColors: Record<string, string> = { 'Excellent': COLORS.success, 'On Track': COLORS.accent, 'Needs Attention': COLORS.warning };

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.membershipType.toLowerCase().includes(search.toLowerCase()));
  const onRefresh = async () => { setRefreshing(true); try { await refreshClients(); } catch(e) {} setRefreshing(false); };

  const handleClientPress = (client: typeof clients[0]) => {
    navigation.navigate('ClientProfile', { client });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80' }} 
        style={styles.heroBackground}
      >
        <LinearGradient colors={['rgba(9,9,11,0.6)', '#09090B']} style={StyleSheet.absoluteFillObject} />
        
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Clients</Text>
          <View style={styles.headerBadge}>
            <Text style={styles.headerCount}>{clients.length} total</Text>
          </View>
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
      </ImageBackground>

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
            <TouchableOpacity key={client.id} style={styles.clientRow} activeOpacity={0.8} onPress={() => handleClientPress(client)}>
              <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} style={styles.clientGradient}>
                <View style={[styles.clientAvatar, { backgroundColor: color + '20' }]}>
                  <Text style={[styles.clientInitials, { color }]}>{initials}</Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <View style={styles.clientMeta}>
                    <Ionicons name="fitness" size={14} color={COLORS.textTertiary} />
                    <Text style={styles.clientMetaText}>{client.membershipType}</Text>
                    <Text style={styles.clientMetaDot}>•</Text>
                    <Ionicons name="calendar-outline" size={14} color={COLORS.textTertiary} />
                    <Text style={styles.clientMetaText}>{new Date(client.nextSession).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
                  </View>
                </View>
                <View style={styles.clientRight}>
                  <View style={[styles.progressBadge, { backgroundColor: color + '15', borderColor: color + '30', borderWidth: 1 }]}>
                    <View style={[styles.progressDot, { backgroundColor: color, shadowColor: color, shadowOpacity: 0.8, shadowRadius: 4 }]} />
                    <Text style={[styles.progressText, { color }]}>{client.progress}</Text>
                  </View>
                </View>
              </LinearGradient>
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
  heroBackground: { paddingTop: 40, paddingBottom: SIZES.spacingLg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 20, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingSm, zIndex: 10 },
  headerTitle: { fontSize: 32, fontWeight: '900', color: '#FFF', letterSpacing: 1 },
  headerBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  headerCount: { fontSize: SIZES.sm, color: '#FFF', fontWeight: '700' },
  searchContainer: { paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd, marginTop: 10, zIndex: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: SIZES.radiusFull, paddingHorizontal: 20, height: 50, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', gap: 10 },
  searchInput: { flex: 1, fontSize: SIZES.md, color: '#FFF' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingXl },
  summaryRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  summaryCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: SIZES.radiusLg, padding: SIZES.spacingMd, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderTopWidth: 4 },
  summaryNumber: { fontSize: 28, fontWeight: '900', color: '#FFF' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },
  clientRow: { borderRadius: SIZES.radiusLg, marginBottom: SIZES.spacingMd, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  clientGradient: { flexDirection: 'row', alignItems: 'center', padding: SIZES.spacingBase },
  clientAvatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  clientInitials: { fontSize: SIZES.lg, fontWeight: '800' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: SIZES.lg, fontWeight: '700', color: '#FFF', marginBottom: 6 },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  clientMetaText: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.6)' },
  clientMetaDot: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.3)' },
  clientRight: { alignItems: 'flex-end', justifyContent: 'center' },
  progressBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: '#FFF', marginTop: SIZES.spacingBase },
  emptySubtitle: { fontSize: SIZES.md, color: 'rgba(255,255,255,0.5)' },
});
