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
        <View style={styles.iconContainer}>
          <FileText color={colors.danger} size={24} />
        </View>
        <View style={styles.nameContainer}>
          <AppText weight="bold" style={styles.fileName}>{doc.name}</AppText>
          <AppText variant="caption" muted style={styles.orderId}>{doc.orderId}</AppText>
        </View>
        <Badge label={doc.status || 'Approved'} tone="green" />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <AppText variant="caption" muted style={styles.infoLabel}>UPLOADED DATE</AppText>
          <AppText weight="bold" style={styles.infoValue}>{doc.uploadedDate}</AppText>
        </View>
        <View style={styles.infoItem}>
          <AppText variant="caption" muted style={styles.infoLabel}>FILE SIZE</AppText>
          <AppText weight="bold" style={styles.infoValue}>{doc.size}</AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton 
          title="View" 
          variant="secondary" 
          onPress={onView} 
          style={styles.viewBtn}
          icon={<Eye color={colors.primary} size={18} />} 
        />
        <AppButton 
          title="Download" 
          style={styles.downloadBtn}
          icon={<Download color={colors.white} size={18} />} 
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: spacing.md,
    gap: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  top: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 14 
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#fef2f2', // Soft red for PDF
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: { 
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 16,
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  orderId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94a3b8',
  },
  infoRow: { 
    flexDirection: 'row', 
    gap: 40,
    paddingLeft: 4,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: '#334155',
  },
  actions: { 
    flexDirection: 'row', 
    gap: spacing.md 
  },
  viewBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderWidth: 0,
  },
  downloadBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#0a49a8',
  },
});

