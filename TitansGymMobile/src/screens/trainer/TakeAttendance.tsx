import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

export default function TakeAttendance({ navigation }: any) {
  const { clients } = useApp();
  const [checkedIn, setCheckedIn] = useState<Record<number, { time: string; status: 'in' | 'out' }>>({});

  const now = new Date();
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleCheckIn = (clientId: number, clientName: string) => {
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    if (checkedIn[clientId]?.status === 'in') {
      Alert.alert('Check Out', `Check out ${clientName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check Out', onPress: () => {
          setCheckedIn(prev => ({ ...prev, [clientId]: { time, status: 'out' } }));
          Alert.alert('Checked Out ✅', `${clientName} checked out at ${time}`);
        }},
      ]);
    } else if (checkedIn[clientId]?.status === 'out') {
      Alert.alert('Already Checked Out', `${clientName} has already completed their session today.`);
    } else {
      Alert.alert('Check In', `Check in ${clientName}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Check In', onPress: () => {
          setCheckedIn(prev => ({ ...prev, [clientId]: { time, status: 'in' } }));
          Alert.alert('Checked In! 🏋️', `${clientName} checked in at ${time}`);
        }},
      ]);
    }
  };

  const presentCount = Object.values(checkedIn).filter(v => v.status === 'in').length;
  const completedCount = Object.values(checkedIn).filter(v => v.status === 'out').length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Attendance</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Today Card */}
        <LinearGradient colors={['#7C3AED', '#5B21B6']} style={styles.todayCard}>
          <View style={styles.todayTop}>
            <Ionicons name="calendar" size={24} color="#FFF" />
            <Text style={styles.todayDate}>{todayStr}</Text>
          </View>
          <View style={styles.todayStats}>
            <View style={styles.todayStat}><Text style={styles.todayStatValue}>{presentCount}</Text><Text style={styles.todayStatLabel}>Present</Text></View>
            <View style={styles.todayDivider} />
            <View style={styles.todayStat}><Text style={styles.todayStatValue}>{completedCount}</Text><Text style={styles.todayStatLabel}>Completed</Text></View>
            <View style={styles.todayDivider} />
            <View style={styles.todayStat}><Text style={styles.todayStatValue}>{clients.length - presentCount - completedCount}</Text><Text style={styles.todayStatLabel}>Absent</Text></View>
          </View>
        </LinearGradient>

        {/* Client List */}
        <Text style={styles.sectionTitle}>Client Roster</Text>
        {clients.map(client => {
          const status = checkedIn[client.id];
          const initials = client.name.split(' ').map(n => n[0]).join('');
          let statusColor = COLORS.textTertiary;
          let statusText = 'Not Present';
          let statusIcon: keyof typeof Ionicons.glyphMap = 'radio-button-off-outline';
          if (status?.status === 'in') { statusColor = COLORS.success; statusText = `In (${status.time})`; statusIcon = 'checkmark-circle'; }
          if (status?.status === 'out') { statusColor = COLORS.accent; statusText = `Done (${status.time})`; statusIcon = 'checkmark-done-circle'; }

          return (
            <TouchableOpacity key={client.id} style={styles.clientRow} activeOpacity={0.7}
              onPress={() => handleCheckIn(client.id, client.name)}>
              <View style={styles.clientAvatar}><Text style={styles.clientInitials}>{initials}</Text></View>
              <View style={styles.clientInfo}>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientMembership}>{client.membershipType}</Text>
              </View>
              <View style={styles.statusSection}>
                <Ionicons name={statusIcon} size={22} color={statusColor} />
                <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Mark All */}
        <TouchableOpacity style={styles.markAllBtn} activeOpacity={0.7}
          onPress={() => {
            const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            Alert.alert('Check In All', 'Check in all clients?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Check In All', onPress: () => {
                const all: typeof checkedIn = {};
                clients.forEach(c => { all[c.id] = { time, status: 'in' }; });
                setCheckedIn(all);
                Alert.alert('Done!', 'All clients checked in.');
              }},
            ]);
          }}>
          <Ionicons name="people" size={20} color={COLORS.trainerAccent} />
          <Text style={styles.markAllText}>Check In All Clients</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  backBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingMd },
  todayCard: { borderRadius: SIZES.radiusXl, padding: SIZES.spacingXl, marginBottom: SIZES.spacingXl, overflow: 'hidden' },
  todayTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: SIZES.spacingLg },
  todayDate: { fontSize: SIZES.md, fontWeight: '600', color: '#FFF' },
  todayStats: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: SIZES.spacingBase, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.15)' },
  todayStat: { alignItems: 'center' },
  todayStatValue: { fontSize: SIZES.xxl, fontWeight: '800', color: '#FFF' },
  todayStatLabel: { fontSize: SIZES.xs, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  todayDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  sectionTitle: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.text, marginBottom: SIZES.spacingMd },
  clientRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingBase, marginBottom: SIZES.spacingMd, borderWidth: 1, borderColor: COLORS.cardBorder },
  clientAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.trainerAccent + '20', justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd },
  clientInitials: { fontSize: SIZES.md, fontWeight: '700', color: COLORS.trainerAccent },
  clientInfo: { flex: 1 },
  clientName: { fontSize: SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: 2 },
  clientMembership: { fontSize: SIZES.xs, color: COLORS.textTertiary },
  statusSection: { alignItems: 'center', gap: 4 },
  statusText: { fontSize: 9, fontWeight: '600' },
  markAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: SIZES.spacingBase, borderRadius: SIZES.radiusMd, borderWidth: 1, borderStyle: 'dashed', borderColor: COLORS.trainerAccent + '40', marginTop: SIZES.spacingMd },
  markAllText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.trainerAccent },
});
