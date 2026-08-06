import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function TrainerProfile() {
  const navigation = useNavigation<any>();
  const { user, setUser, logout, clients } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editSpec, setEditSpec] = useState(user?.specialization || '');
  const [editRate, setEditRate] = useState(String(user?.hourlyRate || ''));

  const initials = (user?.name || 'T').replace('Coach ', '').split(' ').map(n => n[0]).join('').slice(0, 2);
  const certs = (user?.certifications || '').split(', ').filter(Boolean);

  const handleSaveProfile = () => {
    if (!editName.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setUser({
      ...user!,
      name: editName.trim(),
      phone: editPhone.trim(),
      specialization: editSpec.trim(),
      hourlyRate: parseFloat(editRate) || user!.hourlyRate,
    });
    setShowEditModal(false);
    Alert.alert('Updated ✅', 'Profile has been updated!');
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <LinearGradient colors={[COLORS.backgroundSecondary, COLORS.background]} style={styles.profileHeader}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Profile</Text>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7} onPress={() => {
              setEditName(user?.name || ''); setEditPhone(user?.phone || '');
              setEditSpec(user?.specialization || ''); setEditRate(String(user?.hourlyRate || ''));
              setShowEditModal(true);
            }}>
              <Ionicons name="create-outline" size={20} color={COLORS.trainerAccent} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.specBadge}>
              <Ionicons name="barbell" size={14} color={COLORS.trainerAccent} />
              <Text style={styles.specText}>{user?.specialization}</Text>
            </View>

            {/* Mini stats */}
            <View style={styles.miniStatsRow}>
              <View style={styles.miniStat}><Ionicons name="star" size={18} color={COLORS.warning} /><Text style={styles.miniStatValue}>{user?.rating || 4.8}</Text><Text style={styles.miniStatLabel}>Rating</Text></View>
              <View style={styles.miniStatDivider} />
              <View style={styles.miniStat}><Ionicons name="people" size={18} color={COLORS.accent} /><Text style={styles.miniStatValue}>{clients.length}</Text><Text style={styles.miniStatLabel}>Clients</Text></View>
              <View style={styles.miniStatDivider} />
              <View style={styles.miniStat}><Ionicons name="trophy" size={18} color={COLORS.success} /><Text style={styles.miniStatValue}>{user?.totalSessions || 342}</Text><Text style={styles.miniStatLabel}>Sessions</Text></View>
            </View>
          </View>
        </LinearGradient>

        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Information</Text>
          <View style={styles.infoCard}>
            {[
              { icon: 'call-outline' as const, label: 'Phone', value: user?.phone || '--' },
              { icon: 'barbell-outline' as const, label: 'Specialization', value: user?.specialization || '--' },
              { icon: 'ribbon-outline' as const, label: 'Certifications', value: user?.certifications || '--' },
              { icon: 'time-outline' as const, label: 'Experience', value: `${user?.experienceYears || 0} years` },
              { icon: 'cash-outline' as const, label: 'Hourly Rate', value: `₱${user?.hourlyRate || 0}/hr` },
            ].map((item, idx) => (
              <View key={idx} style={[styles.infoRow, idx > 0 && styles.infoRowBorder]}>
                <View style={styles.infoLeft}><Ionicons name={item.icon} size={18} color={COLORS.trainerAccent} /><Text style={styles.infoLabel}>{item.label}</Text></View>
                <Text style={styles.infoValue} numberOfLines={2}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Certifications */}
        {certs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            <View style={styles.certGrid}>
              {certs.map((cert, idx) => (
                <View key={idx} style={styles.certCard}>
                  <View style={styles.certIcon}><Ionicons name="medal-outline" size={24} color={COLORS.warning} /></View>
                  <Text style={styles.certName}>{cert}</Text>
                  <Text style={styles.certStatus}>Verified</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Performance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>
          <View style={styles.infoCard}>
            <View style={styles.perfRow}>
              <View style={styles.perfItem}><Text style={styles.perfValue}>{user?.totalSessions || 342}</Text><Text style={styles.perfLabel}>Total Sessions</Text></View>
              <View style={styles.perfItem}><Text style={styles.perfValue}>{clients.length}</Text><Text style={styles.perfLabel}>Active Clients</Text></View>
            </View>
            <View style={[styles.perfRow, styles.infoRowBorder]}>
              <View style={styles.perfItem}><Text style={styles.perfValue}>98%</Text><Text style={styles.perfLabel}>Completion</Text></View>
              <View style={styles.perfItem}><Text style={styles.perfValue}>{user?.rating || 4.8}</Text><Text style={styles.perfLabel}>Avg Rating</Text></View>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.infoCard}>
            {[
              { icon: 'notifications-outline' as const, label: 'Notifications', color: COLORS.trainerAccent, screen: 'Notifications' },
              { icon: 'settings-outline' as const, label: 'App Settings', color: COLORS.accent, screen: 'Settings' },
              { icon: 'shield-checkmark-outline' as const, label: 'Privacy & Security', color: COLORS.success, screen: 'Settings' },
              { icon: 'help-circle-outline' as const, label: 'Help & Support', color: COLORS.warning, screen: 'Settings' },
            ].map((item, idx) => (
              <TouchableOpacity key={idx} style={[styles.settingsRow, idx > 0 && styles.infoRowBorder]} activeOpacity={0.7}
                onPress={() => navigation.navigate(item.screen, { section: item.label })}>
                <View style={styles.infoLeft}><Ionicons name={item.icon} size={20} color={item.color} /><Text style={styles.settingsLabel}>{item.label}</Text></View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.7} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: SIZES.tabBarHeight + 30 }} />
      </ScrollView>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}><Ionicons name="close" size={24} color={COLORS.text} /></TouchableOpacity>
            </View>
            <Text style={styles.modalLabel}>Full Name</Text>
            <TextInput style={styles.modalInput} value={editName} onChangeText={setEditName} placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.modalLabel}>Phone</Text>
            <TextInput style={styles.modalInput} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.modalLabel}>Specialization</Text>
            <TextInput style={styles.modalInput} value={editSpec} onChangeText={setEditSpec} placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.modalLabel}>Hourly Rate (₱)</Text>
            <TextInput style={styles.modalInput} value={editRate} onChangeText={setEditRate} keyboardType="decimal-pad" placeholderTextColor={COLORS.textMuted} />
            <TouchableOpacity onPress={handleSaveProfile} activeOpacity={0.8}>
              <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.modalButton}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.modalButtonText}>Save Changes</Text>
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
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  profileHeader: { paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingXl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  editButton: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.trainerAccent + '18', justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center' },
  avatarGradient: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingMd },
  avatarText: { fontSize: SIZES.hero, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  profileEmail: { fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: SIZES.spacingMd },
  specBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.trainerAccent + '18', paddingHorizontal: 16, paddingVertical: 6, borderRadius: SIZES.radiusFull, marginBottom: SIZES.spacingLg },
  specText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.trainerAccent },
  miniStatsRow: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, borderWidth: 1, borderColor: COLORS.cardBorder, width: '100%', justifyContent: 'space-around' },
  miniStat: { alignItems: 'center', gap: 4 },
  miniStatValue: { fontSize: SIZES.lg, fontWeight: '800', color: COLORS.text },
  miniStatLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  miniStatDivider: { width: 1, backgroundColor: COLORS.border },
  section: { paddingHorizontal: SIZES.spacingLg, marginTop: SIZES.spacingXl },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.spacingMd },
  infoCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacingBase },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  infoLabel: { fontSize: SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, textAlign: 'right', flex: 1 },
  certGrid: { flexDirection: 'row', gap: SIZES.spacingMd },
  certCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, padding: SIZES.spacingBase, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  certIcon: { width: 44, height: 44, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.warning + '15', justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingSm },
  certName: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.text, textAlign: 'center', marginBottom: 4 },
  certStatus: { fontSize: SIZES.xs, color: COLORS.success, fontWeight: '600' },
  perfRow: { flexDirection: 'row', padding: SIZES.spacingBase },
  perfItem: { flex: 1, alignItems: 'center' },
  perfValue: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  perfLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  settingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacingBase },
  settingsLabel: { fontSize: SIZES.md, color: COLORS.text, fontWeight: '500' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: SIZES.spacingLg, marginTop: SIZES.spacingXxl, paddingVertical: SIZES.spacingBase, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.danger + '40', backgroundColor: COLORS.dangerBg },
  logoutText: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.danger },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: COLORS.overlay },
  modalContent: { backgroundColor: COLORS.backgroundSecondary, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: SIZES.spacingXl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  modalTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  modalLabel: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 6 },
  modalInput: { backgroundColor: COLORS.surface, borderRadius: SIZES.radiusMd, paddingHorizontal: SIZES.spacingBase, height: 48, fontSize: SIZES.base, color: COLORS.text, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
  modalButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52, borderRadius: SIZES.radiusMd, marginTop: 8 },
  modalButtonText: { fontSize: SIZES.base, fontWeight: '700', color: '#FFF' },
});
