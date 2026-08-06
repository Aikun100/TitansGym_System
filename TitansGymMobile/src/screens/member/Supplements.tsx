import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const SUPPLEMENTS = [
  { id: 1, name: 'Whey Protein Isolate', category: 'Protein', dosage: '1 scoop (30g)', timing: 'Post-workout / Morning', benefits: 'Muscle recovery, lean protein source, fast absorption', notes: 'Mix with water or milk. Take within 30 min after workout.', icon: 'flask-outline' as const },
  { id: 2, name: 'Creatine Monohydrate', category: 'Performance', dosage: '5g daily', timing: 'Any time (with water)', benefits: 'Strength gains, muscle endurance, cell hydration', notes: 'No need to cycle. Stay well hydrated. Can mix with shake.', icon: 'flash-outline' as const },
  { id: 3, name: 'BCAA (2:1:1)', category: 'Recovery', dosage: '5-10g', timing: 'During workout', benefits: 'Reduce muscle soreness, prevent breakdown, energy', notes: 'Mix with water, sip during training. Good for fasted workouts.', icon: 'water-outline' as const },
  { id: 4, name: 'Pre-Workout', category: 'Energy', dosage: '1 scoop', timing: '20-30 min before workout', benefits: 'Energy, focus, pump, endurance', notes: 'Avoid within 6 hours of sleep. Start with half scoop.', icon: 'rocket-outline' as const },
  { id: 5, name: 'Fish Oil (Omega-3)', category: 'Health', dosage: '2-3 capsules', timing: 'With meals', benefits: 'Joint health, heart health, anti-inflammatory', notes: 'Take with food to reduce fishy aftertaste.', icon: 'heart-outline' as const },
  { id: 6, name: 'Vitamin D3', category: 'Health', dosage: '2000-5000 IU', timing: 'Morning with fat', benefits: 'Bone health, immune support, mood', notes: 'Essential if limited sun exposure. Fat-soluble.', icon: 'sunny-outline' as const },
  { id: 7, name: 'Magnesium Glycinate', category: 'Recovery', dosage: '200-400mg', timing: 'Before bed', benefits: 'Sleep quality, muscle relaxation, recovery', notes: 'Glycinate form is gentle on stomach and promotes sleep.', icon: 'moon-outline' as const },
  { id: 8, name: 'Casein Protein', category: 'Protein', dosage: '1 scoop (30g)', timing: 'Before bed', benefits: 'Slow-release protein, overnight recovery', notes: 'Mixes thicker than whey. Great as pudding.', icon: 'bed-outline' as const },
  { id: 9, name: 'Multivitamin', category: 'Health', dosage: '1 tablet', timing: 'Morning with breakfast', benefits: 'Fill nutritional gaps, overall health', notes: 'Choose a quality sport-specific multivitamin.', icon: 'medical-outline' as const },
  { id: 10, name: 'Glutamine', category: 'Recovery', dosage: '5-10g', timing: 'Post-workout / Before bed', benefits: 'Gut health, immune support, recovery', notes: 'Especially useful during intense training phases.', icon: 'shield-outline' as const },
];

const CATEGORIES = ['All', 'Protein', 'Performance', 'Recovery', 'Energy', 'Health'];
const categoryColors: Record<string, string> = {
  Protein: COLORS.accent, Performance: COLORS.primary, Recovery: COLORS.success, Energy: COLORS.warning, Health: COLORS.trainerAccent,
};

export default function Supplements({ navigation }: any) {
  const [category, setCategory] = useState('All');

  const filtered = category === 'All' ? SUPPLEMENTS : SUPPLEMENTS.filter(s => s.category === category);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      {/* Hero Header */}
      <ImageBackground source={require('../../../assets/images/supplements-hero.png')} style={styles.heroImage} imageStyle={{ opacity: 0.4 }}>
        <LinearGradient colors={['transparent', COLORS.background]} style={styles.heroGradient}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Supplements Guide</Text>
          <Text style={styles.heroSubtitle}>Optimize your performance</Text>
        </LinearGradient>
      </ImageBackground>

      {/* Category Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat} style={[styles.filterChip, category === cat && styles.filterChipActive]}
            onPress={() => setCategory(cat)} activeOpacity={0.7}>
            <Text style={[styles.filterText, category === cat && styles.filterTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}><Ionicons name="flask" size={20} color={COLORS.primary} /><Text style={styles.summaryNum}>{SUPPLEMENTS.length}</Text><Text style={styles.summaryLabel}>Total</Text></View>
          <View style={styles.summaryCard}><Ionicons name="time" size={20} color={COLORS.warning} /><Text style={styles.summaryNum}>5</Text><Text style={styles.summaryLabel}>Categories</Text></View>
          <View style={styles.summaryCard}><Ionicons name="checkmark-circle" size={20} color={COLORS.success} /><Text style={styles.summaryNum}>Daily</Text><Text style={styles.summaryLabel}>Routine</Text></View>
        </View>

        {filtered.map(supp => {
          const color = categoryColors[supp.category] || COLORS.accent;
          return (
            <TouchableOpacity key={supp.id} style={styles.card} activeOpacity={0.7}
              onPress={() => Alert.alert(
                supp.name,
                `📦 Category: ${supp.category}\n💊 Dosage: ${supp.dosage}\n🕐 Timing: ${supp.timing}\n\n✅ Benefits:\n${supp.benefits}\n\n📋 Notes:\n${supp.notes}`,
                [{ text: 'Got It!' }]
              )}>
              <View style={[styles.cardIcon, { backgroundColor: color + '18' }]}>
                <Ionicons name={supp.icon} size={24} color={color} />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardName}>{supp.name}</Text>
                <Text style={styles.cardDosage}>{supp.dosage} • {supp.timing}</Text>
                <View style={[styles.catBadge, { backgroundColor: color + '15' }]}>
                  <Text style={[styles.catText, { color }]}>{supp.category}</Text>
                </View>
              </View>
              <Ionicons name="information-circle-outline" size={20} color={COLORS.textTertiary} />
            </TouchableOpacity>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  heroImage: { height: 180, backgroundColor: COLORS.backgroundSecondary },
  heroGradient: { flex: 1, justifyContent: 'flex-end', padding: SIZES.spacingLg, paddingTop: 52 },
  backBtn: { position: 'absolute', top: 52, left: SIZES.spacingLg, width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  heroTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: '#FFF' },
  heroSubtitle: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  filterScroll: { maxHeight: 44 },
  filterContent: { paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingSm },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterChipActive: { backgroundColor: COLORS.warning + '25', borderColor: COLORS.warning },
  filterText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  filterTextActive: { color: COLORS.warning, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg },
  summaryRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  summaryCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, gap: 4 },
  summaryNum: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingBase, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  cardIcon: { width: 48, height: 48, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd },
  cardContent: { flex: 1 },
  cardName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  cardDosage: { fontSize: SIZES.xs, color: COLORS.textSecondary, marginBottom: 6 },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: SIZES.radiusFull },
  catText: { fontSize: 10, fontWeight: '600' },
});
