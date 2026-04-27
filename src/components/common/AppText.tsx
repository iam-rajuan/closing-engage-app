import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography } from '@/theme';

type Variant = 'title' | 'subtitle' | 'body' | 'caption' | 'label';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
  weight?: keyof typeof typography.weights;
};

export function AppText({ variant = 'body', muted, weight, style, ...props }: Props) {
  return (
    <Text
      style={[
        styles.base,
        styles[variant],
        muted && styles.muted,
        weight && { fontWeight: typography.weights[weight] },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    letterSpacing: 0,
  },
  title: {
    fontSize: typography.sizes.xxl,
    lineHeight: 32,
    fontWeight: typography.weights.bold,
  },
  subtitle: {
    fontSize: typography.sizes.xl,
    lineHeight: 26,
    fontWeight: typography.weights.bold,
  },
  body: {
    fontSize: typography.sizes.md,
    lineHeight: typography.lineHeights.normal,
  },
  caption: {
    fontSize: typography.sizes.sm,
    lineHeight: 18,
  },
  label: {
    fontSize: typography.sizes.xs,
    lineHeight: 16,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  muted: {
    color: colors.textMuted,
  },
});
