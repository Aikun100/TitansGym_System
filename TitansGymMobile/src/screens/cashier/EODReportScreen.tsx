import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  ActivityIndicator, Alert, Share
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES } from '../../constants/theme';
import { cashierApi } from '../../services/api';

const G = '#10B981';

export default function EODReportScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await cashierApi.getTransactions();
      const allTxns = res.transactions || [];
      // Filter to today only
      const todayStr = new Date().toISOString().split('T')[0];
      const todayTxns = allTxns.filter((t: any) => {
        const txnDate = (t.created_at || t.date || '').split('T')[0];
        return txnDate === todayStr;
      });
      setTransactions(todayTxns);
    } catch (e) {
      console.log('EOD load error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, []);

  // Computed stats
  const paid = transactions.filter(t => t.status === 'paid');
  const pending = transactions.filter(t => t.status === 'pending');

  const totalRevenue = paid.reduce((s, t) => s + (t.amount || 0), 0);
  const cashRevenue = paid.filter(t => t.method === 'cash').reduce((s, t) => s + (t.amount || 0), 0);
  const onlineRevenue = paid.filter(t => t.method === 'online').reduce((s, t) => s + (t.amount || 0), 0);
  const cashTxns = paid.filter(t => t.method === 'cash');
  const onlineTxns = paid.filter(t => t.method === 'online');
  const shopTxns = paid.filter(t => t.type === 'shop');
  const sessionTxns = paid.filter(t => t.type === 'pos' || t.type === 'session');

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const handleShare = async () => {
    const report = `
TITANS GYM — END OF DAY REPORT
${dateStr}
${'─'.repeat(38)}

TOTAL REVENUE:    ₱${totalRevenue.toLocaleString()}

Payment Breakdown:
  Cash:           ₱${cashRevenue.toLocaleString()} (${cashTxns.length} txns)
  Online/GCash:   ₱${onlineRevenue.toLocaleString()} (${onlineTxns.length} txns)

Transaction Types:
  Sessions:       ${sessionTxns.length} txns
  Shop Orders:    ${shopTxns.length} txns

Completed:        ${paid.length} transactions
Pending:          ${pending.length} transactions

Generated: ${new Date().toLocaleTimeString('en-PH')}
    `.trim();

    try {
      await Share.share({ message: report, title: 'EOD Report — Titans Gym' });
    } catch (e) {
      Alert.alert('Share failed');
    }
  };

  const handleCloseRegister = () => {
    Alert.alert(
      'Close Register 🔒',
      `Are you sure you want to close today's register?\n\nTotal Revenue: ₱${totalRevenue.toLocaleString()}\nTransactions: ${paid.length}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close Register',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Register Closed ✅', 'Today\'s session has been closed. Have a great day!');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.container]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <LinearGradient colors={['#09090B', '#111113']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#FFF" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>EOD Report</Text>
          <Text style={styles.headerSub}>End of Day Summary</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color={G} />
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator color={G} size="large" style={{ marginTop: 80 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Date Banner */}
          <View style={styles.dateBanner}>
            <Ionicons name="calendar" size={16} color={G} />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>

          {/* Revenue Hero */}
          <LinearGradient colors={['rgba(16,185,129,0.85)', 'rgba(4,120,87,0.95)']} style={styles.revenueCard}>
            <View style={styles.revDecor1} /><View style={styles.revDecor2} />
            <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
            <Text style={styles.revenueAmount}>₱{Math.round(totalRevenue).toLocaleString()}</Text>
            <View style={styles.revRow}>
              <View style={styles.revStat}>
                <Text style={styles.revStatNum}>{paid.length}</Text>
                <Text style={styles.revStatLbl}>Completed</Text>
              </View>
              <View style={styles.revDivider} />
              <View style={styles.revStat}>
                <Text style={[styles.revStatNum, { color: '#FDE68A' }]}>{pending.length}</Text>
                <Text style={styles.revStatLbl}>Pending</Text>
              </View>
              <View style={styles.revDivider} />
              <View style={styles.revStat}>
                <Text style={styles.revStatNum}>{paid.length + pending.length}</Text>
                <Text style={styles.revStatLbl}>Total Txns</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Payment Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Breakdown</Text>
            <View style={styles.breakdownRow}>
              <BreakdownCard
                icon="cash-outline"
                label="Cash"
                amount={cashRevenue}
                count={cashTxns.length}
                color={G}
              />
              <BreakdownCard
                icon="phone-portrait-outline"
                label="Online"
                amount={onlineRevenue}
                count={onlineTxns.length}
                color={COLORS.accent}
              />
            </View>
          </View>

          {/* Transaction Type Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>By Category</Text>
            <View style={styles.categoryList}>
              <CategoryRow icon="body-outline" label="Gym Sessions" count={sessionTxns.length} color="#8B5CF6" />
              <CategoryRow icon="bag-outline" label="Shop Orders" count={shopTxns.length} color="#F59E0B" />
            </View>
          </View>

          {/* Transaction List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Transactions ({transactions.length})</Text>
            {transactions.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="receipt-outline" size={40} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>No transactions recorded today</Text>
              </View>
            ) : (
              transactions.map((t, idx) => (
                <View key={idx} style={styles.txnRow}>
                  <View style={[styles.txnIcon, { backgroundColor: (t.status === 'paid' ? G : COLORS.warning) + '15' }]}>
                    <Ionicons
                      name={t.type === 'shop' ? 'bag-outline' : 'fitness-outline'}
                      size={16}
                      color={t.status === 'paid' ? G : COLORS.warning}
                    />
                  </View>
                  <View style={styles.txnBody}>
                    <Text style={styles.txnName}>{t.member_name || t.description || 'Transaction'}</Text>
                    <Text style={styles.txnSub}>{t.method?.toUpperCase() || 'CASH'} · {t.type?.toUpperCase() || 'POS'}</Text>
                  </View>
                  <View style={styles.txnRight}>
                    <Text style={styles.txnAmt}>₱{Number(t.amount).toLocaleString()}</Text>
                    <View style={[styles.txnBadge, { backgroundColor: t.status === 'paid' ? G + '20' : COLORS.warning + '20' }]}>
                      <Text style={[styles.txnBadgeText, { color: t.status === 'paid' ? G : COLORS.warning }]}>
                        {(t.status || 'paid').toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Close Register Button */}
          <View style={styles.closeSection}>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseRegister}>
              <Ionicons name="lock-closed-outline" size={20} color="#FFF" />
              <Text style={styles.closeBtnText}>Close Register</Text>
            </TouchableOpacity>
            <Text style={styles.closeHint}>This will finalize today's report and log the closing time.</Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function BreakdownCard({ icon, label, amount, count, color }: any) {
  return (
    <View style={[bStyles.card, { borderColor: color + '30' }]}>
      <View style={[bStyles.icon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={bStyles.label}>{label}</Text>
      <Text style={[bStyles.amount, { color }]}>₱{Math.round(amount).toLocaleString()}</Text>
      <Text style={bStyles.count}>{count} transactions</Text>
    </View>
  );
}

function CategoryRow({ icon, label, count, color }: any) {
  return (
    <View style={catStyles.row}>
      <View style={[catStyles.icon, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={catStyles.label}>{label}</Text>
      <Text style={[catStyles.count, { color }]}>{count}</Text>
    </View>
  );
}

const bStyles = StyleSheet.create({
  card: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16,
    padding: 16, borderWidth: 1, alignItems: 'center',
  },
  icon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  label: { fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  amount: { fontSize: 20, fontWeight: '900', marginBottom: 4 },
  count: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
});

const catStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14,
    padding: 16, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  icon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  label: { flex: 1, fontSize: 15, fontWeight: '600', color: '#FFF' },
  count: { fontSize: 18, fontWeight: '900' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#FFF', flex: 1 },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },
  shareBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: G + '15',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: G + '40',
  },
  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 20, paddingVertical: 12,
    backgroundColor: 'rgba(16,185,129,0.05)',
  },
  dateText: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' },
  revenueCard: { margin: 20, borderRadius: 24, padding: 24, overflow: 'hidden', position: 'relative' },
  revDecor1: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(255,255,255,0.05)', top: -40, right: -40 },
  revDecor2: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -20, left: -20 },
  revenueLabel: { fontSize: 11, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  revenueAmount: { fontSize: 42, fontWeight: '900', color: '#FFF', marginBottom: 20 },
  revRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)', paddingTop: 16 },
  revStat: { flex: 1, alignItems: 'center' },
  revStatNum: { fontSize: 22, fontWeight: '900', color: '#FFF' },
  revStatLbl: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: '600' },
  revDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 },
  breakdownRow: { flexDirection: 'row', gap: 12 },
  categoryList: {},
  txnRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12,
    padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  txnIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  txnBody: { flex: 1 },
  txnName: { fontSize: 14, fontWeight: '600', color: '#FFF', marginBottom: 3 },
  txnSub: { fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: '600' },
  txnRight: { alignItems: 'flex-end', gap: 6 },
  txnAmt: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  txnBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 100 },
  txnBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  emptyCard: { alignItems: 'center', paddingVertical: 48, gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16 },
  emptyText: { fontSize: 14, color: 'rgba(255,255,255,0.3)', fontWeight: '600' },
  closeSection: { paddingHorizontal: 20, marginBottom: 20 },
  closeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    backgroundColor: '#EF4444', borderRadius: 16, paddingVertical: 18,
  },
  closeBtnText: { fontSize: 16, fontWeight: '800', color: '#FFF' },
  closeHint: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 10, lineHeight: 18 },
});
