import { StyleSheet, View } from 'react-native';
import { Download, Eye, FileText } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, spacing } from '@/theme';
import { DocumentFile } from '@/types/document';

export function DocumentCard({ doc, onView }: { doc: DocumentFile; onView?: () => void }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.top}>
        <FileText color={colors.danger} size={22} />
        <View style={styles.name}>
          <AppText weight="bold">{doc.name}</AppText>
          <AppText variant="caption" muted>{doc.orderId}</AppText>
        </View>
        <Badge label={doc.status} tone="green" />
      </View>
      <View style={styles.info}>
        <View><AppText variant="caption" muted>Uploaded Date</AppText><AppText weight="semibold">{doc.uploadedDate}</AppText></View>
        <View><AppText variant="caption" muted>File Size</AppText><AppText weight="semibold">{doc.size}</AppText></View>
      </View>
      <View style={styles.actions}>
        <AppButton title="View" variant="secondary" onPress={onView} icon={<Eye color={colors.primary} size={16} />} />
        <AppButton title="Download" icon={<Download color={colors.white} size={16} />} />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  top: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  name: { flex: 1 },
  info: { flexDirection: 'row', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: spacing.md },
});
