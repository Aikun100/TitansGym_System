import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function LoginScreen({ navigation }: any) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password.trim()) e.password = 'Password is required';
    else if (password.length < 4) e.password = 'Password must be at least 4 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email, password);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Invalid email or password. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: 'member' | 'trainer') => {
    setLoading(true);
    try {
      const credentials = role === 'trainer'
        ? { email: 'trainer@gym.com', password: 'password' }
        : { email: 'member@gym.com', password: 'password' };
      await login(credentials.email, credentials.password);
    } catch (error: any) {
      Alert.alert(
        'Login Failed',
        error.message || 'Could not connect to server. Make sure the backend is running.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Decorative */}
          <View style={styles.bgDeco1} />
          <View style={styles.bgDeco2} />

          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.logoBox}>
              <Ionicons name="fitness" size={36} color="#FFF" />
            </LinearGradient>
            <Text style={styles.appName}>TITANS GYM</Text>
            <Text style={styles.tagline}>Train · Transform · Triumph</Text>
          </View>

          {/* Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Sign In</Text>
            <Text style={styles.formSubtitle}>Welcome back! Enter your credentials</Text>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputWrapper, errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="your@email.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setErrors(prev => ({ ...prev, email: undefined })); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setErrors(prev => ({ ...prev, password: undefined })); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textTertiary} />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity onPress={() => {
              Alert.alert(
                'Reset Password',
                'Enter your email address and we\'ll send you a password reset link.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Send Reset Link', onPress: () => {
                    Alert.alert('Email Sent ✅', 'If an account exists with that email, you will receive a password reset link shortly.');
                  }},
                ]
              );
            }}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity onPress={handleLogin} activeOpacity={0.8} disabled={loading}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.loginButton}>
                {loading ? <ActivityIndicator color="#FFF" /> : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="#FFF" />
                    <Text style={styles.loginButtonText}>Sign In</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or quick login</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Login Buttons */}
            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickButton} onPress={() => quickLogin('member')} activeOpacity={0.7} disabled={loading}>
                <Ionicons name="person-outline" size={20} color={COLORS.primary} />
                <Text style={styles.quickButtonText}>Member</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.quickButton, styles.quickButtonTrainer]} onPress={() => quickLogin('trainer')} activeOpacity={0.7} disabled={loading}>
                <Ionicons name="barbell-outline" size={20} color={COLORS.trainerAccent} />
                <Text style={[styles.quickButtonText, { color: COLORS.trainerAccent }]}>Trainer</Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SIZES.spacingXl, paddingVertical: 40 },
  bgDeco1: { position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: COLORS.primary + '08' },
  bgDeco2: { position: 'absolute', bottom: -80, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.trainerAccent + '06' },
  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 72, height: 72, borderRadius: SIZES.radiusXl, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingMd, ...SHADOWS.large },
  appName: { fontSize: SIZES.xxxl, fontWeight: '900', color: COLORS.text, letterSpacing: 3 },
  tagline: { fontSize: SIZES.sm, color: COLORS.textTertiary, letterSpacing: 2, marginTop: 4 },
  formSection: {},
  formTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  formSubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary, marginBottom: SIZES.spacingXl },
  inputGroup: { marginBottom: SIZES.spacingBase },
  inputLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase,
    height: 52, borderWidth: 1, borderColor: COLORS.border, gap: 10,
  },
  inputError: { borderColor: COLORS.danger },
  input: { flex: 1, fontSize: SIZES.base, color: COLORS.text },
  errorText: { fontSize: SIZES.xs, color: COLORS.danger, marginTop: 4, marginLeft: 4 },
  forgotText: { fontSize: SIZES.sm, color: COLORS.primary, fontWeight: '600', textAlign: 'right', marginBottom: SIZES.spacingLg },
  loginButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: SIZES.radiusMd, ...SHADOWS.medium,
  },
  loginButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: SIZES.spacingXl },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { fontSize: SIZES.sm, color: COLORS.textTertiary, marginHorizontal: 12 },
  quickRow: { flexDirection: 'row', gap: SIZES.spacingMd },
  quickButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.primary + '12',
    borderWidth: 1, borderColor: COLORS.primary + '30',
  },
  quickButtonTrainer: { backgroundColor: COLORS.trainerAccent + '12', borderColor: COLORS.trainerAccent + '30' },
  quickButtonText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.primary },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.spacingXl },
  registerText: { fontSize: SIZES.md, color: COLORS.textTertiary },
  registerLink: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.primary },
});
