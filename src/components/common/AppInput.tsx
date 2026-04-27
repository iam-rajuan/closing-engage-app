import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

type Props = TextInputProps & {
  label?: string;
  error?: string;
};

export function AppInput({ label, error, style, ...props }: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <AppText variant="label" muted>{label}</AppText> : null}
      <TextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error && styles.errorInput, style]}
        {...props}
      />
      {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  input: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f8fbff',
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
  errorInput: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
  },
});
