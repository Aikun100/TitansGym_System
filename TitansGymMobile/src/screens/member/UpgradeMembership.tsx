import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { memberApi } from '../../services/api';

const TIERS = [
  {
    id: 'annual',
    name: 'Annual Membership',
    price: '500',
    color: ['#3B82F6', '#1D4ED8'],
    features: ['Discounted daily walk-in rate (₱50 instead of ₱60)', 'Official Titans Gym ID', 'Valid for 1 Full Year'],
  },
  {
    id: 'monthly',
    name: 'Monthly Unlimited',
    price: '1,000',
    color: ['#F59E0B', '#B45309'],
    features: ['Unlimited daily gym access', 'Zero daily walk-in fees', 'Valid for 30 Days'],
  },
];

const TIER_RANKS: Record<string, number> = {
  annual: 1,
  monthly: 2,
};

export default function UpgradeMembership({ navigation }: any) {
  const { user, setUser } = useApp();
  const [processing, setProcessing] = useState(false);

  const handleSelectTier = async (tierId: string) => {
    setProcessing(true);
    try {
      const { checkout_url } = await memberApi.createPaymongoCheckout(tierId);
      
      // Open PayMongo checkout in the browser
      await Linking.openURL(checkout_url);
      
      // Prompt user to verify when they return to the app
      Alert.alert(
        'Secure Checkout',
        'We opened PayMongo in your browser. Once you have completed the GCash/Card payment, come back and click Verify.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Verify Payment', onPress: verifyPayment }
        ]
      );
    } catch (e: any) {
      Alert.alert('Checkout Error', e.message || 'Failed to connect to PayMongo.');
    } finally {
      setProcessing(false);
    }
  };

  const verifyPayment = async () => {
    setProcessing(true);
    try {
      const response = await memberApi.verifyPaymongoPayment();
      setUser(response.user);
      Alert.alert('Payment Successful! 🎉', response.message, [
        { text: 'Awesome', onPress: () => navigation.goBack() }
      ]);
    } catch (e: any) {
      Alert.alert(
        'Payment Pending', 
        e.message || 'We could not verify your payment yet. Please wait a minute and try again.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Try Again', onPress: verifyPayment }
        ]
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundSecondary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade Membership</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>Choose the plan that fits your goals and elevate your fitness journey.</Text>

        {TIERS.map((tier) => {
          const isCurrent = user?.membershipType === tier.id;
          const userRank = TIER_RANKS[user?.membershipType || 'basic'] || 1;
          const tierRank = TIER_RANKS[tier.id];
          const isDowngrade = tierRank < userRank;
          const isDisabled = isCurrent || isDowngrade;

          let btnText = `Select ${tier.name}`;
          if (isCurrent) btnText = 'IN USE';
          else if (isDowngrade) btnText = 'Unavailable (Downgrade)';

          return (
            <LinearGradient key={tier.id} colors={tier.color as any} style={[styles.tierCard, isDisabled && styles.tierCardCurrent]} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
              {isCurrent && <View style={styles.currentBadge}><Text style={styles.currentBadgeText}>IN USE</Text></View>}
              
              <View style={styles.tierHeader}>
                <Text style={styles.tierName}>{tier.name}</Text>
                <Text style={styles.tierPrice}>₱{tier.price}<Text style={styles.tierPriceSub}> /mo</Text></Text>
              </View>

              <View style={styles.featureList}>
                {tier.features.map((feat, idx) => (
                  <View key={idx} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#FFF" />
                    <Text style={styles.featureText}>{feat}</Text>
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.selectBtn, isDisabled && styles.selectBtnDisabled]} 
                activeOpacity={0.8}
                disabled={isDisabled}
                onPress={() => handleSelectTier(tier.id)}
              >
                <Text style={[styles.selectBtnText, isDisabled && styles.selectBtnTextDisabled]}>
                  {btnText}
                </Text>
              </TouchableOpacity>
            </LinearGradient>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>

      {processing && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Connecting to PayMongo...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SIZES.spacingLg, paddingTop: 56, paddingBottom: SIZES.spacingMd, backgroundColor: COLORS.backgroundSecondary },
  backBtn: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg },
  subtitle: { fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: SIZES.spacingXxl, lineHeight: 22 },
  
  tierCard: { borderRadius: SIZES.radiusXl, padding: SIZES.spacingXl, marginBottom: SIZES.spacingXl, ...SHADOWS.medium },
  tierCardCurrent: { opacity: 0.8 },
  currentBadge: { position: 'absolute', top: -12, right: 20, backgroundColor: COLORS.success, paddingHorizontal: 12, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  currentBadgeText: { fontSize: 10, fontWeight: '800', color: '#FFF', letterSpacing: 1 },
  tierHeader: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: SIZES.spacingLg, gap: 4 },
  tierName: { fontSize: SIZES.xl, fontWeight: '800', color: '#FFF', letterSpacing: 1, flexWrap: 'wrap' },
  tierPrice: { fontSize: 28, fontWeight: '800', color: '#FFF', marginTop: 4 },
  tierPriceSub: { fontSize: SIZES.sm, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  featureList: { marginBottom: SIZES.spacingXl },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 12 },
  featureText: { fontSize: SIZES.md, color: '#FFF', flex: 1, flexWrap: 'wrap', lineHeight: 22 },
  selectBtn: { backgroundColor: '#FFF', borderRadius: SIZES.radiusMd, paddingVertical: 14, alignItems: 'center' },
  selectBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.2)' },
  selectBtnText: { fontSize: SIZES.md, fontWeight: '800', color: COLORS.background },
  selectBtnTextDisabled: { color: '#FFF' },

  // Loading Overlay
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  loadingText: { color: '#FFF', fontSize: SIZES.md, fontWeight: '600', marginTop: 16 },
});
