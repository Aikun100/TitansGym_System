import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function PaymentHistory({ navigation }: any) {
  const { payments, user } = useApp();

  const totalSpent = payments.reduce((sum, p) => sum + p.amount, 0);
  const methodColors: Record<string, string> = { GCash: COLORS.accent, Cash: COLORS.success, Card: COLORS.trainerAccent };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payments</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Total */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>TOTAL SPENT</Text>
          <Text style={styles.totalValue}>₱{totalSpent.toLocaleString()}</Text>
          <View style={styles.totalRow}>
            <View style={styles.totalStat}><Ionicons name="receipt-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.totalStatText}>{payments.length} payments</Text></View>
            <View style={styles.totalStat}><Ionicons name="card-outline" size={16} color={COLORS.textSecondary} /><Text style={styles.totalStatText}>{user?.membershipType} Plan</Text></View>
          </View>
        </View>

        {/* Payment Methods Summary */}
        <Text style={styles.sectionTitle}>Payment Methods</Text>
        <View style={styles.methodsRow}>
          {['GCash', 'Cash', 'Card'].map(method => {
            const count = payments.filter(p => p.method === method).length;
            const amount = payments.filter(p => p.method === method).reduce((s, p) => s + p.amount, 0);
            return (
              <View key={method} style={styles.methodCard}>
                <View style={[styles.methodIcon, { backgroundColor: (methodColors[method] || COLORS.accent) + '18' }]}>
                  <Ionicons name={method === 'GCash' ? 'phone-portrait-outline' : method === 'Cash' ? 'cash-outline' : 'card-outline'} size={20} color={methodColors[method] || COLORS.accent} />
                </View>
                <Text style={styles.methodName}>{method}</Text>
                <Text style={styles.methodAmount}>₱{amount.toLocaleString()}</Text>
                <Text style={styles.methodCount}>{count} payment{count !== 1 ? 's' : ''}</Text>
              </View>
            );
          })}
        </View>

        {/* History */}
        <Text style={styles.sectionTitle}>Transaction History</Text>
        {payments.map((payment) => {
          const color = methodColors[payment.method] || COLORS.accent;
          return (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={[styles.paymentIcon, { backgroundColor: COLORS.success + '15' }]}>
                <Ionicons name="checkmark-circle" size={22} color={COLORS.success} />
              </View>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentType}>{payment.type}</Text>
                <View style={styles.paymentMeta}>
                  <Text style={styles.paymentDate}>{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                  <View style={[styles.methodBadge, { backgroundColor: color + '15' }]}>
                    <Text style={[styles.methodBadgeText, { color }]}>{payment.method}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.paymentRight}>
                <Text style={styles.paymentAmount}>₱{payment.amount.toLocaleString()}</Text>
                <Text style={[styles.paymentStatus, { color: COLORS.success }]}>{payment.status}</Text>
              </View>
            </View>
          );
        })}

        {payments.length === 0 && (
          <View style={styles.emptyState}><Ionicons name="receipt-outline" size={48} color={COLORS.textTertiary} /><Text style={styles.emptyText}>No payment records yet</Text></View>
        )}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  backBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingMd },
  totalCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusXl, padding: SIZES.spacingXl, borderWidth: 1, borderColor: COLORS.cardBorder, alignItems: 'center', marginBottom: SIZES.spacingXl, ...SHADOWS.small },
  totalLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, letterSpacing: 1.5, fontWeight: '600', marginBottom: 4 },
  totalValue: { fontSize: 36, fontWeight: '900', color: COLORS.text, marginBottom: SIZES.spacingMd },
  totalRow: { flexDirection: 'row', gap: SIZES.spacingXl },
  totalStat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  totalStatText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  sectionTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.spacingMd },
  methodsRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  methodCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  methodIcon: { width: 40, height: 40, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingSm },
  methodName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  methodAmount: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text },
  methodCount: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  paymentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingBase, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  paymentIcon: { width: 40, height: 40, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd },
  paymentInfo: { flex: 1 },
  paymentType: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  paymentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentDate: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  methodBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: SIZES.radiusFull },
  methodBadgeText: { fontSize: 10, fontWeight: '600' },
  paymentRight: { alignItems: 'flex-end' },
  paymentAmount: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  paymentStatus: { fontSize: SIZES.xs, fontWeight: '600', textTransform: 'capitalize' },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: SIZES.spacingMd },
});
