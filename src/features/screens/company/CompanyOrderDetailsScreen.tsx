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
  detailsMainCard: { 
    marginTop: 16,
    padding: 16, 
    gap: 12 
  },
  detailsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  detailsOrderNum: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: '#0a49a8',
    lineHeight: 24,
  },
  detailField: { gap: 6 },
  detailLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#64748b', 
    letterSpacing: 0.5 
  },
  detailValueRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10 
  },
  detailIcon: { width: 24, alignItems: 'center' },
  detailValue: { 
    fontSize: 14, 
    color: '#1e293b',
    lineHeight: 20,
    flex: 1,
  },
  specialInstructionBox: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  instructionText: { 
    fontSize: 14, 
    color: '#1e3a8a', 
    marginTop: 6, 
    lineHeight: 20 
  },
  engagementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f8fbff',
  },
  engagementIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  engagementSub: { 
    fontSize: 12, 
    fontWeight: '600',
    color: '#64748b',
  },
  engagementTitle: { 
    fontSize: 14, 
    fontWeight: '700',
    color: '#1e293b',
    lineHeight: 20,
  },
  detailsSection: { 
    marginTop: 24 
  },
  detailsSectionTitle: { 
    fontSize: 15, 
    fontWeight: '700',
    color: '#0f172a', 
    marginBottom: 14,
    lineHeight: 20,
  },
  notaryProfileCard: { 
    padding: 16 
  },
  notaryInfoLarge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  notaryAvatarBox: { position: 'relative' },
  notaryAvatarLg: { 
    width: 60, 
    height: 60, 
    borderRadius: 12 
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.white,
  },
  notaryNameLg: { 
    fontSize: 15, 
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  ratingRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 6 
  },
  ratingText: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#eab308' 
  },
  viewProfileBtn: {
    marginTop: 16,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: { 
    fontSize: 14, 
    color: '#0a49a8' 
  },
  sectionHeaderWithCount: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16 
  },
  fileCardDetails: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16, 
    padding: 16 
  },
  fileIconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 10, 
    backgroundColor: '#fef2f2', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  downloadBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 10, 
    backgroundColor: '#f1f5f9', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  statusCard: { padding: 16 },
  logCard: { padding: 16 },
  logItem: { flexDirection: 'row', gap: 16 },
  logIconBox: { 
    width: 36, 
    height: 36, 
    borderRadius: 8, 
    backgroundColor: '#eff6ff', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  logHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 6 
  },
  logDivider: { 
    height: 1, 
    backgroundColor: '#f1f5f9', 
    marginVertical: 16 
  },
});


