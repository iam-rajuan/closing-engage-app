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
          <AppText weight="semibold" style={styles.fileName} numberOfLines={1} ellipsizeMode="middle" maxFontSizeMultiplier={1.1}>
            {doc.name}
          </AppText>
          <AppText variant="caption" muted style={styles.orderId} numberOfLines={1} maxFontSizeMultiplier={1.05}>
            Order #{doc.orderId}
          </AppText>
        </View>
        <Badge label={doc.status || 'Approved'} tone="green" style={styles.badge} />
      </View>

      <View style={styles.infoRow}>
        <View style={styles.infoItem}>
          <AppText variant="caption" muted style={styles.infoLabel} maxFontSizeMultiplier={1.05}>UPLOADED DATE</AppText>
          <AppText weight="semibold" style={styles.infoValue} numberOfLines={1} maxFontSizeMultiplier={1.05}>{doc.uploadedDate}</AppText>
        </View>
        <View style={styles.infoItem}>
          <AppText variant="caption" muted style={styles.infoLabel} maxFontSizeMultiplier={1.05}>FILE SIZE</AppText>
          <AppText weight="semibold" style={styles.infoValue} numberOfLines={1} maxFontSizeMultiplier={1.05}>{doc.size}</AppText>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton 
          title="Preview" 
          variant="secondary" 
          onPress={onView} 
          style={styles.viewBtn}
          textStyle={styles.viewBtnText}
          icon={<Eye color={colors.primary} size={16} />} 
        />
        <AppButton 
          title="Download" 
          style={styles.downloadBtn}
          textStyle={styles.downloadBtnText}
          icon={<Download color={colors.white} size={16} />} 
        />
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: 14,
    gap: 12,
    borderRadius: 14,
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
    alignItems: 'flex-start', 
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
    minWidth: 0,
    gap: 2,
  },
  badge: {
    flexShrink: 0,
    marginLeft: 6,
  },
  fileName: {
    fontSize: 14,
    lineHeight: 18,
    color: '#1e293b',
    letterSpacing: -0.2,
  },
  orderId: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  infoRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 18,
    paddingLeft: 2,
  },
  infoItem: {
    gap: 4,
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  actions: { 
    flexDirection: 'row', 
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#f3f6fb',
    borderWidth: 0,
    borderRadius: 10,
  },
  downloadBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#0a49a8',
    borderRadius: 10,
  },
  viewBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  downloadBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

