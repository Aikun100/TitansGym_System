import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  subtitle,
  accentColor = COLORS.primary,
  style,
}) => {
  return (
    <View style={[styles.card, style]}>
      <View style={[styles.iconContainer, { backgroundColor: accentColor + '20' }]}>
        {icon}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.spacingBase,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flex: 1,
    minWidth: 140,
    ...SHADOWS.small,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacingSm,
  },
  value: {
    fontSize: SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 2,
  },
  label: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  subtitle: {
    fontSize: SIZES.xs,
    color: COLORS.textTertiary,
    marginTop: 2,
  },
  accentBar: {
    position: 'absolute',
    bottom: 0,
    left: SIZES.spacingLg,
    right: SIZES.spacingLg,
    height: 3,
    borderRadius: 2,
    opacity: 0.6,
  },
});

export default StatCard;
