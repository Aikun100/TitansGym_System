import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface BookingCardProps {
  trainerName: string;
  memberName?: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  trainerAvatar?: string;
  showMember?: boolean;
  onPress?: () => void;
  onAddCalendar?: () => void;
  onReschedule?: () => void;
  style?: ViewStyle;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  trainerName,
  memberName,
  date,
  time,
  duration,
  type,
  status,
  trainerAvatar,
  showMember = false,
  onPress,
  onAddCalendar,
  onReschedule,
  style,
}) => {
  const statusConfig = {
    confirmed: { color: COLORS.success, icon: 'checkmark-circle' as const, label: 'Confirmed' },
    pending: { color: COLORS.warning, icon: 'time' as const, label: 'Pending' },
    cancelled: { color: COLORS.danger, icon: 'close-circle' as const, label: 'Cancelled' },
    completed: { color: COLORS.accent, icon: 'checkmark-done-circle' as const, label: 'Completed' },
  };

  const config = statusConfig[status];

  // Format date to show day of week  
  const dateObj = new Date(date);
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
  const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  // Placeholder avatar if none provided (using a generic fitness image)
  const avatarUrl = trainerAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(showMember ? (memberName || 'M') : trainerName)}&background=2C3E50&color=fff`;

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Date badge */}
      <View style={styles.dateBadge}>
        <Text style={styles.dayName}>{dayName}</Text>
        <Text style={styles.dateNumber}>{dateObj.getDate()}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: config.color + '20' }]}>
            <Ionicons name={config.icon} size={12} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.personRow}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          <Text style={styles.personName}>
            {showMember ? memberName : trainerName}
          </Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.detailText}>{time}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="hourglass-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.detailText}>{duration} min</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="calendar-outline" size={14} color={COLORS.textTertiary} />
            <Text style={styles.detailText}>{monthDay}</Text>
          </View>
        </View>

        {status === 'confirmed' && (
          <View style={styles.actionRow}>
            {onAddCalendar && (
              <TouchableOpacity style={styles.actionBtn} onPress={onAddCalendar}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                <Text style={styles.actionBtnText}>Add to Calendar</Text>
              </TouchableOpacity>
            )}
            {onReschedule && (
              <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={onReschedule}>
                <Ionicons name="refresh-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.actionBtnTextOutline}>Reschedule</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 16,
    ...SHADOWS.small,
  },
  dateBadge: {
    width: 56,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SIZES.spacingMd,
  },
  dayName: {
    fontSize: SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: SIZES.xl,
    color: COLORS.primary,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    padding: SIZES.spacingMd,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  type: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: SIZES.radiusFull,
    gap: 3,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  personName: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  details: {
    flexDirection: 'row',
    gap: 14,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    backgroundColor: COLORS.primary + '15',
    borderRadius: SIZES.radiusSm,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnText: {
    fontSize: SIZES.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },
  actionBtnTextOutline: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
});

export default BookingCard;
