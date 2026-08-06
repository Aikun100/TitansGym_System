import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, Modal, TextInput, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function MemberProfile() {
  const navigation = useNavigation<any>();
  const { user, setUser, logout, attendance, checkIn, checkOut, payments } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [editHeight, setEditHeight] = useState(String(user?.height || ''));
  const [editWeight, setEditWeight] = useState(String(user?.weight || ''));

  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2);
  const checkedInToday = attendance.length > 0 && attendance[0].checkOut === '--';

  const handleSaveProfile = () => {
    if (!editName.trim()) { Alert.alert('Error', 'Name is required'); return; }
    setUser({
      ...user!,
      name: editName.trim(),
      phone: editPhone.trim(),
      height: parseFloat(editHeight) || user!.height,
      weight: parseFloat(editWeight) || user!.weight,
    });
    setShowEditModal(false);
    Alert.alert('Updated ✅', 'Profile has been updated successfully!');
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
              setEditHeight(String(user?.height || '')); setEditWeight(String(user?.weight || ''));
              setShowEditModal(true);
            }}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.avatarSection}>
            <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.avatarGradient}>
              <Text style={styles.avatarText}>{initials}</Text>
            </LinearGradient>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.memberTypeBadge}>
              <Ionicons name="star" size={14} color={COLORS.warning} />
              <Text style={styles.memberTypeText}>{user?.membershipType} Member</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Digital Member Card */}
        <View style={styles.section}>
          <LinearGradient colors={['#1E293B', '#0F172A']} style={styles.idCard}>
            <View style={styles.idCardHeader}>
              <View>
                <Text style={styles.idCardLabel}>MEMBER ID</Text>
                <Text style={styles.idCardNumber}>TG-{String(user?.id).padStart(6, '0')}</Text>
              </View>
              <View style={styles.qrContainer}>
                <Image 
                  source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=TitansGym-Member-${user?.id}&color=1E293B&bgcolor=FFFFFF` }} 
                  style={styles.qrCode} 
                />
              </View>
            </View>
            <View style={styles.idCardFooter}>
              <View>
                <Text style={styles.idCardLabel}>STATUS</Text>
                <Text style={[styles.idCardValue, { color: COLORS.success }]}>ACTIVE</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.idCardLabel}>TIER</Text>
                <Text style={styles.idCardValue}>{user?.membershipType?.toUpperCase()}</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Personal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <View style={styles.infoCard}>
            {[
              { icon: 'call-outline' as const, label: 'Phone', value: user?.phone || '--' },
              { icon: 'calendar-outline' as const, label: 'Age', value: user?.age ? `${user.age} years old` : '--' },
              { icon: 'resize-outline' as const, label: 'Height', value: user?.height ? `${user.height} cm` : '--' },
              { icon: 'scale-outline' as const, label: 'Weight', value: user?.weight ? `${user.weight} kg` : '--' },
              { icon: 'heart-outline' as const, label: 'Member Since', value: user?.joinDate ? new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '--' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.infoRow, idx > 0 && styles.infoRowBorder]}>
                <View style={styles.infoLeft}>
                  <Ionicons name={item.icon} size={18} color={COLORS.primary} />
                  <Text style={styles.infoLabel}>{item.label}</Text>
                </View>
                <Text style={styles.infoValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Membership */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membership</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><View style={styles.infoLeft}><Ionicons name="card-outline" size={18} color={COLORS.accent} /><Text style={styles.infoLabel}>Type</Text></View><Text style={styles.infoValue}>{user?.membershipType?.toUpperCase()}</Text></View>
            <View style={[styles.infoRow, styles.infoRowBorder]}><View style={styles.infoLeft}><Ionicons name="hourglass-outline" size={18} color={COLORS.warning} /><Text style={styles.infoLabel}>Remaining</Text></View><Text style={[styles.infoValue, { color: COLORS.success }]}>{user?.membershipDaysRemaining} days</Text></View>
            <View style={[styles.infoRow, styles.infoRowBorder]}><View style={styles.infoLeft}><Ionicons name="wallet-outline" size={18} color={COLORS.success} /><Text style={styles.infoLabel}>Total Spent</Text></View><Text style={styles.infoValue}>₱{(user?.totalSpent || 0).toLocaleString()}</Text></View>
          </View>
          
          <TouchableOpacity activeOpacity={0.8} style={styles.upgradeBtn} onPress={() => {
            navigation.navigate('UpgradeMembership' as never);
          }}>
            <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.upgradeGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
              <Ionicons name="star" size={20} color="#FFF" />
              <Text style={styles.upgradeText}>Upgrade Membership</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Attendance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Attendance</Text>
          <View style={styles.infoCard}>
            {attendance.slice(0, 4).map((att, idx) => (
              <View key={att.id} style={[styles.attendanceRow, idx > 0 && styles.infoRowBorder]}>
                <View style={styles.attDate}>
                  <Text style={styles.attDay}>{new Date(att.date).getDate()}</Text>
                  <Text style={styles.attMonth}>{new Date(att.date).toLocaleDateString('en-US', { month: 'short' })}</Text>
                </View>
                <View style={styles.attDetails}>
                  <View style={styles.attTimeRow}><Ionicons name="log-in-outline" size={14} color={COLORS.success} /><Text style={styles.attTimeText}>{att.checkIn}</Text></View>
                  <View style={styles.attTimeRow}><Ionicons name="log-out-outline" size={14} color={COLORS.danger} /><Text style={styles.attTimeText}>{att.checkOut}</Text></View>
                </View>
                <View style={styles.attDuration}><Text style={styles.attDurationText}>{att.duration}</Text></View>
              </View>
            ))}
            {attendance.length === 0 && <View style={styles.infoRow}><Text style={styles.infoLabel}>No attendance records yet</Text></View>}
          </View>
        </View>

        {/* Recent Payments */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Payments</Text>
          <View style={styles.infoCard}>
            {payments.slice(0, 3).map((payment, idx) => (
              <View key={payment.id} style={[styles.paymentRow, idx > 0 && styles.infoRowBorder]}>
                <View style={[styles.paymentIcon, { backgroundColor: COLORS.success + '18' }]}><Ionicons name="checkmark-circle" size={20} color={COLORS.success} /></View>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentType}>{payment.type}</Text>
                  <Text style={styles.paymentDate}>{new Date(payment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • {payment.method}</Text>
                </View>
                <Text style={styles.paymentAmount}>₱{payment.amount.toLocaleString()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Community & Social */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community</Text>
          <View style={styles.infoCard}>
            <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}
              onPress={() => navigation.navigate('CommunityFriends')}>
              <View style={styles.infoLeft}><Ionicons name="people" size={20} color={COLORS.accent} /><Text style={styles.settingsLabel}>My Friends</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ color: COLORS.textTertiary, fontSize: 12 }}>12 Online</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>
            <View style={styles.infoRowBorder} />
            <TouchableOpacity style={styles.settingsRow} activeOpacity={0.7}
              onPress={() => navigation.navigate('CommunityMessages')}>
              <View style={styles.infoLeft}><Ionicons name="chatbubbles" size={20} color={COLORS.primary} /><Text style={styles.settingsLabel}>Messages</Text></View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: COLORS.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 }}>
                  <Text style={{ color: '#FFF', fontSize: 10, fontWeight: 'bold' }}>3 New</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.infoCard}>
            {[
              { icon: 'notifications-outline' as const, label: 'Notifications', color: COLORS.primary, screen: 'Notifications' },
              { icon: 'shield-checkmark-outline' as const, label: 'Privacy & Security', color: COLORS.accent, screen: 'Settings' },
              { icon: 'help-circle-outline' as const, label: 'Help & Support', color: COLORS.success, screen: 'Settings' },
              { icon: 'information-circle-outline' as const, label: 'About', color: COLORS.warning, screen: 'Settings' },
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
            <Text style={styles.modalLabel}>Height (cm)</Text>
            <TextInput style={styles.modalInput} value={editHeight} onChangeText={setEditHeight} keyboardType="decimal-pad" placeholderTextColor={COLORS.textMuted} />
            <Text style={styles.modalLabel}>Weight (kg)</Text>
            <TextInput style={styles.modalInput} value={editWeight} onChangeText={setEditWeight} keyboardType="decimal-pad" placeholderTextColor={COLORS.textMuted} />
            <TouchableOpacity onPress={handleSaveProfile} activeOpacity={0.8}>
              <LinearGradient colors={[COLORS.primary, COLORS.primaryDark]} style={styles.modalButton}>
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
  scrollContent: { paddingBottom: 120 },
  profileHeader: { paddingTop: 56, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingXl },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXl },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  editButton: { width: 40, height: 40, borderRadius: SIZES.radiusMd, backgroundColor: COLORS.primary + '18', justifyContent: 'center', alignItems: 'center' },
  avatarSection: { alignItems: 'center' },
  avatarGradient: { width: 88, height: 88, borderRadius: 44, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingMd },
  avatarText: { fontSize: SIZES.hero, fontWeight: '800', color: '#FFF' },
  profileName: { fontSize: SIZES.xl, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  profileEmail: { fontSize: SIZES.md, color: COLORS.textSecondary, marginBottom: SIZES.spacingMd },
  memberTypeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.warning + '18', paddingHorizontal: 16, paddingVertical: 6, borderRadius: SIZES.radiusFull },
  memberTypeText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.warning },
  section: { paddingHorizontal: SIZES.spacingLg, marginTop: SIZES.spacingXl },
  sectionTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.spacingMd },
  idCard: { borderRadius: SIZES.radiusLg, padding: SIZES.spacingLg, borderWidth: 1, borderColor: COLORS.border, ...SHADOWS.medium },
  idCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SIZES.spacingXxl },
  idCardLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary, letterSpacing: 1, marginBottom: 4 },
  idCardNumber: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text, letterSpacing: 2 },
  idCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  idCardValue: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text },
  qrContainer: { padding: 4, backgroundColor: '#FFF', borderRadius: SIZES.radiusSm },
  qrCode: { width: 48, height: 48 },
  infoCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: SIZES.spacingBase },
  infoRowBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  infoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoLabel: { fontSize: SIZES.md, color: COLORS.textSecondary },
  infoValue: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text },
  upgradeBtn: { marginTop: SIZES.spacingMd, borderRadius: SIZES.radiusMd, overflow: 'hidden', ...SHADOWS.medium },
  upgradeGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14 },
  upgradeText: { fontSize: SIZES.sm, fontWeight: '700', color: '#FFF', textTransform: 'uppercase', letterSpacing: 0.5 },
  attendanceRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.spacingMd },
  attDate: { width: 40, alignItems: 'center', marginRight: SIZES.spacingMd },
  attDay: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  attMonth: { fontSize: SIZES.xs, color: COLORS.textTertiary, textTransform: 'uppercase' },
  attDetails: { flex: 1, gap: 4 },
  attTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  attTimeText: { fontSize: SIZES.sm, color: COLORS.textSecondary },
  attDuration: { backgroundColor: COLORS.primary + '15', paddingHorizontal: 10, paddingVertical: 4, borderRadius: SIZES.radiusFull },
  attDurationText: { fontSize: SIZES.xs, fontWeight: '600', color: COLORS.primary },
  paymentRow: { flexDirection: 'row', alignItems: 'center', padding: SIZES.spacingMd },
  paymentIcon: { width: 36, height: 36, borderRadius: SIZES.radiusSm, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd },
  paymentInfo: { flex: 1 },
  paymentType: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text },
  paymentDate: { fontSize: SIZES.xs, color: COLORS.textTertiary, marginTop: 2 },
  paymentAmount: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.success },
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
