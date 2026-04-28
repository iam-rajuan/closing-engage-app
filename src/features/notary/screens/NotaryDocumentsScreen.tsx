import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  CheckCircle2,
  ChevronDown,
  CloudUpload,
  FileText,
  Send,
  Trash2,
} from 'lucide-react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { colors, shadows } from '@/theme';
import { pickDocument } from '@/utils/fileUpload';

const GUIDE_ITEMS = [
  'Legibility (No blur or glare)',
  'Order of Pages (Per instructions)',
  'Full Stack (Include all 48 pages)',
];

export function UploadDocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <ScreenContainer
      scroll
      contentStyle={s.container}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <AppHeader onProfilePress={() => router.push('/notary/settings')} />

      {/* Page Title */}
      <AppText weight="bold" style={s.pageTitle}>Upload Documents</AppText>

      {/* ── SELECTED ORDER ── */}
      <AppCard style={s.orderCard}>
        <AppText variant="label" muted style={s.orderLabel}>SELECTED ORDER</AppText>
        <Pressable style={s.orderDropdown}>
          <AppText weight="bold" style={s.orderValue}>#CE-90210 - Jonathan Harker</AppText>
          <ChevronDown color="#334155" size={20} />
        </Pressable>
      </AppCard>

      {/* ── UPLOAD AREA ── */}
      <AppCard style={s.uploadCard}>
        <Pressable style={s.dropZone} onPress={() => void pickDocument()}>
          <View style={s.cloudIconCircle}>
            <CloudUpload color="#0a49a8" size={28} />
          </View>
          <AppText weight="bold" style={s.dropTitle}>Drag & Drop Scanbacks</AppText>
          <AppText muted style={s.dropSubtitle}>Upload high-resolution PDF scans only</AppText>
        </Pressable>

        <Pressable style={s.browseBtn} onPress={() => void pickDocument()}>
          <AppText weight="bold" style={s.browseBtnText}>Browse Files</AppText>
        </Pressable>
      </AppCard>

      {/* ── UPLOADED FILES ── */}
      <AppText weight="bold" style={s.sectionLabel}>UPLOADED FILES (1)</AppText>
      <AppCard style={s.fileCard}>
        <View style={s.fileRow}>
          <View style={s.fileIconBox}>
            <FileText color="#dc2626" size={20} />
          </View>
          <View style={s.fileInfo}>
            <AppText weight="bold" style={s.fileName}>scanback_signed_final.pdf</AppText>
            <AppText muted style={s.fileSize}>4.2 MB</AppText>
          </View>
          <Pressable style={s.deleteBtn}>
            <Trash2 color="#94a3b8" size={20} />
          </Pressable>
        </View>

        {/* Verification Status */}
        <View style={s.verificationRow}>
          <AppText weight="bold" style={s.verificationLabel}>VERIFICATION COMPLETE</AppText>
          <AppText weight="bold" style={s.verificationPercent}>100%</AppText>
        </View>
        <View style={s.progressTrack}>
          <View style={s.progressFill} />
        </View>
      </AppCard>

      {/* ── SUBMISSION GUIDE ── */}
      <AppCard style={s.guideCard}>
        <View style={s.guideTitleRow}>
          <CheckCircle2 color="#0a49a8" size={20} />
          <AppText weight="bold" style={s.guideTitle}>SUBMISSION GUIDE</AppText>
        </View>
        {GUIDE_ITEMS.map((item) => (
          <View key={item} style={s.guideItem}>
            <CheckCircle2 color="#16a34a" size={18} />
            <AppText style={s.guideText}>{item}</AppText>
          </View>
        ))}
      </AppCard>

      {/* ── SUBMIT BUTTON ── */}
      <Pressable style={s.submitBtn}>
        <AppText weight="bold" style={s.submitBtnText}>Upload & Submit</AppText>
        <Send color="#fff" size={18} />
      </Pressable>
    </ScreenContainer>
  );
}

export function NotaryDocumentsScreen() {
  return <UploadDocumentsScreen />;
}

/* ─── STYLES ─── */
const s = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },

  /* Page Title */
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0a49a8',
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 32,
  },

  /* Order Selector */
  orderCard: {
    padding: 16,
    borderRadius: 14,
    gap: 10,
    marginBottom: 16,
  },
  orderLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    color: '#94a3b8',
  },
  orderDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    height: 48,
    borderRadius: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  orderValue: {
    fontSize: 15,
    color: '#0f172a',
  },

  /* Upload Area */
  uploadCard: {
    padding: 24,
    borderRadius: 16,
    gap: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  dropZone: {
    width: '100%',
    minHeight: 160,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#f8fbff',
    paddingVertical: 24,
  },
  cloudIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dropTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0f172a',
  },
  dropSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
  },
  browseBtn: {
    width: '100%',
    height: 50,
    backgroundColor: '#0a49a8',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  browseBtnText: {
    color: '#fff',
    fontSize: 16,
  },

  /* Uploaded Files */
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  fileCard: {
    padding: 16,
    borderRadius: 14,
    gap: 14,
    marginBottom: 20,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    gap: 2,
  },
  fileName: {
    fontSize: 14,
    color: '#0f172a',
  },
  fileSize: {
    fontSize: 12,
    color: '#94a3b8',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Verification */
  verificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verificationLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0a49a8',
    letterSpacing: 0.3,
  },
  verificationPercent: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0a49a8',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    width: '100%',
    backgroundColor: '#0a49a8',
    borderRadius: 3,
  },

  /* Submission Guide */
  guideCard: {
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#e8edf2',
  },
  guideTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  guideTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: 0.5,
  },
  guideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  guideText: {
    fontSize: 14,
    color: '#334155',
    flex: 1,
  },

  /* Submit Button */
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
    backgroundColor: '#0a49a8',
    borderRadius: 12,
    ...shadows.button,
    marginBottom: 20,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
  },
});
