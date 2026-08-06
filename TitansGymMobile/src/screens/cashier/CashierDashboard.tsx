import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, Animated, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { cashierApi } from '../../services/api';

const G = '#10B981';
const G_DARK = '#047857';
const G2 = '#34D399';
const GLASS = 'rgba(255,255,255,0.06)';
const GLASS_BORDER = 'rgba(255,255,255,0.1)';

function AnimatedNumber({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 900, useNativeDriver: false }).start();
    const listener = anim.addListener(({ value: v }) => setDisplay(Math.round(v)));
    return () => anim.removeListener(listener);
  }, [value]);

  return (
    <Text style={styles.statValue}>
      {prefix}{display.toLocaleString()}{suffix}
    </Text>
  );
}

export default function CashierDashboard({ navigation }: any) {
  const { user } = useApp();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    today_sales: 0,
    today_transactions: 0,
    today_members: 0,
    cash_payments: 0,
    cash_count: 0,
    online_payments: 0,
    online_count: 0,
    order_sales: 0,
    order_count: 0,
  });

  const currentDate = new Date();
  const hour = currentDate.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const emoji = hour < 12 ? '☀️' : hour < 17 ? '⛅' : '🌙';

  const loadStats = useCallback(async () => {
    try {
      const data = await cashierApi.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.log('Stats error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
  }, [loadStats]);

  const quickActions = [
    { id: 'pos',   title: 'New Sale',     subtitle: 'Open POS',        icon: 'cart',    color: G,             action: () => navigation.navigate('POS') },
    { id: 'scan',  title: 'Scan QR',      subtitle: 'Verify order',     icon: 'qr-code', color: COLORS.accent,  action: () => navigation.navigate('POS', { screen: 'Scanner' }) },
    { id: 'txns',  title: 'History',      subtitle: 'All transactions', icon: 'receipt', color: '#8B5CF6',      action: () => navigation.navigate('Transactions') },
    { id: 'eod',   title: 'EOD Report',   subtitle: 'Close register',   icon: 'bar-chart', color: '#EF4444',   action: () => navigation.navigate('EODReport') },
  ];

  const totalShopRevenue = stats.order_sales;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="light-content" backgroundColor="#09090B" />

      {/* Header */}
      <LinearGradient
        colors={['#09090B', '#111113']}
        style={[styles.header, { paddingTop: insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.greeting}>{emoji} {greeting}</Text>
            <Text style={styles.userName}>{user?.name || 'Cashier'}</Text>
          </View>
          <View style={styles.roleBadge}>
            <View style={styles.roleDot} />
            <Text style={styles.roleBadgeText}>ON DUTY</Text>
          </View>
        </View>
        <Text style={styles.headerDate}>
          {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={G} />}
      >
        {/* ─── Today's Summary Hero Card ─── */}
        <LinearGradient
          colors={['rgba(16,185,129,0.85)', 'rgba(4,120,87,0.95)']}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Decorative circles */}
          <View style={styles.heroBubble1} />
          <View style={styles.heroBubble2} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>TODAY'S REVENUE</Text>
              {loading ? (
                <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
              ) : (
                <AnimatedNumber value={stats.today_sales} prefix="₱" />
              )}
            </View>
            <View style={styles.heroIconBox}>
              <Ionicons name="trending-up" size={26} color="#fff" />
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNum}>{loading ? '--' : stats.today_transactions}</Text>
              <Text style={styles.heroStatLabel}>Transactions</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNum}>{loading ? '--' : stats.today_members}</Text>
              <Text style={styles.heroStatLabel}>Members In</Text>
            </View>
            <View style={styles.heroStatDivider} />
            <View style={styles.heroStatItem}>
              <Text style={styles.heroStatNum}>{loading ? '--' : stats.order_count}</Text>
              <Text style={styles.heroStatLabel}>Shop Orders</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Quick Actions ─── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          {quickActions.map((a) => (
            <TouchableOpacity
              key={a.id}
              style={styles.quickCard}
              activeOpacity={0.75}
              onPress={a.action}
            >
              <LinearGradient
                colors={[a.color + '22', a.color + '08']}
                style={styles.quickGradient}
              >
                <View style={[styles.quickIconBox, { backgroundColor: a.color + '20', borderColor: a.color + '30' }]}>
                  <Ionicons name={a.icon as any} size={22} color={a.color} />
                </View>
                <Text style={styles.quickTitle}>{a.title}</Text>
                <Text style={styles.quickSub}>{a.subtitle}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Payment Breakdown ─── */}
        <Text style={styles.sectionTitle}>Payment Breakdown</Text>
        <View style={styles.breakdownRow}>
          {/* Cash */}
          <View style={[styles.breakdownCard, { borderLeftColor: G }]}>
            <View style={[styles.breakdownIcon, { backgroundColor: G + '18' }]}>
              <Ionicons name="cash-outline" size={20} color={G} />
            </View>
            <Text style={styles.breakdownLabel}>Cash</Text>
            <Text style={styles.breakdownValue}>
              {loading ? '--' : `₱${stats.cash_payments.toLocaleString()}`}
            </Text>
            <View style={styles.breakdownBadge}>
              <Text style={styles.breakdownCount}>{loading ? '-' : stats.cash_count} txn</Text>
            </View>
          </View>

          {/* Online */}
          <View style={[styles.breakdownCard, { borderLeftColor: COLORS.accent }]}>
            <View style={[styles.breakdownIcon, { backgroundColor: COLORS.accent + '18' }]}>
              <Ionicons name="phone-portrait-outline" size={20} color={COLORS.accent} />
            </View>
            <Text style={styles.breakdownLabel}>Online</Text>
            <Text style={styles.breakdownValue}>
              {loading ? '--' : `₱${stats.online_payments.toLocaleString()}`}
            </Text>
            <View style={styles.breakdownBadge}>
              <Text style={styles.breakdownCount}>{loading ? '-' : stats.online_count} txn</Text>
            </View>
          </View>

          {/* Shop */}
          <View style={[styles.breakdownCard, { borderLeftColor: '#F59E0B' }]}>
            <View style={[styles.breakdownIcon, { backgroundColor: '#F59E0B18' }]}>
              <Ionicons name="bag-outline" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.breakdownLabel}>Shop</Text>
            <Text style={styles.breakdownValue}>
              {loading ? '--' : `₱${stats.order_sales.toLocaleString()}`}
            </Text>
            <View style={styles.breakdownBadge}>
              <Text style={styles.breakdownCount}>{loading ? '-' : stats.order_count} ord</Text>
            </View>
          </View>
        </View>

        {/* ─── CTA ─── */}
        <TouchableOpacity
          style={styles.ctaBtn}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('POS')}
        >
          <LinearGradient colors={[G, G_DARK]} style={styles.ctaGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <View style={styles.ctaIconCircle}>
              <Ionicons name="add" size={22} color={G} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.ctaTitle}>Start New Transaction</Text>
              <Text style={styles.ctaSub}>Open Point of Sale terminal</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={28} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#09090B' },

  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  userName: { fontSize: 26, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  headerDate: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6, fontWeight: '500' },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(16,185,129,0.12)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 30, borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)',
  },
  roleDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: G },
  roleBadgeText: { fontSize: 10, fontWeight: '900', color: G, letterSpacing: 1.5 },

  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  // Hero
  heroCard: {
    borderRadius: 28, padding: 24, marginTop: 16,
    overflow: 'hidden',
    ...SHADOWS.large,
  },
  heroBubble1: {
    position: 'absolute', width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.07)', top: -40, right: -30,
  },
  heroBubble2: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -20, left: 30,
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '800', letterSpacing: 2 },
  statValue: { fontSize: 38, fontWeight: '900', color: '#FFF', marginTop: 6, letterSpacing: -1 },
  heroIconBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  heroStats: {
    flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 18, padding: 16, marginTop: 20, alignItems: 'center',
    justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  heroStatItem: { alignItems: 'center', flex: 1 },
  heroStatDivider: { width: 1, height: 28, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroStatNum: { fontSize: 20, fontWeight: '900', color: '#FFF' },
  heroStatLabel: { fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },

  // Sections
  sectionTitle: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.4)', marginTop: 28, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 2 },

  // Quick Actions
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: { width: '47%', borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: GLASS_BORDER },
  quickGradient: { padding: 18 },
  quickIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 1, marginBottom: 14 },
  quickTitle: { fontSize: 15, fontWeight: '800', color: '#FFF' },
  quickSub: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3, fontWeight: '600' },

  // Breakdown
  breakdownRow: { flexDirection: 'row', gap: 10 },
  breakdownCard: {
    flex: 1, backgroundColor: GLASS, borderRadius: 20, padding: 14,
    borderWidth: 1, borderColor: GLASS_BORDER, borderLeftWidth: 3,
    alignItems: 'flex-start', gap: 6,
  },
  breakdownIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  breakdownLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '700', textTransform: 'uppercase' },
  breakdownValue: { fontSize: 16, fontWeight: '900', color: '#FFF' },
  breakdownBadge: { backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginTop: 2 },
  breakdownCount: { fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: '700' },

  // CTA
  ctaBtn: { marginTop: 24, borderRadius: 24, overflow: 'hidden', ...SHADOWS.large },
  ctaGradient: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  ctaIconCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  ctaTitle: { fontSize: 17, fontWeight: '900', color: '#FFF' },
  ctaSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 3, fontWeight: '500' },
});
