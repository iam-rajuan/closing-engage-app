import { StyleSheet, View } from 'react-native';
import { Download, Eye } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, spacing } from '@/theme';
import { DocumentFile } from '@/types/document';
import { DocumentIcon } from '@/components/common/DocumentIcon';

export function DocumentCard({ doc, onView }: { doc: DocumentFile; onView?: () => void }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.top}>
        <DocumentIcon fileName={doc.name} size={44} iconSize={20} />
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
          icon={<Eye color={colors.primary} size={16} />} 
        />
        <AppButton 
          title="Download" 
          style={styles.downloadBtn}
          icon={<Download color={colors.white} size={16} />} 
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: 16,
    gap: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e8eef8',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  top: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameContainer: { 
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 15,
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
    gap: 32,
    paddingLeft: 2,
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
    gap: 12,
  },
  viewBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#f3f6fb',
    borderWidth: 0,
    borderRadius: 12,
  },
  downloadBtn: {
    flex: 1,
    height: 42,
    backgroundColor: '#0a49a8',
    borderRadius: 12,
  },
});

