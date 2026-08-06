import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator, StyleSheet, Text, Image, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES } from './src/constants/theme';
import { AppProvider, useApp } from './src/context/AppContext';

import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import MemberTabs from './src/navigation/MemberTabs';
import TrainerTabs from './src/navigation/TrainerTabs';
import CashierTabs from './src/navigation/CashierTabs';
import OnboardingScreen, { checkOnboarded } from './src/screens/onboarding/OnboardingScreen';

const DarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    primary: COLORS.primary,
    background: COLORS.background,
    card: COLORS.backgroundSecondary,
    text: COLORS.text,
    border: COLORS.border,
    notification: COLORS.danger,
  },
};

const Stack = createNativeStackNavigator();

// ─── Premium Splash Screen ───
function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 100, useNativeDriver: true }),
    ]).start(() => {
      // Text fade in after logo
      Animated.timing(textAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    });

    // Pulse the loading indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <LinearGradient colors={[COLORS.background, '#0D1321', COLORS.backgroundSecondary]} style={styles.splashContainer}>
      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />
      <View style={styles.decorCircle3} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
        <Image source={require('./assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
      </Animated.View>

      {/* App Name */}
      <Animated.View style={[styles.textContainer, { opacity: textAnim }]}>
        <Text style={styles.appName}>TITANS</Text>
        <Text style={styles.appSubName}>GYM</Text>
        <View style={styles.divider} />
        <Text style={styles.tagline}>Train. Transform. Triumph.</Text>
      </Animated.View>

      {/* Loading */}
      <Animated.View style={[styles.loadingSection, { opacity: textAnim, transform: [{ scale: pulseAnim }] }]}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </Animated.View>
    </LinearGradient>
  );
}

function AppNavigator() {
  const { user, loading } = useApp();
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!loading) {
      checkOnboarded().then(done => {
        setShowOnboarding(!done);
        setOnboardingChecked(true);
      });
    }
  }, [loading]);

  // Show splash while restoring session or checking onboarding
  if (loading || !onboardingChecked) {
    return <SplashScreen />;
  }

  // First-time user: show onboarding before login
  if (showOnboarding) {
    return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;
  }

  return (
    <NavigationContainer theme={DarkTheme}>
      {!user ? (
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : user.role === 'member' ? (
        <MemberTabs />
      ) : user.role === 'cashier' ? (
        <CashierTabs />
      ) : (
        <TrainerTabs />
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}


const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: COLORS.primaryGlow,
    top: -80,
    right: -80,
    opacity: 0.15,
  },
  decorCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.accentGlow,
    bottom: -40,
    left: -60,
    opacity: 0.12,
  },
  decorCircle3: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.trainerAccentGlow,
    top: '40%',
    left: -40,
    opacity: 0.08,
  },
  logoContainer: {
    width: 140,
    height: 140,
    borderRadius: 35,
    overflow: 'hidden',
    marginBottom: SIZES.spacingXl,
    borderWidth: 2,
    borderColor: COLORS.primary + '30',
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  appName: {
    fontSize: 42,
    fontWeight: '900',
    color: COLORS.text,
    letterSpacing: 8,
  },
  appSubName: {
    fontSize: 22,
    fontWeight: '300',
    color: COLORS.primary,
    letterSpacing: 16,
    marginTop: -2,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.primary,
    marginVertical: 16,
    borderRadius: 1,
  },
  tagline: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  loadingSection: {
    position: 'absolute',
    bottom: 80,
  },
});
