import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface WorkoutCardProps {
  name: string;
  trainer: string;
  exerciseCount: number;
  status: string;
  isExecuted: boolean;
  date: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const WorkoutCard: React.FC<WorkoutCardProps> = ({
  name,
  trainer,
  exerciseCount,
  status,
  isExecuted,
  date,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBox}>
          <Ionicons
            name="barbell-outline"
            size={22}
            color={isExecuted ? COLORS.success : COLORS.primary}
          />
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{name}</Text>
          <Text style={styles.trainer}>by {trainer}</Text>
        </View>
        {isExecuted ? (
          <View style={styles.completedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
            <Text style={styles.completedText}>Done</Text>
          </View>
        ) : (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingText}>{status}</Text>
          </View>
        )}
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.metaItem}>
          <Ionicons name="fitness-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.metaText}>{exerciseCount} exercises</Text>
        </View>
        <View style={styles.metaItem}>
          <Ionicons name="calendar-outline" size={14} color={COLORS.textTertiary} />
          <Text style={styles.metaText}>{new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingBase,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOWS.small,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingMd,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.spacingMd,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  trainer: {
    fontSize: SIZES.sm,
    color: COLORS.textTertiary,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  completedText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.success,
  },
  pendingBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  pendingText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'capitalize',
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: SIZES.spacingSm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaText: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
  },
});

export default WorkoutCard;
