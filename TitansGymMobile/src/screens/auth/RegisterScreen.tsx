import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar,
  KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function RegisterScreen({ navigation }: any) {
  const { register } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'member' | 'trainer'>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Phone is required';
    if (!password.trim()) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Minimum 8 characters';
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const message = await register({
        name,
        email,
        password,
        password_confirmation: confirmPassword,
        phone,
        role,
      });
      Alert.alert('Success!', message || 'Account created. Please wait for admin approval.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = (field: string) => setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Back */}
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Join Titans Gym today</Text>

          {/* Role Selector */}
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[styles.roleChip, role === 'member' && styles.roleChipActive]}
              onPress={() => setRole('member')} activeOpacity={0.7}
            >
              <Ionicons name="person" size={18} color={role === 'member' ? '#FFF' : COLORS.textTertiary} />
              <Text style={[styles.roleChipText, role === 'member' && styles.roleChipTextActive]}>Member</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleChip, role === 'trainer' && styles.roleChipActiveTrainer]}
              onPress={() => setRole('trainer')} activeOpacity={0.7}
            >
              <Ionicons name="barbell" size={18} color={role === 'trainer' ? '#FFF' : COLORS.textTertiary} />
              <Text style={[styles.roleChipText, role === 'trainer' && styles.roleChipTextActive]}>Trainer</Text>
            </TouchableOpacity>
          </View>

          {/* Fields */}
          {([
            { key: 'name', label: 'Full Name', icon: 'person-outline' as const, value: name, onChange: setName, placeholder: 'John Doe', kb: 'default' as const },
            { key: 'email', label: 'Email', icon: 'mail-outline' as const, value: email, onChange: setEmail, placeholder: 'your@email.com', kb: 'email-address' as const },
            { key: 'phone', label: 'Phone', icon: 'call-outline' as const, value: phone, onChange: setPhone, placeholder: '+63 912 345 6789', kb: 'phone-pad' as const },
          ] as const).map((field) => (
            <View key={field.key} style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{field.label}</Text>
              <View style={[styles.inputWrapper, errors[field.key] && styles.inputError]}>
                <Ionicons name={field.icon} size={20} color={COLORS.textTertiary} />
                <TextInput
                  style={styles.input}
                  placeholder={field.placeholder}
                  placeholderTextColor={COLORS.textMuted}
                  value={field.value}
                  onChangeText={(t) => { field.onChange(t); clearError(field.key); }}
                  keyboardType={field.kb}
                  autoCapitalize={field.key === 'email' ? 'none' : 'words'}
                />
              </View>
              {errors[field.key] && <Text style={styles.errorText}>{errors[field.key]}</Text>}
            </View>
          ))}

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color={COLORS.textTertiary} />
              <TextInput style={styles.input} placeholder="Min 6 characters" placeholderTextColor={COLORS.textMuted}
                value={password} onChangeText={(t) => { setPassword(t); clearError('password'); }}
                secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.textTertiary} />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <View style={[styles.inputWrapper, errors.confirmPassword && styles.inputError]}>
              <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.textTertiary} />
              <TextInput style={styles.input} placeholder="Re-enter password" placeholderTextColor={COLORS.textMuted}
                value={confirmPassword} onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
                secureTextEntry={!showPassword} />
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>

          {/* Register Button */}
          <TouchableOpacity onPress={handleRegister} activeOpacity={0.8} disabled={loading} style={{ marginTop: SIZES.spacingLg }}>
            <LinearGradient
              colors={role === 'trainer' ? ['#7C3AED', '#5B21B6'] : [COLORS.primary, COLORS.primaryDark]}
              style={styles.registerButton}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                  <Text style={styles.registerButtonText}>Create Account</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, paddingHorizontal: SIZES.spacingXl, paddingTop: 56, paddingBottom: 40 },
  backButton: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingXl },
  formTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, marginBottom: 4 },
  formSubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary, marginBottom: SIZES.spacingXl },
  roleRow: { flexDirection: 'row', gap: SIZES.spacingMd, marginBottom: SIZES.spacingXl },
  roleChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 48, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border,
  },
  roleChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  roleChipActiveTrainer: { backgroundColor: COLORS.trainerAccent, borderColor: COLORS.trainerAccent },
  roleChipText: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.textTertiary },
  roleChipTextActive: { color: '#FFF' },
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
  registerButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: SIZES.radiusMd, ...SHADOWS.medium,
  },
  registerButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SIZES.spacingXl },
  loginText: { fontSize: SIZES.md, color: COLORS.textTertiary },
  loginLink: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.primary },
});
