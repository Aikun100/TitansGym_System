import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity,
  Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../../constants/theme';
import { useApp } from '../../context/AppContext';

const iconMap: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  booking: { icon: 'calendar', color: COLORS.primary },
  workout: { icon: 'barbell', color: COLORS.accent },
  payment: { icon: 'card', color: COLORS.success },
  membership: { icon: 'shield-checkmark', color: COLORS.warning },
  progress: { icon: 'trending-up', color: '#A855F7' },
  system: { icon: 'notifications', color: COLORS.textSecondary },
};

export default function NotificationsScreen({ navigation }: any) {
  const { notifications, markAllNotificationsRead, markNotificationRead, unreadCount } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filtered = filter === 'unread' ? notifications.filter((n: any) => !n.read) : notifications;

  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity style={styles.markAllBtn} onPress={() => {
            markAllNotificationsRead();
            Alert.alert('Done ✅', 'All notifications marked as read.');
          }}>
            <Text style={styles.markAllText}>Read All</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={[styles.filterChip, filter === 'all' && styles.filterActive]}
          onPress={() => setFilter('all')}>
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>All ({notifications.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, filter === 'unread' && styles.filterActive]}
          onPress={() => setFilter('unread')}>
          <Ionicons name="ellipse" size={8} color={filter === 'unread' ? COLORS.primary : COLORS.textTertiary} />
          <Text style={[styles.filterText, filter === 'unread' && styles.filterTextActive]}>Unread ({unreadCount})</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />}>

        {filtered.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={48} color={COLORS.textTertiary} />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'All caught up!' : 'No notifications yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {filter === 'unread' ? "You've read all your notifications" : 'Your notifications will appear here'}
            </Text>
          </View>
        )}

        {filtered.map((notif: any, idx: number) => {
          const typeInfo = iconMap[notif.type] || iconMap.system;
          return (
            <TouchableOpacity key={notif.id || idx} style={[styles.notifCard, !notif.read && styles.notifUnread]}
              activeOpacity={0.7} onPress={() => {
                if (!notif.read && markNotificationRead) markNotificationRead(notif.id);
                Alert.alert(notif.title || 'Notification', notif.message || notif.body || '');
              }}>
              <View style={[styles.notifIcon, { backgroundColor: typeInfo.color + '18' }]}>
                <Ionicons name={typeInfo.icon} size={22} color={typeInfo.color} />
              </View>
              <View style={styles.notifContent}>
                <View style={styles.notifTop}>
                  <Text style={[styles.notifTitle, !notif.read && styles.notifTitleUnread]} numberOfLines={1}>
                    {notif.title || 'Notification'}
                  </Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMessage} numberOfLines={2}>
                  {notif.message || notif.body || ''}
                </Text>
                <Text style={styles.notifTime}>
                  {notif.created_at ? getTimeAgo(notif.created_at) : notif.time || ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: SIZES.spacingLg, paddingBottom: SIZES.spacingMd },
  backBtn: { width: 36, height: 36, borderRadius: SIZES.radiusSm, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: SIZES.xl, fontWeight: '800', color: COLORS.text },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.primary + '18' },
  markAllText: { fontSize: SIZES.sm, fontWeight: '600', color: COLORS.primary },
  filterRow: { flexDirection: 'row', paddingHorizontal: SIZES.spacingLg, gap: SIZES.spacingSm, marginBottom: SIZES.spacingSm },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: SIZES.radiusFull, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  filterActive: { backgroundColor: COLORS.primary + '15', borderColor: COLORS.primary },
  filterText: { fontSize: SIZES.sm, color: COLORS.textTertiary, fontWeight: '500' },
  filterTextActive: { color: COLORS.primary, fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: SIZES.spacingLg, paddingTop: SIZES.spacingSm },
  emptyState: { alignItems: 'center', paddingTop: 80 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.surface, justifyContent: 'center', alignItems: 'center', marginBottom: SIZES.spacingLg },
  emptyTitle: { fontSize: SIZES.lg, fontWeight: '700', color: COLORS.text },
  emptySubtitle: { fontSize: SIZES.md, color: COLORS.textTertiary, marginTop: 4 },
  notifCard: { flexDirection: 'row', backgroundColor: COLORS.cardBg, borderRadius: SIZES.radiusMd, padding: SIZES.spacingBase, marginBottom: SIZES.spacingSm, borderWidth: 1, borderColor: COLORS.cardBorder },
  notifUnread: { backgroundColor: COLORS.primary + '08', borderColor: COLORS.primary + '30' },
  notifIcon: { width: 44, height: 44, borderRadius: SIZES.radiusMd, justifyContent: 'center', alignItems: 'center', marginRight: SIZES.spacingMd },
  notifContent: { flex: 1 },
  notifTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  notifTitle: { fontSize: SIZES.md, fontWeight: '500', color: COLORS.text, flex: 1 },
  notifTitleUnread: { fontWeight: '700' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginLeft: 8 },
  notifMessage: { fontSize: SIZES.sm, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: SIZES.xs, color: COLORS.textMuted },
});
