import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

type Props = {
  label: string;
  tone?: 'blue' | 'green' | 'orange' | 'red' | 'gray';
  style?: StyleProp<ViewStyle>;
  size?: 'small' | 'medium';
};

export function Badge({ label, tone = 'blue', style, size = 'medium' }: Props) {
  const isSmall = size === 'small';
  return (
    <View style={[styles.badge, isSmall && styles.badgeSmall, styles[tone], style]}>
      <AppText
        variant={isSmall ? 'label' : 'caption'}
        weight="bold"
        style={[styles[`${tone}Text`], isSmall && styles.textSmall]}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  textSmall: {
    fontSize: 9,
    lineHeight: 12,
  },
  blue: { backgroundColor: colors.blueSoft },
  green: { backgroundColor: '#dcfce7' },
  orange: { backgroundColor: '#ffedd5' },
  red: { backgroundColor: '#fee2e2' },
  gray: { backgroundColor: colors.graySoft },
  blueText: { color: colors.primary },
  greenText: { color: colors.success },
  orangeText: { color: colors.warning },
  redText: { color: colors.danger },
  grayText: { color: colors.textMuted },
});

