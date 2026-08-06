import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const GREEN = '#22C55E';

export default function CashierProfile({ navigation }: any) {
  const { user, logout } = useApp();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const menuItems = [
    { icon: 'settings-outline', label: 'Settings', color: COLORS.textSecondary, onPress: () => navigation.navigate('Settings') },
    { icon: 'help-circle-outline', label: 'Help & Support', color: COLORS.textSecondary, onPress: () => Alert.alert('Support', 'Contact admin for help.') },
    { icon: 'information-circle-outline', label: 'About', color: COLORS.textSecondary, onPress: () => Alert.alert('Titans Gym', 'Cashier POS v1.0.0') },
  ];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={s.header}>
        <Text style={s.headerTitle}>Profile</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Card */}
        <LinearGradient colors={[GREEN, '#16A34A']} style={s.avatarCard}>
          <View style={s.avatar}>
            <Ionicons name="person" size={36} color={GREEN} />
          </View>
          <Text style={s.name}>{user?.name || 'Cashier'}</Text>
          <Text style={s.email}>{user?.email || ''}</Text>
          <View style={s.rolePill}>
            <Ionicons name="cash" size={14} color="#FFF" />
            <Text style={s.roleText}>Cashier</Text>
          </View>
        </LinearGradient>

        {/* Info Cards */}
        <View style={s.infoRow}>
          <View style={s.infoCard}>
            <Ionicons name="call" size={20} color={COLORS.accent} />
            <Text style={s.infoLabel}>Phone</Text>
            <Text style={s.infoValue}>{user?.phone || 'N/A'}</Text>
          </View>
          <View style={s.infoCard}>
            <Ionicons name="calendar" size={20} color={COLORS.primary} />
            <Text style={s.infoLabel}>Joined</Text>
            <Text style={s.infoValue}>{user?.joinDate || 'N/A'}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={s.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={idx} style={[s.menuItem, idx > 0 && s.menuBorder]} onPress={item.onPress} activeOpacity={0.7}>
              <View style={[s.menuIcon, { backgroundColor: item.color + '15' }]}>
                <Ionicons name={item.icon as any} size={20} color={item.color} />
              </View>
              <Text style={s.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={COLORS.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
          <Text style={s.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { paddingTop: 52, paddingHorizontal: 20, paddingBottom: 12 },
  headerTitle: { fontSize: SIZES.xxl, fontWeight: '800', color: COLORS.text },
  content: { paddingHorizontal: 20 },

  avatarCard: { borderRadius: SIZES.radiusLg, padding: 28, alignItems: 'center', marginBottom: 20, ...SHADOWS.medium },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  name: { fontSize: SIZES.xl, fontWeight: '800', color: '#FFF' },
  email: { fontSize: SIZES.sm, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  rolePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginTop: 12 },
  roleText: { fontSize: SIZES.sm, fontWeight: '700', color: '#FFF' },

  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  infoCard: { flex: 1, backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, gap: 8 },
  infoLabel: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  infoValue: { fontSize: SIZES.sm, fontWeight: '700', color: COLORS.text },

  menuCard: { backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusLg, borderWidth: 1, borderColor: COLORS.cardBorder, overflow: 'hidden', marginBottom: 20 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  menuBorder: { borderTopWidth: 1, borderTopColor: COLORS.border },
  menuIcon: { width: 38, height: 38, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: SIZES.md, fontWeight: '600', color: COLORS.text },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: SIZES.radiusMd, borderWidth: 1, borderColor: COLORS.danger + '30', backgroundColor: COLORS.dangerBg },
  logoutText: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.danger },
});
