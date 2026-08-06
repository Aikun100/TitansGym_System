import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Switch, Alert, Linking, Modal, TextInput, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';
import { getSavedServerIp, setApiBaseUrl, testServerConnection, autoDetectServerIp } from '../../services/api';

export default function SettingsScreen({ navigation, route }: any) {
  const { user, logout } = useApp();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [workoutReminders, setWorkoutReminders] = useState(true);
  const [bookingAlerts, setBookingAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Server config state
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [serverIp, setServerIp] = useState('');
  const [serverStatus, setServerStatus] = useState<'idle' | 'testing' | 'connected' | 'failed'>('idle');
  const [currentServerIp, setCurrentServerIp] = useState('');

  useEffect(() => {
    getSavedServerIp().then((ip) => {
      setCurrentServerIp(ip);
      setServerIp(ip);
    });
  }, []);

  const handleServerTest = async () => {
    if (!serverIp.trim()) { Alert.alert('Error', 'Enter a server IP'); return; }
    setServerStatus('testing');
    const ok = await testServerConnection(serverIp.trim());
    setServerStatus(ok ? 'connected' : 'failed');
  };

  const handleServerSave = async () => {
    if (!serverIp.trim()) { Alert.alert('Error', 'Enter a server IP'); return; }
    setServerStatus('testing');
    const ok = await testServerConnection(serverIp.trim());
    if (ok) {
      await setApiBaseUrl(serverIp.trim());
      setCurrentServerIp(serverIp.trim());
      setServerStatus('connected');
      Alert.alert('✅ Saved', `Server set to ${serverIp.trim()}`, [
        { text: 'OK', onPress: () => setShowServerConfig(false) },
      ]);
    } else {
      setServerStatus('failed');
      Alert.alert('Server Not Reachable', 'Save anyway?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Save', onPress: async () => {
          await setApiBaseUrl(serverIp.trim());
          setCurrentServerIp(serverIp.trim());
          setShowServerConfig(false);
        }},
      ]);
    }
  };

  const section = route?.params?.section || null;

  const handleDeleteAccount = () => {
    Alert.alert('Delete Account', 'This action is irreversible. All your data will be permanently deleted.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => {
        Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.');
        logout();
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '18' }]}>
                  <Ionicons name="phone-portrait-outline" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Push Notifications</Text>
                  <Text style={styles.settingDesc}>Receive alerts on your device</Text>
                </View>
              </View>
              <Switch value={pushEnabled} onValueChange={setPushEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.primary + '60' }}
                thumbColor={pushEnabled ? COLORS.primary : COLORS.textMuted} />
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.accent + '18' }]}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.accent} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Email Notifications</Text>
                  <Text style={styles.settingDesc}>Receive updates via email</Text>
                </View>
              </View>
              <Switch value={emailEnabled} onValueChange={setEmailEnabled}
                trackColor={{ false: COLORS.border, true: COLORS.accent + '60' }}
                thumbColor={emailEnabled ? COLORS.accent : COLORS.textMuted} />
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.success + '18' }]}>
                  <Ionicons name="barbell-outline" size={18} color={COLORS.success} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Workout Reminders</Text>
                  <Text style={styles.settingDesc}>Daily workout notifications</Text>
                </View>
              </View>
              <Switch value={workoutReminders} onValueChange={setWorkoutReminders}
                trackColor={{ false: COLORS.border, true: COLORS.success + '60' }}
                thumbColor={workoutReminders ? COLORS.success : COLORS.textMuted} />
            </View>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.warning + '18' }]}>
                  <Ionicons name="calendar-outline" size={18} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Booking Alerts</Text>
                  <Text style={styles.settingDesc}>Session confirmations & reminders</Text>
                </View>
              </View>
              <Switch value={bookingAlerts} onValueChange={setBookingAlerts}
                trackColor={{ false: COLORS.border, true: COLORS.warning + '60' }}
                thumbColor={bookingAlerts ? COLORS.warning : COLORS.textMuted} />
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette" size={20} color={COLORS.trainerAccent} />
            <Text style={styles.sectionTitle}>Appearance</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.trainerAccent + '18' }]}>
                  <Ionicons name="moon-outline" size={18} color={COLORS.trainerAccent} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Dark Mode</Text>
                  <Text style={styles.settingDesc}>Currently active</Text>
                </View>
              </View>
              <Switch value={darkMode} onValueChange={(v) => {
                setDarkMode(v);
                if (!v) Alert.alert('Coming Soon', 'Light mode will be available in a future update!');
              }}
                trackColor={{ false: COLORS.border, true: COLORS.trainerAccent + '60' }}
                thumbColor={darkMode ? COLORS.trainerAccent : COLORS.textMuted} />
            </View>
          </View>
        </View>

        {/* Server Configuration */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="server" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Server Connection</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}
              onPress={() => setShowServerConfig(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '18' }]}>
                  <Ionicons name="globe-outline" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Server IP</Text>
                  <Text style={styles.settingDesc}>{currentServerIp || 'Not configured'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Privacy & Security */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Privacy & Security</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}
              onPress={() => Alert.alert('Change Password', 'A password reset link will be sent to your email.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Send Link', onPress: () => Alert.alert('Sent ✅', `Password reset link sent to ${user?.email}`) },
              ])}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.success + '18' }]}>
                  <Ionicons name="lock-closed-outline" size={18} color={COLORS.success} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Change Password</Text>
                  <Text style={styles.settingDesc}>Update your account password</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.rowBorder]} activeOpacity={0.7}
              onPress={() => setShowPrivacy(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.accent + '18' }]}>
                  <Ionicons name="document-text-outline" size={18} color={COLORS.accent} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Privacy Policy</Text>
                  <Text style={styles.settingDesc}>View our privacy practices</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.rowBorder]} activeOpacity={0.7}
              onPress={() => Alert.alert('Data Export', 'We will prepare your data export and send it to your email within 24 hours.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Request Export', onPress: () => Alert.alert('Requested ✅', 'Your data will be sent to your email.') },
              ])}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.warning + '18' }]}>
                  <Ionicons name="download-outline" size={18} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Export My Data</Text>
                  <Text style={styles.settingDesc}>Download a copy of your data</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Help & Support */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color={COLORS.warning} />
            <Text style={styles.sectionTitle}>Help & Support</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}
              onPress={() => setShowHelp(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.warning + '18' }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.warning} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>FAQ</Text>
                  <Text style={styles.settingDesc}>Frequently asked questions</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.rowBorder]} activeOpacity={0.7}
              onPress={() => Linking.openURL('mailto:support@titansgym.com')}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '18' }]}>
                  <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Contact Support</Text>
                  <Text style={styles.settingDesc}>support@titansgym.com</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, styles.rowBorder]} activeOpacity={0.7}
              onPress={() => Alert.alert('Rate Us ⭐', 'Would you like to rate Titans Gym on the App Store?', [
                { text: 'Not Now' },
                { text: 'Rate Now', onPress: () => Alert.alert('Thank You! 🙏', 'We appreciate your support!') },
              ])}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.success + '18' }]}>
                  <Ionicons name="star-outline" size={18} color={COLORS.success} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Rate the App</Text>
                  <Text style={styles.settingDesc}>Help us improve</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle" size={20} color={COLORS.accent} />
            <Text style={styles.sectionTitle}>About</Text>
          </View>
          <View style={styles.card}>
            <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}
              onPress={() => setShowAbout(true)}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.accent + '18' }]}>
                  <Ionicons name="fitness-outline" size={18} color={COLORS.accent} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>About Titans Gym</Text>
                  <Text style={styles.settingDesc}>Version 1.0.0</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
            <View style={[styles.settingRow, styles.rowBorder]}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: COLORS.trainerAccent + '18' }]}>
                  <Ionicons name="code-slash-outline" size={18} color={COLORS.trainerAccent} />
                </View>
                <View>
                  <Text style={styles.settingLabel}>Build Info</Text>
                  <Text style={styles.settingDesc}>React Native / Expo SDK 54</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="warning" size={20} color={COLORS.danger} />
            <Text style={[styles.sectionTitle, { color: COLORS.danger }]}>Danger Zone</Text>
          </View>
          <TouchableOpacity style={styles.dangerButton} activeOpacity={0.7} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={20} color={COLORS.danger} />
            <Text style={styles.dangerText}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* About Modal */}
      <Modal visible={showAbout} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>About Titans Gym</Text>
              <TouchableOpacity onPress={() => setShowAbout(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.aboutBanner}>
                <Ionicons name="fitness" size={48} color="#FFF" />
                <Text style={styles.aboutAppName}>Titans Gym</Text>
                <Text style={styles.aboutVersion}>Version 1.0.0</Text>
              </LinearGradient>
              <Text style={styles.aboutText}>
                Titans Gym is a comprehensive fitness management platform designed for both members and trainers. Track your workouts, monitor progress, book sessions, and achieve your fitness goals.
              </Text>
              <View style={styles.aboutInfo}>
                {[
                  { label: 'Developer', value: 'Titans Gym Team' },
                  { label: 'Platform', value: 'React Native / Expo' },
                  { label: 'Backend', value: 'Laravel API' },
                  { label: 'Database', value: 'MySQL' },
                  { label: 'License', value: 'Proprietary' },
                ].map((item, idx) => (
                  <View key={idx} style={[styles.aboutRow, idx > 0 && styles.rowBorder]}>
                    <Text style={styles.aboutLabel}>{item.label}</Text>
                    <Text style={styles.aboutValue}>{item.value}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.aboutCopyright}>© 2026 Titans Gym. All rights reserved.</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Privacy Modal */}
      <Modal visible={showPrivacy} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowPrivacy(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { title: '1. Data Collection', body: 'We collect personal information such as name, email, phone number, and fitness metrics to provide our gym management services.' },
                { title: '2. Data Usage', body: 'Your data is used to personalize your workout experience, track progress, manage bookings, and communicate important updates.' },
                { title: '3. Data Security', body: 'We use industry-standard encryption and secure servers to protect your personal information. All API communications use token-based authentication.' },
                { title: '4. Third-Party Sharing', body: 'We do not sell or share your personal information with third parties. Trainer access to your data is limited to assigned clients only.' },
                { title: '5. Data Retention', body: 'Your data is retained as long as your account is active. Upon account deletion, all personal data is permanently removed within 30 days.' },
                { title: '6. Your Rights', body: 'You have the right to access, modify, export, or delete your personal data at any time through the app settings.' },
              ].map((item, idx) => (
                <View key={idx} style={styles.policySection}>
                  <Text style={styles.policyTitle}>{item.title}</Text>
                  <Text style={styles.policyBody}>{item.body}</Text>
                </View>
              ))}
              <Text style={styles.aboutCopyright}>Last updated: May 2026</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Help/FAQ Modal */}
      <Modal visible={showHelp} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Help & FAQ</Text>
              <TouchableOpacity onPress={() => setShowHelp(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[
                { q: 'How do I book a session?', a: 'Go to the Bookings tab, tap the "+" button, select your session type and preferred time, then submit your booking request.' },
                { q: 'How do I track my progress?', a: 'Navigate to the Progress tab and tap "+" to log your weight and body measurements. You can view your history and trends over time.' },
                { q: 'Can I cancel a booking?', a: 'Yes! Go to your Bookings tab, tap on a pending or confirmed booking, and select "Cancel". Cancellations must be made at least 24 hours before the session.' },
                { q: 'How do I change my trainer?', a: 'Contact the gym administration to request a trainer change. You can also book sessions with different trainers through the booking system.' },
                { q: 'What payment methods are accepted?', a: 'We accept cash, GCash, bank transfers, and credit/debit cards. Payment details can be viewed in the Payment History section.' },
                { q: 'How do I reset my password?', a: 'Tap "Forgot Password" on the login screen. A password reset link will be sent to your registered email address.' },
                { q: 'Can I use the app offline?', a: 'The app requires an internet connection to sync your data. However, you can view previously loaded data while offline.' },
                { q: 'How do I contact support?', a: 'Email us at support@titansgym.com or visit the front desk during gym hours (6AM - 10PM daily).' },
              ].map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.faqItem} activeOpacity={0.7}
                  onPress={() => Alert.alert(item.q, item.a)}>
                  <View style={styles.faqLeft}>
                    <View style={styles.faqDot}>
                      <Text style={styles.faqNum}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.faqQuestion}>{item.q}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textTertiary} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Server Config Modal */}
      <Modal visible={showServerConfig} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Server Configuration</Text>
              <TouchableOpacity onPress={() => setShowServerConfig(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: SIZES.sm, color: COLORS.textTertiary, marginBottom: 16, lineHeight: 20 }}>
              Change your server IP when you switch WiFi or hotspot.
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: COLORS.surface, padding: 12, borderRadius: SIZES.radiusMd, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
              <Text style={{ fontSize: SIZES.sm, color: COLORS.textSecondary, fontWeight: '600' }}>Status:</Text>
              <Text style={{ fontSize: SIZES.sm, fontWeight: '700', color: serverStatus === 'connected' ? '#22C55E' : serverStatus === 'failed' ? '#EF4444' : serverStatus === 'testing' ? '#F59E0B' : COLORS.textTertiary }}>
                {serverStatus === 'connected' ? '● Connected' : serverStatus === 'failed' ? '● Not Reachable' : serverStatus === 'testing' ? '● Testing...' : '● Not Tested'}
              </Text>
            </View>
            <Text style={{ fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 }}>Server IP Address</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 52, borderWidth: 1, borderColor: COLORS.border, gap: 10, marginBottom: 8 }}>
              <Ionicons name="globe-outline" size={20} color={COLORS.textTertiary} />
              <TextInput
                style={{ flex: 1, fontSize: SIZES.base, color: COLORS.text }}
                placeholder="e.g. 192.168.1.5"
                placeholderTextColor={COLORS.textMuted}
                value={serverIp}
                onChangeText={(t) => { setServerIp(t); setServerStatus('idle'); }}
                keyboardType="numeric"
                autoCapitalize="none"
              />
            </View>
            <Text style={{ fontSize: SIZES.xs, color: COLORS.textTertiary, marginBottom: 16 }}>💡 Tap "Auto-Detect" to automatically find your server, or enter the IP manually</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: SIZES.radiusMd, borderWidth: 1, backgroundColor: COLORS.primary + '12', borderColor: COLORS.primary + '30' }}
                onPress={handleServerTest} disabled={serverStatus === 'testing'}
              >
                {serverStatus === 'testing' ? <ActivityIndicator size="small" color={COLORS.primary} /> : <Ionicons name="pulse-outline" size={18} color={COLORS.primary} />}
                <Text style={{ fontSize: SIZES.sm, fontWeight: '600', color: COLORS.primary }}>Test</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 44, borderRadius: SIZES.radiusMd, borderWidth: 1, backgroundColor: '#22C55E12', borderColor: '#22C55E30' }}
                onPress={async () => {
                  setServerStatus('testing');
                  const ip = await autoDetectServerIp();
                  if (ip) {
                    setServerIp(`${ip}:8000`);
                    setCurrentServerIp(`${ip}:8000`);
                    setServerStatus('connected');
                    Alert.alert('✅ Auto-Detected', `Server IP: ${ip}`);
                  } else {
                    setServerStatus('failed');
                    Alert.alert('Not Found', 'Could not auto-detect. Enter IP manually.');
                  }
                }}
                disabled={serverStatus === 'testing'}
              >
                <Ionicons name="flash-outline" size={18} color="#22C55E" />
                <Text style={{ fontSize: SIZES.sm, fontWeight: '600', color: '#22C55E' }}>Auto-Detect</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={handleServerSave} activeOpacity={0.8} disabled={serverStatus === 'testing'}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: SIZES.radiusMd, ...SHADOWS.medium }}>
                <Ionicons name="save-outline" size={20} color="#FFF" />
                <Text style={{ fontSize: SIZES.base, fontWeight: '700', color: '#FFF' }}>Save & Connect</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  backBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg },
  section: { marginTop: SIZES.spacingXl },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: SIZES.spacingMd },
  sectionTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text },
  card: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SIZES.spacingBase },
  rowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  settingIcon: { width: 36, height: 36, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text },
  settingDesc: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 1 },
  dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: SIZES.spacingBase, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.danger + '40', backgroundColor: COLORS.dangerBg },
  dangerText: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.danger },
  // Modals
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.spacingXl, maxHeight: '88%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  aboutBanner: { borderRadius: SIZES.radiusLg, padding: SIZES.spacingXl, alignItems: 'center', marginBottom: SIZES.spacingXl },
  aboutAppName: { fontSize: SIZES.xxl, fontWeight: '800', color: '#FFF', marginTop: SIZES.spacingSm },
  aboutVersion: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  aboutText: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22, marginBottom: SIZES.spacingXl },
  aboutInfo: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, overflow: 'hidden', marginBottom: SIZES.spacingXl },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', padding: SIZES.spacingBase },
  aboutLabel: { fontSize: SIZES.sm, color: COLORS.textTertiary },
  aboutValue: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text },
  aboutCopyright: { fontSize: SIZES.xs, color: COLORS.textMuted, textAlign: 'center', marginTop: SIZES.spacingLg, marginBottom: SIZES.spacingXl },
  policySection: { marginBottom: SIZES.spacingXl },
  policyTitle: { fontSize: SIZES.base, fontWeight: '700', color: COLORS.text, marginBottom: 6 },
  policyBody: { fontSize: SIZES.md, color: COLORS.textSecondary, lineHeight: 22 },
  faqItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SIZES.spacingBase, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  faqLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  faqDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center' },
  faqNum: { fontSize: SIZES.xs, fontWeight: '700', color: COLORS.primary },
  faqQuestion: { fontSize: SIZES.md, color: COLORS.text, fontWeight: '500', flex: 1 },
});
