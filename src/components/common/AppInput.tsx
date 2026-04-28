import { ReactNode } from 'react';
import { TextInput, TextInputProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
};

export function AppInput({ label, error, style, containerStyle, leftIcon, rightElement, ...props }: Props) {
  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? <AppText variant="label" muted>{label}</AppText> : null}
      <View style={[styles.inputShell, error && styles.errorInput]}>
        {leftIcon ? <View style={styles.sideElement}>{leftIcon}</View> : null}
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, style]}
          {...props}
        />
        {rightElement ? <View style={styles.sideElement}>{rightElement}</View> : null}
      </View>
      {error ? <AppText variant="caption" style={styles.error}>{error}</AppText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.xs,
  },
  inputShell: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f8fbff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: 48,
    color: colors.text,
  },
  sideElement: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorInput: {
    borderColor: colors.danger,
  },
  error: {
    color: colors.danger,
  },
});
