import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
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
  showMember?: boolean;
  onPress?: () => void;
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
  showMember = false,
  onPress,
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
        
        <Text style={styles.personName}>
          {showMember ? memberName : trainerName}
        </Text>

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
});

export default BookingCard;
