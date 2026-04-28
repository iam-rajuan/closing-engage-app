import { PropsWithChildren } from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { colors, shadows } from '@/theme';

export function AppCard({ children, style, ...props }: PropsWithChildren<ViewProps>) {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderColor: '#e8edf2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    ...shadows.sm,
  },
});
