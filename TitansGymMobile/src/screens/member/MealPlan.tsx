import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Dimensions, Image, ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';

const { width } = Dimensions.get('window');

const MEAL_PLANS = [
  {
    id: 1, name: 'High Protein Cut', goal: 'Fat Loss', calories: 1800, status: 'active',
    meals: [
      { type: 'Breakfast', name: 'Egg White Omelette', cals: 320, protein: 35, carbs: 12, fat: 15, time: '7:00 AM', items: ['4 egg whites', '1 whole egg', 'spinach', 'mushrooms', 'oat toast'] },
      { type: 'Mid-Morning', name: 'Protein Shake', cals: 200, protein: 30, carbs: 15, fat: 5, time: '10:00 AM', items: ['whey protein', 'banana', 'almond milk'] },
      { type: 'Lunch', name: 'Grilled Chicken Bowl', cals: 450, protein: 40, carbs: 35, fat: 18, time: '12:30 PM', items: ['grilled chicken breast', 'brown rice', 'broccoli', 'avocado'] },
      { type: 'Afternoon', name: 'Greek Yogurt', cals: 180, protein: 20, carbs: 12, fat: 8, time: '3:30 PM', items: ['greek yogurt', 'berries', 'granola'] },
      { type: 'Dinner', name: 'Salmon & Veggies', cals: 420, protein: 35, carbs: 20, fat: 22, time: '7:00 PM', items: ['baked salmon', 'sweet potato', 'asparagus', 'lemon'] },
      { type: 'Evening', name: 'Casein Shake', cals: 150, protein: 25, carbs: 5, fat: 3, time: '9:00 PM', items: ['casein protein', 'water'] },
    ],
  },
  {
    id: 2, name: 'Muscle Building', goal: 'Muscle Gain', calories: 2800, status: 'upcoming',
    meals: [
      { type: 'Breakfast', name: 'Power Oats', cals: 550, protein: 30, carbs: 65, fat: 18, time: '6:30 AM', items: ['oatmeal', 'protein powder', 'banana', 'peanut butter', 'honey'] },
      { type: 'Mid-Morning', name: 'Chicken Wrap', cals: 480, protein: 35, carbs: 45, fat: 16, time: '9:30 AM', items: ['whole wheat wrap', 'chicken breast', 'hummus', 'lettuce'] },
      { type: 'Lunch', name: 'Beef Stir Fry', cals: 620, protein: 45, carbs: 55, fat: 22, time: '12:30 PM', items: ['lean beef strips', 'rice noodles', 'mixed vegetables', 'soy sauce'] },
      { type: 'Post-Workout', name: 'Recovery Shake', cals: 350, protein: 40, carbs: 35, fat: 8, time: '3:30 PM', items: ['whey isolate', 'banana', 'oat milk', 'creatine'] },
      { type: 'Dinner', name: 'Turkey Pasta', cals: 580, protein: 40, carbs: 60, fat: 18, time: '7:00 PM', items: ['ground turkey', 'whole wheat pasta', 'marinara', 'parmesan'] },
      { type: 'Evening', name: 'Cottage Cheese', cals: 220, protein: 28, carbs: 10, fat: 6, time: '9:30 PM', items: ['cottage cheese', 'almonds', 'cinnamon'] },
    ],
  },
];

export default function MealPlan({ navigation }: any) {
  const [activePlan, setActivePlan] = useState(0);
  const plan = MEAL_PLANS[activePlan];

  const totalProtein = plan.meals.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = plan.meals.reduce((s, m) => s + m.carbs, 0);
  const totalFat = plan.meals.reduce((s, m) => s + m.fat, 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Hero Header */}
      <ImageBackground source={require('../../../assets/images/meal-hero.png')} style={styles.heroImage} imageStyle={{ opacity: 0.4 }}>
        <LinearGradient colors={['transparent', COLORS.background]} style={styles.heroGradient}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.heroTitle}>Meal Plans</Text>
          <Text style={styles.heroSubtitle}>Fuel your transformation</Text>
        </LinearGradient>
      </ImageBackground>

      {/* Plan Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.planSelector} contentContainerStyle={styles.planSelectorContent}>
        {MEAL_PLANS.map((p, idx) => (
          <TouchableOpacity key={p.id} style={[styles.planChip, activePlan === idx && styles.planChipActive]}
            onPress={() => setActivePlan(idx)} activeOpacity={0.7}>
            <Text style={[styles.planChipText, activePlan === idx && styles.planChipTextActive]}>{p.name}</Text>
            <View style={[styles.planStatus, { backgroundColor: p.status === 'active' ? COLORS.success + '20' : COLORS.textTertiary + '20' }]}>
              <Text style={[styles.planStatusText, { color: p.status === 'active' ? COLORS.success : COLORS.textTertiary }]}>{p.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Summary Card */}
        <LinearGradient colors={[COLORS.success + '20', COLORS.background]} style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={styles.summaryName}>{plan.name}</Text>
              <Text style={styles.summaryGoal}>{plan.goal} • {plan.calories} kcal/day</Text>
            </View>
            <View style={[styles.goalBadge, { backgroundColor: plan.goal === 'Fat Loss' ? COLORS.danger + '20' : COLORS.success + '20' }]}>
              <Ionicons name={plan.goal === 'Fat Loss' ? 'trending-down' : 'trending-up'} size={16} color={plan.goal === 'Fat Loss' ? COLORS.danger : COLORS.success} />
            </View>
          </View>
          <View style={styles.macrosRow}>
            <View style={styles.macroItem}><Text style={[styles.macroValue, { color: COLORS.accent }]}>{totalProtein}g</Text><Text style={styles.macroLabel}>Protein</Text></View>
            <View style={styles.macroItem}><Text style={[styles.macroValue, { color: COLORS.warning }]}>{totalCarbs}g</Text><Text style={styles.macroLabel}>Carbs</Text></View>
            <View style={styles.macroItem}><Text style={[styles.macroValue, { color: COLORS.primary }]}>{totalFat}g</Text><Text style={styles.macroLabel}>Fat</Text></View>
            <View style={styles.macroItem}><Text style={[styles.macroValue, { color: COLORS.success }]}>{plan.calories}</Text><Text style={styles.macroLabel}>Calories</Text></View>
          </View>
        </LinearGradient>

        {/* Meals */}
        <Text style={styles.sectionTitle}>{plan.meals.length} Meals</Text>
        {plan.meals.map((meal, idx) => (
          <TouchableOpacity key={idx} style={styles.mealCard} activeOpacity={0.7}
            onPress={() => Alert.alert(
              `${meal.type}: ${meal.name}`,
              `🕐 ${meal.time}\n\n🥗 ${meal.items.join(', ')}\n\n📊 Macros:\n• Calories: ${meal.cals} kcal\n• Protein: ${meal.protein}g\n• Carbs: ${meal.carbs}g\n• Fat: ${meal.fat}g`,
              [{ text: 'Close' }]
            )}>
            <View style={styles.mealTime}><Text style={styles.mealTimeText}>{meal.time}</Text></View>
            <View style={styles.mealConnector} />
            <View style={styles.mealContent}>
              <Text style={styles.mealType}>{meal.type}</Text>
              <Text style={styles.mealName}>{meal.name}</Text>
              <View style={styles.mealMacros}>
                <Text style={styles.mealMacro}>{meal.cals} kcal</Text>
                <Text style={styles.mealMacroDot}>•</Text>
                <Text style={[styles.mealMacro, { color: COLORS.accent }]}>{meal.protein}g P</Text>
                <Text style={styles.mealMacroDot}>•</Text>
                <Text style={[styles.mealMacro, { color: COLORS.warning }]}>{meal.carbs}g C</Text>
                <Text style={styles.mealMacroDot}>•</Text>
                <Text style={[styles.mealMacro, { color: COLORS.primary }]}>{meal.fat}g F</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
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
  planSelector: { maxHeight: 68 },
  planSelectorContent: { paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingMd },
  planChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
  planChipActive: { backgroundColor: COLORS.success + '15', borderColor: COLORS.success },
  planChipText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '600' },
  planChipTextActive: { color: COLORS.success },
  planStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: SIZES.radiusFull },
  planStatusText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingLg },
  summaryCard: { borderRadius: SIZES.radiusLg, padding: SIZES.spacingLg, borderWidth: 1, borderColor: COLORS.success + '20', marginBottom: SIZES.spacingXl },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SIZES.spacingLg },
  summaryName: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  summaryGoal: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  goalBadge: { width: 36, height: 36, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center' },
  macrosRow: { flexDirection: 'row', justifyContent: 'space-around' },
  macroItem: { alignItems: 'center' },
  macroValue: { fontSize: SIZES.lg, fontWeight: '800' },
  macroLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  sectionTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.spacingMd },
  mealCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingMd, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  mealTime: { width: 56, alignItems: 'center' },
  mealTimeText: { fontSize: SIZES.xs, color: COLORS.textTertiary, fontWeight: '600' },
  mealConnector: { width: 2, height: 40, backgroundColor: COLORS.success + '30', marginHorizontal: SIZES.spacingMd, borderRadius: 1 },
  mealContent: { flex: 1 },
  mealType: { fontSize: SIZES.xs, color: COLORS.success, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  mealName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 4 },
  mealMacros: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  mealMacro: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  mealMacroDot: { fontSize: SIZES.xs, color: COLORS.textMuted, marginHorizontal: 4 },
});
