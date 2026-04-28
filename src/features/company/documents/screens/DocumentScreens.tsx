import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, View } from 'react-native';
import { Calendar, CheckCircle2, ChevronLeft, ChevronRight, Download, FileText, Printer, Search } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { documents } from '@/constants/mockData';
import { styles } from '@/features/shared/styles/screenStyles';
import { colors } from '@/theme';
export function DocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Documents</AppText>
        <AppText muted style={styles.pageSubtitle}>Access and download your approved files</AppText>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput 
          placeholder="Filter by Order" 
          style={styles.searchInput} 
          containerStyle={styles.searchBox} 
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={[styles.filterBtn, styles.filterBtnActive]}>
          <FileText color={colors.white} size={14} />
          <AppText style={[styles.filterBtnText, styles.filterBtnTextActive]}>PDF Only</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Calendar color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Filter by Date</AppText>
        </Pressable>
        <Pressable style={styles.clearBtn}>
          <AppText style={styles.clearBtnText}>Clear</AppText>
        </Pressable>
      </View>

      <View style={styles.documentList}>
        {documents.map((doc) => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            onView={() => router.push(`/company/documents/${doc.id}`)} 
          />
        ))}
      </View>

      <View style={styles.listFooter}>
        <AppText style={styles.resultsCount} muted>Showing 3 of 12 documents</AppText>
        <AppButton 
          title="Load More" 
          variant="secondary" 
          style={styles.loadMoreBtn}
          textStyle={styles.loadMoreText}
        />
      </View>
    </ScreenContainer>
  );
}

export function DocumentViewScreen() {
  return (
    <ScreenContainer>
      <AppHeader 
        back 
        centerTitle 
        title="Document View" 
        onProfilePress={() => router.push('/company/settings')} 
      />
      
      <View style={styles.previewContainer}>
        <View style={styles.previewContent}>
          <FileText color="#cbd5e1" size={140} strokeWidth={1} />
          {/* Mock document representation */}
          <View style={styles.mockDocLayer}>
            <View style={styles.mockDocTitle} />
            <View style={styles.mockDocLine} />
            <View style={styles.mockDocLine} />
            <View style={styles.mockDocGrid}>
              <View style={styles.mockDocBox} />
              <View style={styles.mockDocBox} />
            </View>
          </View>
        </View>
        <View style={styles.previewControls}>
          <View style={styles.zoomPill}>
            <Pressable><AppText style={styles.zoomBtn}>−</AppText></Pressable>
            <AppText style={styles.zoomText}>85%</AppText>
            <Pressable><AppText style={styles.zoomBtn}>+</AppText></Pressable>
            <View style={styles.zoomDivider} />
            <Pressable><ChevronLeft color="#fff" size={16} /></Pressable>
            <AppText style={styles.zoomText}>1/12</AppText>
            <Pressable><ChevronRight color="#fff" size={16} /></Pressable>
          </View>
        </View>
      </View>

      <View style={styles.viewActionRow}>
        <AppButton 
          title="Download" 
          icon={<Download color={colors.white} size={18} />} 
          style={styles.viewDownloadBtn}
        />
        <AppButton 
          title="Print" 
          variant="secondary" 
          icon={<Printer color={colors.primary} size={18} />} 
          style={styles.viewPrintBtn}
        />
      </View>

      <AppCard style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <AppText weight="bold" style={styles.infoCardTitle}>File Details</AppText>
          <Badge label="APPROVED" tone="green" />
        </View>
        
        <View style={styles.fieldGrid}>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>NAME</AppText>
            <AppText weight="bold" style={styles.fieldValue}>Closing_Disclosure_Final.pdf</AppText>
          </View>
          <View style={styles.fieldHalf}>
            <AppText variant="caption" muted style={styles.fieldLabel}>SIZE</AppText>
            <AppText weight="bold" style={styles.fieldValue}>2.4 MB</AppText>
          </View>
          <View style={styles.fieldHalf}>
            <AppText variant="caption" muted style={styles.fieldLabel}>DATE</AppText>
            <AppText weight="bold" style={styles.fieldValue}>Apr 15, 2026</AppText>
          </View>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>UPLOADED BY</AppText>
            <View style={styles.uploadedByRow}>
              <View style={styles.userAvatarSm}>
                <AppText style={styles.userAvatarText}>JD</AppText>
              </View>
              <AppText weight="bold" style={styles.fieldValue}>Janet Doe (Notary)</AppText>
            </View>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.infoCard}>
        <AppText weight="bold" style={styles.infoCardTitle}>Order Information</AppText>
        <View style={styles.fieldGrid}>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>CLIENT NAME</AppText>
            <AppText weight="bold" style={styles.fieldValue}>Robert & Sarah Montgomery</AppText>
          </View>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>PROPERTY ADDRESS</AppText>
            <AppText weight="bold" style={styles.fieldValue}>8421 Whispering Pines Dr, Austin, TX 78729</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.infoCard}>
        <AppText weight="bold" style={styles.infoCardTitle}>Recent Activity</AppText>
        
        <View style={styles.activityTimeline}>
          <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={[styles.activityIcon, { backgroundColor: '#0a49a8' }]}>
                <CheckCircle2 color="#fff" size={12} />
              </View>
              <View style={styles.activityLine} />
            </View>
            <View style={styles.activityRight}>
              <View style={styles.activityHeader}>
                <AppText weight="bold" style={styles.activityTitle}>Approved by Admin</AppText>
              </View>
              <AppText variant="caption" muted style={styles.activitySub}>Final review completed by Michael S.</AppText>
              <AppText variant="caption" muted style={styles.activityTime}>TODAY, 2:45 PM</AppText>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={[styles.activityIcon, { backgroundColor: '#eff6ff' }]}>
                <FileText color="#0a49a8" size={12} />
              </View>
            </View>
            <View style={styles.activityRight}>
              <View style={styles.activityHeader}>
                <AppText weight="bold" style={styles.activityTitle}>Uploaded by Notary</AppText>
              </View>
              <AppText variant="caption" muted style={styles.activitySub}>Signed disclosure docs attached.</AppText>
              <AppText variant="caption" muted style={styles.activityTime}>APR 14, 11:20 AM</AppText>
            </View>
          </View>
        </View>
      </AppCard>
      
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}


