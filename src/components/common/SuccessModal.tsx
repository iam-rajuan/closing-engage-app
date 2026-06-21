import React from 'react';
import { Modal, StyleSheet, View, Pressable } from 'react-native';
import { CheckCircle2, LucideIcon } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  buttonTitle?: string;
  iconColor?: string;
  Icon?: LucideIcon;
  onClose: () => void;
};

export function SuccessModal({
  visible,
  title,
  description,
  buttonTitle = 'Done',
  iconColor = colors.success,
  Icon = CheckCircle2,
  onClose,
}: Props) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconBackground, { borderColor: `${iconColor}33`, backgroundColor: `${iconColor}10` }]}>
              <View style={[styles.iconInner, { backgroundColor: `${iconColor}22` }]}>
                <Icon color={iconColor} size={36} strokeWidth={2.5} />
              </View>
            </View>
          </View>

          <AppText variant="subtitle" weight="bold" style={styles.title}>
            {title}
          </AppText>

          <AppText variant="body" muted style={styles.description}>
            {description}
          </AppText>

          <AppButton
            title={buttonTitle}
            onPress={onClose}
            style={styles.button}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl || 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    backgroundColor: colors.surface,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 19,
    lineHeight: 26,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
});
