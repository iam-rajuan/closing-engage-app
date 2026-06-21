import React from 'react';
import { Modal, StyleSheet, View, Pressable } from 'react-native';
import { CheckCircle2, FileText, ExternalLink } from 'lucide-react-native';
import { colors, radius, spacing } from '@/theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';
import { openDownloadedFile } from '@/utils/fileDownload';
import { DocumentIcon } from './DocumentIcon';

type Props = {
  visible: boolean;
  fileName: string;
  localUri?: string;
  mimeType?: string;
  onClose: () => void;
};

export function DownloadSuccessModal({ visible, fileName, localUri, mimeType, onClose }: Props) {
  const handleOpen = async () => {
    if (!localUri) return;
    await openDownloadedFile(localUri, mimeType || 'application/octet-stream', fileName);
  };

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
            <View style={styles.iconBackground}>
              <View style={styles.iconInner}>
                <CheckCircle2 color={colors.success} size={36} strokeWidth={2.5} />
              </View>
            </View>
            <View style={styles.fileBadge}>
              <FileText color={colors.primary} size={14} />
            </View>
          </View>

          <AppText variant="subtitle" weight="bold" style={styles.title}>
            Download Complete
          </AppText>

          <AppText variant="body" muted style={styles.description}>
            The document has been successfully downloaded to your selected folder.
          </AppText>

          <View style={styles.fileCard}>
            <DocumentIcon fileName={fileName} size={40} iconSize={20} />
            <View style={styles.fileDetails}>
              <AppText
                weight="bold"
                numberOfLines={1}
                ellipsizeMode="middle"
                style={styles.fileName}
              >
                {fileName}
              </AppText>
              <AppText variant="caption" muted style={styles.fileMeta}>
                Ready to view • Local File
              </AppText>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            {localUri ? (
              <>
                <AppButton
                  title="Open Document"
                  icon={<ExternalLink color={colors.white} size={16} />}
                  onPress={handleOpen}
                  style={styles.primaryButton}
                />
                <AppButton
                  title="Dismiss"
                  variant="ghost"
                  onPress={onClose}
                  style={styles.ghostButton}
                />
              </>
            ) : (
              <AppButton
                title="Done"
                onPress={onClose}
                style={styles.singleButton}
              />
            )}
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
    position: 'relative',
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0fdf4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  iconInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.blueSoft,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
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
    marginBottom: spacing.lg,
  },
  fileCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  fileDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 18,
  },
  fileMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  ghostButton: {
    width: '100%',
    minHeight: 40,
    borderRadius: 12,
  },
  singleButton: {
    width: '100%',
    minHeight: 48,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
});

