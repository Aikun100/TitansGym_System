import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity,
  Image, StatusBar, FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SIZES } from '../../constants/theme';

const { width, height } = Dimensions.get('window');
const ONBOARDING_KEY = '@titans_onboarded_v1';

export async function checkOnboarded(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function markOnboarded() {
  try { await AsyncStorage.setItem(ONBOARDING_KEY, 'true'); } catch {}
}

const SLIDES = [
  {
    id: '1',
    title: 'Welcome to\nTitans Gym',
    subtitle: 'Your all-in-one fitness platform. Track progress, book sessions, and smash your goals.',
    icon: 'barbell-outline' as const,
    gradient: ['#7C3AED', '#4F46E5'] as const,
    accentColor: '#A78BFA',
    bg: 'rgba(124,58,237,0.08)',
  },
  {
    id: '2',
    title: 'Train with\nPro Trainers',
    subtitle: 'Book certified trainers, get custom workout plans, and follow guided exercise programs.',
    icon: 'fitness-outline' as const,
    gradient: ['#EF4444', '#DC2626'] as const,
    accentColor: '#FCA5A5',
    bg: 'rgba(239,68,68,0.08)',
  },
  {
    id: '3',
    title: 'Track Every\nMilestone',
    subtitle: 'Log body metrics, monitor attendance, earn achievement badges, and celebrate your journey.',
    icon: 'trending-up-outline' as const,
    gradient: ['#10B981', '#059669'] as const,
    accentColor: '#6EE7B7',
    bg: 'rgba(16,185,129,0.08)',
  },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatRef = useRef<FlatList>(null);

  // Per-slide animations
  const fadeAnims = SLIDES.map(() => useRef(new Animated.Value(0)).current);
  const slideAnims = SLIDES.map(() => useRef(new Animated.Value(40)).current);
  const iconAnims = SLIDES.map(() => useRef(new Animated.Value(0)).current);

  const animateSlide = (index: number) => {
    // Reset
    fadeAnims[index].setValue(0);
    slideAnims[index].setValue(40);
    iconAnims[index].setValue(0);
    // Play
    Animated.parallel([
      Animated.timing(fadeAnims[index], { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(slideAnims[index], { toValue: 0, duration: 500, useNativeDriver: true }),
      Animated.spring(iconAnims[index], { toValue: 1, friction: 5, tension: 80, useNativeDriver: true }),
    ]).start();
  };

  React.useEffect(() => { animateSlide(0); }, []);

  const goNext = () => {
    const next = currentIndex + 1;
    if (next >= SLIDES.length) {
      handleDone();
      return;
    }
    flatRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
    animateSlide(next);
  };

  const handleDone = async () => {
    await markOnboarded();
    onDone();
  };

  const renderSlide = ({ item, index }: { item: typeof SLIDES[0]; index: number }) => (
    <View style={styles.slide}>
      {/* Icon Hero */}
      <Animated.View style={[
        styles.iconHero,
        { backgroundColor: item.bg, transform: [{ scale: iconAnims[index] }] }
      ]}>
        <LinearGradient colors={item.gradient} style={styles.iconGradient}>
          <Ionicons name={item.icon} size={72} color="#FFF" />
        </LinearGradient>

        {/* Floating ring decorations */}
        <View style={[styles.ring, styles.ring1, { borderColor: item.accentColor + '30' }]} />
        <View style={[styles.ring, styles.ring2, { borderColor: item.accentColor + '20' }]} />
        <View style={[styles.ring, styles.ring3, { borderColor: item.accentColor + '10' }]} />
      </Animated.View>

      {/* Text */}
      <Animated.View style={[
        styles.textBox,
        { opacity: fadeAnims[index], transform: [{ translateY: slideAnims[index] }] }
      ]}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </Animated.View>
    </View>
  );

  const slide = SLIDES[currentIndex];
  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Dynamic background glow */}
      <LinearGradient
        colors={[COLORS.background, COLORS.background]}
        style={StyleSheet.absoluteFillObject}
      />
      <View style={[styles.bgGlow, { backgroundColor: slide.accentColor + '12' }]} />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleDone}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={i => i.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      />

      {/* Bottom controls */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && { backgroundColor: slide.accentColor, width: 24 },
              ]}
            />
          ))}
        </View>

        {/* CTA Button */}
        <TouchableOpacity onPress={goNext} activeOpacity={0.85} style={styles.ctaWrapper}>
          <LinearGradient colors={slide.gradient} style={styles.ctaBtn} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.ctaText}>{isLast ? "Let's Go! 💪" : 'Continue'}</Text>
            <Ionicons name={isLast ? 'checkmark-circle' : 'arrow-forward'} size={20} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 24 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  bgGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  skipBtn: {
    position: 'absolute', top: 56, right: 24, zIndex: 10,
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  skipText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },

  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  iconHero: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 48,
    position: 'relative',
  },
  iconGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ring: {
    position: 'absolute',
    borderRadius: 1000,
    borderWidth: 1.5,
  },
  ring1: { width: 160, height: 160, borderRadius: 80 },
  ring2: { width: 185, height: 185, borderRadius: 93 },
  ring3: { width: 210, height: 210, borderRadius: 105 },

  textBox: { alignItems: 'center' },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#FFF',
    textAlign: 'center',
    lineHeight: 42,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '400',
    maxWidth: 300,
  },

  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    alignItems: 'center',
    gap: 20,
  },
  dots: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },

  ctaWrapper: { width: '100%', borderRadius: 18, overflow: 'hidden' },
  ctaBtn: {
    height: 56,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaText: { fontSize: 17, fontWeight: '800', color: '#FFF' },
});
