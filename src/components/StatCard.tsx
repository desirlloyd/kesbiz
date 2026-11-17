import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Shadows } from '../constants/theme';

interface StatCardProps {
  title: string;
  amount: string;
  subtitle?: string;
  icon?: any;
  variant?: 'default' | 'green' | 'terracotta' | 'forest';
  hero?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  amount,
  subtitle,
  variant = 'default',
  hero = false,
}) => {
  const getAmountColor = () => {
    switch (variant) {
      case 'green':
        return Colors.merchant.green;
      case 'terracotta':
        return Colors.merchant.terracotta;
      case 'forest':
        return Colors.merchant.forest;
      default:
        return Colors.merchant.ink;
    }
  };

  const getBorderColor = () => {
    if (hero) return Colors.merchant.forest;
    switch (variant) {
      case 'green':
        return 'rgba(22, 163, 106, 0.4)';
      case 'terracotta':
        return 'rgba(198, 106, 69, 0.4)';
      case 'forest':
        return 'rgba(23, 75, 58, 0.4)';
      default:
        return Colors.merchant.border;
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: getBorderColor(),
          borderWidth: hero ? 2 : 1,
        },
      ]}
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={`${title}, ${amount}${subtitle ? `, ${subtitle}` : ''}`}
    >
      <View style={styles.topRow}>
        <View style={styles.titleWrapper}>
          {hero && <View style={styles.heroDot} />}
          <Text style={styles.title} numberOfLines={1}>
            {title.toUpperCase()}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.amount,
          { color: getAmountColor() },
          hero && styles.heroAmount,
        ]}
        numberOfLines={1}
      >
        {amount}
      </Text>

      {subtitle && (
        <Text style={styles.subtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.merchant.paper,
    borderRadius: 12,
    borderWidth: 1,
    padding: 13,
    marginBottom: 8,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.merchant.borderLight,
  },
  titleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  heroDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.merchant.green,
  },
  title: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.merchant.inkMuted,
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: 0.6,
  },
  amount: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: Typography.fontFamily.mono,
    letterSpacing: -0.3,
  },
  heroAmount: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.merchant.warmGray,
    marginTop: 4,
  },
});
