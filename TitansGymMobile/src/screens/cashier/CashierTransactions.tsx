import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
  ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { cashierApi } from '../../services/api';

const GREEN = '#10B981';
const GLASS = 'rgba(255,255,255,0.05)';
const GLASS_BORDER = 'rgba(255,255,255,0.1)';

function methodColor(method: string) {
  if (method === 'cash') return GREEN;
  if (method === 'online') return COLORS.accent;
  if (method === 'free') return '#8B5CF6';
  return '#F59E0B';
}

function methodIcon(method: string): any {
  if (method === 'cash') return 'cash-outline';
  if (method === 'online') return 'phone-portrait-outline';
  if (method === 'free') return 'gift-outline';
  return 'bag-outline';
}

function methodLabel(method: string, type: string) {
  if (type === 'shop') return 'SHOP';
  if (method === 'cash') return 'CASH';
  if (method === 'online') return 'ONLINE';
  if (method === 'free') return 'FREE';
  return method.toUpperCase();
}

function timeAgo(isoString: string) {
  const date = new Date(isoString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default function CashierTransactions() {
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<'all' | 'cash' | 'online' | 'shop'>('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = useCallback(async () => {
    try {
      const res = await cashierApi.getTransactions();
      setTransactions(res.transactions || []);
    } catch (e) {
      console.log('Transactions error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadTransactions(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
  }, [loadTransactions]);

  const filtered = transactions.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'cash') return t.method === 'cash' && t.type === 'pos';
    if (filter === 'online') return t.method === 'online';
    if (filter === 'shop') return t.type === 'shop';
    return true;
  });

  const todayTotal = filtered.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const todayCount = filtered.filter(t => t.status === 'paid').length;
  const pendingCount = filtered.filter(t => t.status === 'pending').length;

  return (
    <View style={[s.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />

      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <Text style={s.headerTitle}>Transactions</Text>
        <Text style={s.headerSub}>Payment History</Text>
      </View>

      {/* Summary Row */}
      <View style={s.summaryRow}>
        <View style={s.summaryCard}>
          <View style={[s.summaryIcon, { backgroundColor: GREEN + '18' }]}>
            <Ionicons name="wallet-outline" size={18} color={GREEN} />
          </View>
          <Text style={s.summaryValue}>
            {loading ? '--' : `₱${Math.round(todayTotal).toLocaleString()}`}
          </Text>
          <Text style={s.summaryLabel}>Revenue</Text>
        </View>
        <View style={s.summaryCard}>
          <View style={[s.summaryIcon, { backgroundColor: COLORS.accent + '18' }]}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.accent} />
          </View>
          <Text style={s.summaryValue}>{loading ? '--' : todayCount}</Text>
          <Text style={s.summaryLabel}>Completed</Text>
        </View>
        <View style={s.summaryCard}>
          <View style={[s.summaryIcon, { backgroundColor: '#F59E0B18' }]}>
            <Ionicons name="time-outline" size={18} color="#F59E0B" />
          </View>
          <Text style={s.summaryValue}>{loading ? '--' : pendingCount}</Text>
          <Text style={s.summaryLabel}>Pending</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filters} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, alignItems: 'center' }}>
        {(['all', 'cash', 'online', 'shop'] as const).map(f => (
          <TouchableOpacity
            key={f}
            style={[s.filterChip, filter === f && s.filterActive]}
            onPress={() => setFilter(f)}
          >
            <Ionicons
              name={f === 'all' ? 'list' : f === 'cash' ? 'cash-outline' : f === 'online' ? 'phone-portrait-outline' : 'bag-outline'}
              size={13}
              color={filter === f ? GREEN : 'rgba(255,255,255,0.4)'}
            />
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'cash' ? 'Cash' : f === 'online' ? 'Online' : 'Shop'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* List */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={GREEN} />}
      >
        {loading ? (
          <ActivityIndicator color={GREEN} style={{ marginTop: 60 }} size="large" />
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}>
              <Ionicons name="receipt-outline" size={36} color="rgba(255,255,255,0.2)" />
            </View>
            <Text style={s.emptyText}>No transactions found</Text>
            <Text style={s.emptySubtext}>Pull down to refresh</Text>
          </View>
        ) : (
          filtered.map((txn, i) => {
            const color = methodColor(txn.method);
            const isPaid = txn.status === 'paid';
            return (
              <View key={`${txn.type}-${txn.id}-${i}`} style={s.txnCard}>
                <View style={[s.txnIconBox, { backgroundColor: color + '15' }]}>
                  <Ionicons name={txn.type === 'shop' ? 'bag-outline' : methodIcon(txn.method)} size={20} color={color} />
                </View>
                <View style={s.txnMid}>
                  <Text style={s.txnCustomer} numberOfLines={1}>{txn.member_name}</Text>
                  <Text style={s.txnDesc} numberOfLines={1}>{txn.description || 'POS Transaction'}</Text>
                  <Text style={s.txnTime}>{timeAgo(txn.created_at)}</Text>
                </View>
                <View style={s.txnRight}>
                  <Text style={[s.txnAmount, !isPaid && { color: '#F59E0B' }]}>
                    {txn.amount === 0 ? 'FREE' : `₱${txn.amount.toLocaleString()}`}
                  </Text>
                  <View style={[s.txnBadge, { backgroundColor: isPaid ? color + '18' : '#F59E0B18' }]}>
                    <Text style={[s.txnBadgeText, { color: isPaid ? color : '#F59E0B' }]}>
                      {isPaid ? methodLabel(txn.method, txn.type) : 'PENDING'}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },

  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },

  summaryRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: GLASS, borderRadius: 22, padding: 14, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: GLASS_BORDER },
  summaryIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  summaryValue: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: 0.5 },

  filters: { maxHeight: 44, marginBottom: 14 },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 18, backgroundColor: GLASS, borderWidth: 1, borderColor: GLASS_BORDER },
  filterActive: { backgroundColor: GREEN + '18', borderColor: GREEN + '40' },
  filterText: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  filterTextActive: { color: GREEN },

  txnCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: GLASS, borderRadius: 20, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: GLASS_BORDER, gap: 12 },
  txnIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  txnMid: { flex: 1 },
  txnCustomer: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  txnDesc: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '600' },
  txnTime: { fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 3, fontWeight: '500' },
  txnRight: { alignItems: 'flex-end', gap: 6 },
  txnAmount: { fontSize: 15, fontWeight: '900', color: GREEN },
  txnBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  txnBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  empty: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: GLASS, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: GLASS_BORDER },
  emptyText: { fontSize: 16, color: 'rgba(255,255,255,0.3)', fontWeight: '700' },
  emptySubtext: { fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: '500' },
});
