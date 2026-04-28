import { Image, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  Calendar,
  Download,
  FileText,
  Info,
  MapPin,
  Star,
  UserPlus,
} from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { orderTimeline } from '@/constants/mockData';
import { colors, spacing } from '@/theme';

function DetailField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.detailField}>
      <AppText variant="caption" muted style={styles.detailLabel}>{label}</AppText>
      <View style={styles.detailValueRow}>
        {icon && <View style={styles.detailIcon}>{icon}</View>}
        <AppText weight="bold" style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  );
}

export function CompanyOrderDetailsScreen() {
  return (
    <ScreenContainer scroll>
      <AppHeader back title="Order Details" onProfilePress={() => router.push('/company/settings')} />
      
      <AppCard style={styles.detailsMainCard}>
        <View style={styles.detailsHeader}>
          <AppText style={styles.detailsOrderNum}>Order #CE-9421</AppText>
          <Badge label="APPROVED" tone="green" />
        </View>
        
        <DetailField label="CLIENT" value="Mila Waters" />
        <DetailField 
          label="SIGNING DATE & TIME" 
          value="Mar 18, 2026, 2:45 PM" 
          icon={<Calendar color={colors.primary} size={14} />} 
        />
        <DetailField 
          label="PROPERTY ADDRESS" 
          value="442 Prospect St, Dallas TX 75201" 
          icon={<MapPin color={colors.primary} size={14} />} 
        />
      </AppCard>

      <View style={styles.specialInstructionBox}>
        <Info color={colors.primary} size={18} />
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={{ color: colors.primary }}>Special Instructions</AppText>
          <AppText style={styles.instructionText}>
            Client requested a bilingual notary if possible. Please ensure all documents are signed with blue ink as per lender requirements. Park in the visitor section near building B.
          </AppText>
        </View>
      </View>

      <AppCard style={styles.engagementCard}>
        <View style={styles.engagementIconBox}>
          <Calendar color={colors.primary} size={24} />
        </View>
        <View>
          <AppText variant="caption" muted style={styles.engagementSub}>Closing Engagement</AppText>
          <AppText weight="bold" style={styles.engagementTitle}>Tuesday, Apr 24 • 02:00 PM</AppText>
        </View>
      </AppCard>

      <View style={styles.detailsSection}>
        <AppText weight="bold" style={styles.detailsSectionTitle}>Assigned Notary</AppText>
        <AppCard style={styles.notaryProfileCard}>
          <View style={styles.notaryInfoLarge}>
            <View style={styles.notaryAvatarBox}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop' }} 
                style={styles.notaryAvatarLg} 
              />
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={styles.notaryNameLg}>Sarah Jenkins</AppText>
              <View style={styles.ratingRow}>
                <Star color="#eab308" fill="#eab308" size={14} />
                <AppText style={styles.ratingText}>4.9</AppText>
                <Badge label="Available" tone="green" />
              </View>
            </View>
          </View>
          <Pressable style={styles.viewProfileBtn}>
            <AppText weight="bold" style={styles.viewProfileText}>View Full Profile</AppText>
          </Pressable>
        </AppCard>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.sectionHeaderWithCount}>
          <AppText weight="bold" style={styles.detailsSectionTitle}>Documents</AppText>
          <AppText variant="caption" muted weight="bold">1 File</AppText>
        </View>
        <AppCard style={styles.fileCardDetails}>
          <View style={styles.fileIconBox}><FileText color="#dc2626" size={20} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold">closing_statement.pdf</AppText>
            <AppText variant="caption" muted>2.4 MB</AppText>
          </View>
          <Pressable style={styles.downloadBtn}><Download color="#64748b" size={18} /></Pressable>
        </AppCard>
      </View>

      <View style={styles.detailsSection}>
        <AppText weight="bold" style={styles.detailsSectionTitle}>Order Status</AppText>
        <AppCard style={styles.statusCard}>
          <OrderStatusTimeline steps={orderTimeline} />
        </AppCard>
      </View>

      <View style={styles.detailsSection}>
        <AppText weight="bold" style={styles.detailsSectionTitle}>Activity Log</AppText>
        <AppCard style={styles.logCard}>
          <View style={styles.logItem}>
            <View style={styles.logIconBox}><FileText color={colors.primary} size={16} /></View>
            <View style={{ flex: 1 }}>
              <View style={styles.logHeader}>
                <AppText weight="bold">Documents Verified</AppText>
                <AppText variant="caption" muted>1h ago</AppText>
              </View>
              <AppText variant="caption" muted>System automatically verified the uploaded PDF for integrity and signature fields.</AppText>
            </View>
          </View>
          <View style={styles.logDivider} />
          <View style={styles.logItem}>
            <View style={styles.logIconBox}><UserPlus color={colors.primary} size={16} /></View>
            <View style={{ flex: 1 }}>
              <View style={styles.logHeader}>
                <AppText weight="bold">Notary Re-assigned</AppText>
                <AppText variant="caption" muted>3h ago</AppText>
              </View>
              <AppText variant="caption" muted>Sarah Jenkins accepted the updated order time for the Prospect St location.</AppText>
            </View>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  detailsMainCard: { padding: spacing.md, gap: spacing.md },
  detailsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  detailsOrderNum: { fontSize: 22, fontWeight: '800', color: '#0a49a8' },
  detailField: { gap: 4 },
  detailLabel: { fontSize: 10, fontWeight: '700', color: '#64748b', letterSpacing: 0.5 },
  detailValueRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailIcon: { width: 20, alignItems: 'center' },
  detailValue: { fontSize: 16, color: '#1e293b' },
  specialInstructionBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  instructionText: { fontSize: 13, color: '#1e3a8a', marginTop: 4, lineHeight: 18 },
  engagementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#f8fbff',
  },
  engagementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  engagementSub: { fontSize: 12, fontWeight: '600' },
  engagementTitle: { fontSize: 15, color: '#1e293b' },
  detailsSection: { paddingHorizontal: spacing.md, marginTop: spacing.lg },
  detailsSectionTitle: { fontSize: 16, color: '#1e293b', marginBottom: 12 },
  notaryProfileCard: { padding: spacing.md },
  notaryInfoLarge: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  notaryAvatarBox: { position: 'relative' },
  notaryAvatarLg: { width: 56, height: 56, borderRadius: 10 },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  notaryNameLg: { fontSize: 16, color: '#1e293b' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#eab308' },
  viewProfileBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: { fontSize: 13, color: '#0a49a8' },
  sectionHeaderWithCount: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  fileCardDetails: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  fileIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  downloadBtn: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  statusCard: { padding: spacing.md },
  logCard: { padding: spacing.md },
  logItem: { flexDirection: 'row', gap: 12 },
  logIconBox: { width: 32, height: 32, borderRadius: 6, backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' },
  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  logDivider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 14 },
});
