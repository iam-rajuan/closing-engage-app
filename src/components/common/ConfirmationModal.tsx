import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { LucideIcon, ShieldAlert } from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmTitle: string;
  cancelTitle?: string;
  iconColor?: string;
  Icon?: LucideIcon;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmationModal({
  visible,
  title,
  description,
  confirmTitle,
  cancelTitle = 'Cancel',
  iconColor = '#dc2626',
  Icon = ShieldAlert,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
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

          <View style={styles.buttonRow}>
            <AppButton
              title={cancelTitle}
              variant="secondary"
              onPress={onCancel}
              style={styles.button}
            />
            <AppButton
              title={confirmTitle}
              variant="danger"
              loading={loading}
              onPress={onConfirm}
              style={styles.button}
              textStyle={styles.confirmText}
            />
          </View>
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
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
  },
  confirmText: {
    color: '#b91c1c',
  },
});
