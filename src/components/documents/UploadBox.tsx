import { Pressable, StyleSheet } from 'react-native';
import { CloudUpload } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';
import { pickDocument } from '@/utils/fileUpload';

type Props = {
  title?: string;
  subtitle?: string;
  onFileSelect?: (file: { uri: string; name: string; size?: number; mimeType?: string } | null) => void;
};

export function UploadBox({
  title = 'Tap to upload files',
  subtitle = 'PDF, JPG, or PNG (Max 25MB)',
  onFileSelect,
}: Props) {
  const handlePress = async () => {
    const picked = await pickDocument();
    if (picked && onFileSelect) {
      onFileSelect({
        uri: picked.uri,
        name: picked.name,
        size: picked.size,
        mimeType: picked.mimeType,
      });
    }
  };

  return (
    <Pressable style={styles.box} onPress={handlePress}>
      <CloudUpload color={colors.primary} size={28} />
      <AppText weight="bold">{title}</AppText>
      <AppText variant="caption" muted>{subtitle}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    minHeight: 132,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#f8fbff',
  },
});
