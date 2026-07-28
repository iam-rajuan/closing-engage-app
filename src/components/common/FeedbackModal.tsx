import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import {
  AlertCircle,
  CheckCircle2,
  Info,
  LucideIcon,
} from 'lucide-react-native';
import { colors, spacing } from '@/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Variant = 'success' | 'error' | 'info';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  buttonTitle?: string;
  variant?: Variant;
  onClose: () => void;
};

const variantMap: Record<
  Variant,
  { iconColor: string; wash: string; line: string; Icon: LucideIcon; eyebrow: string }
> = {
  success: {
    iconColor: '#0f9f6e',
    wash: '#ecfdf5',
    line: '#b7f0d6',
    Icon: CheckCircle2,
    eyebrow: 'Update Complete',
  },
  error: {
    iconColor: '#dc2626',
    wash: '#fef2f2',
    line: '#fecaca',
    Icon: AlertCircle,
    eyebrow: 'Action Needed',
  },
  info: {
    iconColor: colors.primary,
    wash: '#eff6ff',
    line: '#bfdbfe',
    Icon: Info,
    eyebrow: 'Heads Up',
  },
};

export function FeedbackModal({
  visible,
  title,
  description,
  buttonTitle = 'Continue',
  variant = 'success',
  onClose,
}: Props) {
  const config = variantMap[variant];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <View style={[styles.topBand, { backgroundColor: config.wash }]} />

          <View style={styles.iconWrap}>
            <View style={[styles.iconShell, { borderColor: config.line, backgroundColor: config.wash }]}>
              <config.Icon color={config.iconColor} size={28} strokeWidth={2.4} />
            </View>
          </View>

          <View style={styles.copyWrap}>
            <AppText weight="bold" style={[styles.eyebrow, { color: config.iconColor }]}>
              {config.eyebrow}
            </AppText>
            <AppText variant="subtitle" weight="bold" style={styles.title}>
              {title}
            </AppText>
            <AppText variant="body" muted style={styles.description}>
              {description}
            </AppText>
          </View>

          <AppButton title={buttonTitle} onPress={onClose} style={styles.button} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.58)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 336,
    overflow: 'hidden',
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#020617',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.16,
    shadowRadius: 28,
    elevation: 16,
  },
  topBand: {
    height: 10,
    width: '100%',
  },
  iconWrap: {
    alignItems: 'center',
    marginTop: 22,
  },
  iconShell: {
    width: 64,
    height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  copyWrap: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 22,
    alignItems: 'center',
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  title: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 28,
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  button: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    minHeight: 50,
    borderRadius: 14,
  },
});
