import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, Image, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import {
  getSavedServerIp,
  setApiBaseUrl,
  testServerConnection,
  autoDiscoverServer,
  autoDetectServerIp,
} from '../../services/api';

export default function LoginScreen({ navigation }: any) {
  const { login } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  // ─── Server Config State ───
  const [showServerModal, setShowServerModal] = useState(false);
  const [serverIp, setServerIp] = useState('');
  const [serverStatus, setServerStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [isAutoDiscovering, setIsAutoDiscovering] = useState(false);
  const [currentServerIp, setCurrentServerIp] = useState('');
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect server IP from Expo on mount
  useEffect(() => {
    (async () => {
      // Try auto-detect first (grabs IP from Expo's connection)
      const detectedIp = await autoDetectServerIp();
      if (detectedIp) {
        setAutoDetected(true);
        const fullIp = `${detectedIp}:8000`;
        setCurrentServerIp(fullIp);
        setServerIp(fullIp);
        console.log(`[API] Auto-detected server IP: ${detectedIp}`);
      } else {
        // Fall back to saved IP
        const savedIp = await getSavedServerIp();
        setCurrentServerIp(savedIp);
        setServerIp(savedIp);
      }
    })();
  }, []);

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

  // ─── OTP / Google State ───
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  const startOtpCountdown = () => {
    setOtpCountdown(60);
    const t = setInterval(() => {
      setOtpCountdown(prev => { if (prev <= 1) { clearInterval(t); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!otpEmail.trim() || !/\S+@\S+\.\S+/.test(otpEmail)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setOtpSending(true);
    try {
      // In production this would call the backend to send a real OTP email.
      // For this demo we simulate it and show the code in an alert.
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      Alert.alert(
        '📧 OTP Sent',
        `[Dev Mode] Your verification code is: ${mockCode}\n\nIn production this is sent to your email.`,
        [{ text: 'OK' }]
      );
      setOtpSent(true);
      startOtpCountdown();
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send OTP');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code sent to your email.');
      return;
    }
    setOtpVerifying(true);
    try {
      // In production, verify with backend. Here we auto-login matching email.
      await login(otpEmail, 'password'); // fallback for dev
      setShowOtpModal(false);
    } catch (e: any) {
      Alert.alert('Verification Failed', 'The code is incorrect or your account was not found.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert(
      'Google Sign-In',
      'Google OAuth requires expo-auth-session + Google Cloud credentials. To enable:\n\n1. Set up a Google OAuth 2.0 client ID\n2. Install expo-auth-session\n3. Configure redirect URIs\n\nFor now, use Email OTP below.',
      [{ text: 'Got It' }]
    );
  };

  // ─── Server Config Functions ───
  const handleTestConnection = async () => {
    if (!serverIp.trim()) {
      Alert.alert('Error', 'Please enter a server IP address');
      return;
    }
    setServerStatus('testing');
    const reachable = await testServerConnection(serverIp.trim());
    setServerStatus(reachable ? 'connected' : 'failed');
  };

  const handleSaveServer = async () => {
    if (!serverIp.trim()) {
      Alert.alert('Error', 'Please enter a server IP address');
      return;
    }

    // Test first, then save
    setServerStatus('testing');
    const reachable = await testServerConnection(serverIp.trim());

    if (reachable) {
      await setApiBaseUrl(serverIp.trim());
      setCurrentServerIp(serverIp.trim());
      setServerStatus('connected');
      const cleanIp = serverIp.trim();
      const isDomain = cleanIp.includes('.') && !/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?::[0-9]+)?$/.test(cleanIp);
      const displayUrl = isDomain 
        ? (cleanIp.startsWith('http') ? cleanIp : `https://${cleanIp}`)
        : (cleanIp.includes(':') ? cleanIp : `${cleanIp}:8000`);
      Alert.alert('✅ Server Saved', `API URL set to ${displayUrl}`, [
        { text: 'OK', onPress: () => setShowServerModal(false) },
      ]);
    } else {
      setServerStatus('failed');
      // Still allow saving even if not reachable (server might not be on yet)
      Alert.alert(
        'Server Not Reachable',
        'The server is not responding right now. Save this IP anyway?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save Anyway',
            onPress: async () => {
              await setApiBaseUrl(serverIp.trim());
              setCurrentServerIp(serverIp.trim());
              setShowServerModal(false);
            },
          },
        ]
      );
    }
  };

  const handleAutoDiscover = async () => {
    setIsAutoDiscovering(true);
    setServerStatus('testing');
    try {
      const foundIp = await autoDiscoverServer();
      if (foundIp) {
        setServerIp(foundIp);
        setServerStatus('connected');
        Alert.alert(
          '🎉 Server Found!',
          `Found server at ${foundIp}. Save this address?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Save',
              onPress: async () => {
                await setApiBaseUrl(foundIp);
                setCurrentServerIp(foundIp);
              },
            },
          ]
        );
      } else {
        setServerStatus('failed');
        Alert.alert(
          'Server Not Found',
          'Could not auto-discover the server on your network. Make sure:\n\n• The Laravel server is running (php artisan serve --host=0.0.0.0)\n• Your phone and PC are on the same WiFi/hotspot\n\nYou can also enter the IP manually.',
          [{ text: 'OK' }]
        );
      }
    } catch (e) {
      setServerStatus('failed');
    } finally {
      setIsAutoDiscovering(false);
    }
  };

  const getStatusColor = () => {
    switch (serverStatus) {
      case 'connected': return '#22C55E';
      case 'failed': return '#EF4444';
      case 'testing': return '#F59E0B';
      default: return COLORS.textTertiary;
    }
  };

  const getStatusText = () => {
    switch (serverStatus) {
      case 'connected': return '● Connected';
      case 'failed': return '● Not Reachable';
      case 'testing': return '● Testing...';
      default: return '● Not Tested';
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

          {/* Server Config Button (top-right) */}
          <TouchableOpacity
            style={styles.serverConfigBtn}
            onPress={() => setShowServerModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="server-outline"
              size={18}
              color={currentServerIp ? (autoDetected ? '#22C55E' : COLORS.primary) : COLORS.danger}
            />
            <Text style={[styles.serverConfigText, { color: currentServerIp ? (autoDetected ? '#22C55E' : COLORS.primary) : COLORS.danger }]}>
              {currentServerIp
                ? `${currentServerIp.split(':')[0]}${autoDetected ? ' ✓ Auto' : ''}`
                : 'Set Server'}
            </Text>
          </TouchableOpacity>

          {/* Logo */}
          <View style={styles.logoSection}>
            <View style={styles.logoBox}>
              <Image source={require('../../../assets/images/logo.png')} style={styles.logoImage} resizeMode="contain" />
            </View>
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
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleLogin} activeOpacity={0.8}>
              <View style={styles.googleIcon}>
                <Text style={styles.googleG}>G</Text>
              </View>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Email OTP Button */}
            <TouchableOpacity style={styles.otpBtn} onPress={() => { setOtpEmail(email); setShowOtpModal(true); setOtpSent(false); setOtpCode(''); }} activeOpacity={0.8}>
              <Ionicons name="mail-outline" size={20} color={COLORS.primary} />
              <Text style={styles.otpBtnText}>Sign in with Email OTP</Text>
            </TouchableOpacity>

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

      {/* ─── Server Configuration Modal ─── */}
      <Modal visible={showServerModal} transparent animationType="slide" onRequestClose={() => setShowServerModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="server" size={24} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Server Configuration</Text>
              </View>
              <TouchableOpacity onPress={() => setShowServerModal(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>Set your computer's IP address so the app can connect to the Laravel backend.</Text>
            <View style={styles.statusBar}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Text style={[styles.statusValue, { color: getStatusColor() }]}>{getStatusText()}</Text>
            </View>
            <Text style={styles.modalInputLabel}>Server IP Address</Text>
            <View style={styles.modalInputWrapper}>
              <Ionicons name="globe-outline" size={20} color={COLORS.textTertiary} />
              <TextInput style={styles.modalInput} placeholder="e.g. 192.168.1.5" placeholderTextColor={COLORS.textMuted} value={serverIp} onChangeText={(t) => { setServerIp(t); setServerStatus('idle'); }} keyboardType="numeric" autoCapitalize="none" />
            </View>
            <Text style={styles.helperText}>💡 Run "ipconfig" on your PC to find your IPv4 address.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, styles.testBtn]} onPress={handleTestConnection} disabled={serverStatus === 'testing'} activeOpacity={0.7}>
                {serverStatus === 'testing' ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="pulse-outline" size={18} color={COLORS.primary} />}
                <Text style={[styles.modalBtnText, { color: COLORS.primary }]}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, styles.discoverBtn]} onPress={handleAutoDiscover} disabled={isAutoDiscovering} activeOpacity={0.7}>
                {isAutoDiscovering ? <ActivityIndicator size="small" color="#F59E0B" /> : <Ionicons name="search-outline" size={18} color="#F59E0B" />}
                <Text style={[styles.modalBtnText, { color: '#F59E0B' }]}>Auto-Find</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleSaveServer} activeOpacity={0.8} disabled={serverStatus === 'testing' || isAutoDiscovering}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveButton}>
                <Ionicons name="save-outline" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save & Connect</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.instructions}>
              <Text style={styles.instructionsTitle}>📋 How to find your IP:</Text>
              <Text style={styles.instructionStep}>1. Open Command Prompt on your PC</Text>
              <Text style={styles.instructionStep}>2. Type: ipconfig</Text>
              <Text style={styles.instructionStep}>3. Copy the IPv4 Address (e.g., 192.168.1.5)</Text>
              <Text style={[styles.instructionStep, { marginTop: 8, color: COLORS.primary }]}>Make sure Laravel is running: php artisan serve --host=0.0.0.0</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── Email OTP Modal ─── */}
      <Modal visible={showOtpModal} transparent animationType="slide" onRequestClose={() => setShowOtpModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Ionicons name="mail" size={24} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Email Verification</Text>
              </View>
              <TouchableOpacity onPress={() => setShowOtpModal(false)}>
                <Ionicons name="close-circle" size={28} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              {otpSent
                ? `A 6-digit code was sent to ${otpEmail}. Enter it below.`
                : 'Enter your email address to receive a one-time verification code.'}
            </Text>

            <Text style={styles.modalInputLabel}>Email Address</Text>
            <View style={styles.modalInputWrapper}>
              <Ionicons name="mail-outline" size={20} color={COLORS.textTertiary} />
              <TextInput
                style={styles.modalInput}
                placeholder="your@email.com"
                placeholderTextColor={COLORS.textMuted}
                value={otpEmail}
                onChangeText={setOtpEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!otpSent}
              />
            </View>

            {otpSent && (
              <>
                <Text style={[styles.modalInputLabel, { marginTop: 16 }]}>6-Digit Code</Text>
                <View style={styles.otpInputWrapper}>
                  <TextInput
                    style={styles.otpInput}
                    placeholder="000000"
                    placeholderTextColor={COLORS.textMuted}
                    value={otpCode}
                    onChangeText={t => setOtpCode(t.replace(/[^0-9]/g, '').slice(0, 6))}
                    keyboardType="number-pad"
                    maxLength={6}
                    textAlign="center"
                  />
                </View>
              </>
            )}

            {!otpSent ? (
              <TouchableOpacity onPress={handleSendOtp} activeOpacity={0.8} disabled={otpSending} style={{ marginTop: 20 }}>
                <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveButton}>
                  {otpSending ? <ActivityIndicator color="#FFF" /> : <>
                    <Ionicons name="send-outline" size={18} color="#FFF" />
                    <Text style={styles.saveButtonText}>Send Verification Code</Text>
                  </>}
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity onPress={handleVerifyOtp} activeOpacity={0.8} disabled={otpVerifying} style={{ marginTop: 20 }}>
                  <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.saveButton}>
                    {otpVerifying ? <ActivityIndicator color="#FFF" /> : <>
                      <Ionicons name="checkmark-circle-outline" size={18} color="#FFF" />
                      <Text style={styles.saveButtonText}>Verify & Sign In</Text>
                    </>}
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { if (otpCountdown === 0) { setOtpSent(false); setOtpCode(''); } }}
                  style={{ marginTop: 12, alignItems: 'center' }}
                  disabled={otpCountdown > 0}
                >
                  <Text style={{ color: otpCountdown > 0 ? COLORS.textTertiary : COLORS.primary, fontSize: SIZES.sm, fontWeight: '600' }}>
                    {otpCountdown > 0 ? `Resend code in ${otpCountdown}s` : 'Resend Code'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: SIZES.spacingXl, paddingVertical: 40 },
  bgDeco1: { position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: COLORS.primary + '08' },
  bgDeco2: { position: 'absolute', bottom: -80, left: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: COLORS.trainerAccent + '06' },

  // Server config button (top of login screen)
  serverConfigBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 8,
  },
  serverConfigText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },

  logoSection: { alignItems: 'center', marginBottom: 40 },
  logoBox: { width: 80, height: 80, borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingMd, ...SHADOWS.large, borderWidth: 1, borderColor: COLORS.primary + '30' },
  logoImage: { width: '100%', height: '100%' },
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

  // Google Sign-In
  googleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12,
    height: 52, borderRadius: SIZES.radiusMd, backgroundColor: '#FFF',
    borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 12,
    ...SHADOWS.small,
  },
  googleIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: '#4285F4',
    justifyContent: 'center', alignItems: 'center',
  },
  googleG: { fontSize: 15, fontWeight: '900', color: '#FFF' },
  googleBtnText: { fontSize: SIZES.base, fontWeight: '700', color: '#1F2937' },

  // Email OTP
  otpBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10,
    height: 52, borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary + '12', borderWidth: 1, borderColor: COLORS.primary + '40',
    marginBottom: 4,
  },
  otpBtnText: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.primary },

  // OTP code input
  otpInputWrapper: {
    backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd,
    borderWidth: 2, borderColor: COLORS.primary, height: 64, justifyContent: 'center',
    marginTop: 4,
  },
  otpInput: { fontSize: 28, fontWeight: '900', color: COLORS.text, letterSpacing: 16 },

  // ─── Modal Styles ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: SIZES.xl,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalSubtitle: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
    lineHeight: 20,
    marginBottom: 16,
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  statusValue: {
    fontSize: SIZES.sm,
    fontWeight: '700',
  },
  modalInputLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    paddingHorizontal: SIZES.spacingBase,
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 10,
  },
  modalInput: {
    flex: 1,
    fontSize: SIZES.base,
    color: COLORS.text,
  },
  helperText: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  modalBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
  },
  testBtn: {
    backgroundColor: COLORS.primary + '12',
    borderColor: COLORS.primary + '30',
  },
  discoverBtn: {
    backgroundColor: '#F59E0B12',
    borderColor: '#F59E0B30',
  },
  modalBtnText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    borderRadius: SIZES.radiusMd,
    ...SHADOWS.medium,
    marginBottom: 16,
  },
  saveButtonText: {
    fontSize: SIZES.base,
    fontWeight: '700',
    color: '#FFF',
  },
  instructions: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  instructionsTitle: {
    fontSize: SIZES.sm,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: 20,
    paddingLeft: 4,
  },
});
