import React from 'react';
import { Modal, Pressable, StyleSheet, View, ActivityIndicator } from 'react-native';
import { LucideIcon, ShieldAlert } from 'lucide-react-native';
import { AppText } from './AppText';

export type ConfirmationModalVariant = 'danger' | 'warning' | 'primary' | 'success';

type Props = {
  visible: boolean;
  title: string;
  description: string;
  confirmTitle: string;
  cancelTitle?: string;
  variant?: ConfirmationModalVariant;
  iconColor?: string;
  Icon?: LucideIcon;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

const VARIANT_CONFIGS: Record<ConfirmationModalVariant, { iconColor: string; bgRing: string; innerRing: string; confirmBg: string; confirmText: string }> = {
  danger: {
    iconColor: '#ef4444',
    bgRing: '#fef2f2',
    innerRing: '#fee2e2',
    confirmBg: '#dc2626',
    confirmText: '#ffffff',
  },
  warning: {
    iconColor: '#f59e0b',
    bgRing: '#fffbeb',
    innerRing: '#fef3c7',
    confirmBg: '#d97706',
    confirmText: '#ffffff',
  },
  primary: {
    iconColor: '#0a49a8',
    bgRing: '#eff6ff',
    innerRing: '#dbeafe',
    confirmBg: '#0a49a8',
    confirmText: '#ffffff',
  },
  success: {
    iconColor: '#10b981',
    bgRing: '#f0fdf4',
    innerRing: '#dcfce7',
    confirmBg: '#059669',
    confirmText: '#ffffff',
  },
};

export function ConfirmationModal({
  visible,
  title,
  description,
  confirmTitle,
  cancelTitle = 'Cancel',
  variant = 'danger',
  iconColor: customIconColor,
  Icon = ShieldAlert,
  loading = false,
  onCancel,
  onConfirm,
}: Props) {
  const config = VARIANT_CONFIGS[variant] || VARIANT_CONFIGS.danger;
  const iconColor = customIconColor || config.iconColor;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.dialog} onPress={(event) => event.stopPropagation()}>
          <View style={styles.iconWrapper}>
            <View style={[styles.outerRing, { backgroundColor: config.bgRing, borderColor: `${iconColor}30` }]}>
              <View style={[styles.innerRing, { backgroundColor: config.innerRing }]}>
                <Icon color={iconColor} size={30} strokeWidth={2.2} />
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
            <Pressable style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <AppText weight="semibold" style={styles.cancelBtnText}>
                {cancelTitle}
              </AppText>
            </Pressable>

            <Pressable
              style={[styles.confirmBtn, { backgroundColor: config.confirmBg }, loading && styles.disabledBtn]}
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={config.confirmText} size="small" />
              ) : (
                <AppText weight="bold" style={[styles.confirmBtnText, { color: config.confirmText }]}>
                  {confirmTitle}
                </AppText>
              )}
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  iconWrapper: {
    marginBottom: 16,
  },
  outerRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  innerRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 4,
    marginBottom: 24,
  },
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  confirmBtnText: {
    fontSize: 14,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
