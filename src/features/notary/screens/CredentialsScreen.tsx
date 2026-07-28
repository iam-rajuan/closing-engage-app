import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import {
  BadgeCheck,
  Edit2,
  FileCheck2,
  Filter,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SuccessModal } from '@/components/common/SuccessModal';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import {
  addNotaryCredential,
  getNotaryCredentials,
  updateNotaryCommission,
  type NotaryCredentialStatus,
  type NotaryCredentialVerification,
  type NotaryScreeningStatus,
} from '@/services/notary.service';
import { colors, shadows } from '@/theme';

const SCREENING_TONE: Record<NotaryScreeningStatus, { dot: string; label: string }> = {
  Verified: { dot: '#16a34a', label: 'Verified' },
  Pending: { dot: '#f59e0b', label: 'Pending Review' },
  Failed: { dot: '#dc2626', label: 'Failed' },
};

const STATUS_TONE: Record<NotaryCredentialStatus, { bg: string; fg: string }> = {
  Approved: { bg: '#dcfce7', fg: '#16a34a' },
  Rejected: { bg: '#fee2e2', fg: '#dc2626' },
  Pending: { bg: '#fef3c7', fg: '#b45309' },
};

const formatExpiry = (value: string) => {
  if (!value) return '—';
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
  if (Number.isNaN(iso.getTime())) return value;
  return iso.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function CredentialsScreen() {
  const { data, loading, error, reload, setData } = useAsyncResource(() => getNotaryCredentials(), [], {
    cacheKey: 'notary-credentials',
  });

  const [updateOpen, setUpdateOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [updateForm, setUpdateForm] = useState({
    commissionAuthority: '',
    licenseNumber: '',
    commissionExpiry: '',
    eoCoverage: '',
    backgroundScreeningDetail: '',
  });
  const [uploadForm, setUploadForm] = useState<{
    documentName: string;
    issuer: string;
    verification: NotaryCredentialVerification;
  }>({ documentName: '', issuer: '', verification: 'Manual Review' });

  const screening = data ? SCREENING_TONE[data.backgroundScreeningStatus] : SCREENING_TONE.Pending;

  const openUpdate = () => {
    if (!data) return;
    setUpdateForm({
      commissionAuthority: data.commissionAuthority,
      licenseNumber: data.licenseNumber,
      commissionExpiry: data.commissionExpiry,
      eoCoverage: data.eoCoverage,
      backgroundScreeningDetail: data.backgroundScreeningDetail,
    });
    setUpdateOpen(true);
  };

  const submitUpdate = async () => {
    try {
      setSaving(true);
      const updated = await updateNotaryCommission({
        commissionAuthority: updateForm.commissionAuthority.trim(),
        licenseNumber: updateForm.licenseNumber.trim(),
        commissionExpiry: updateForm.commissionExpiry.trim(),
        eoCoverage: updateForm.eoCoverage.trim(),
        backgroundScreeningDetail: updateForm.backgroundScreeningDetail.trim(),
      });
      setData(updated);
      setUpdateOpen(false);
      setSuccessMessage('Your commission details were updated successfully.');
    } catch (err) {
      Alert.alert('Update failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const submitUpload = async () => {
    if (!uploadForm.documentName.trim() || !uploadForm.issuer.trim()) {
      Alert.alert('Missing details', 'Please enter both a document name and issuer.');
      return;
    }
    try {
      setSaving(true);
      const updated = await addNotaryCredential({
        documentName: uploadForm.documentName.trim(),
        issuer: uploadForm.issuer.trim(),
        verification: uploadForm.verification,
      });
      setData(updated);
      setUploadOpen(false);
      setUploadForm({ documentName: '', issuer: '', verification: 'Manual Review' });
      setSuccessMessage('Your credential was submitted for admin review.');
    } catch (err) {
      Alert.alert('Upload failed', err instanceof Error ? err.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer
      scroll
      contentStyle={s.container}
      refreshing={loading && Boolean(data)}
      onRefresh={() => void reload()}
    >
      <AppHeader onProfilePress={() => router.push('/notary/settings')} />

      {loading && !data ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {data ? (
        <>
          {/* ── PRIMARY COMMISSION ── */}
          <AppCard style={s.commissionCard}>
            <View style={s.commissionTop}>
              <AppText variant="label" muted style={s.commissionLabel}>
                PRIMARY COMMISSION
              </AppText>
              {data.verified ? (
                <View style={s.verifiedBadge}>
                  <BadgeCheck color="#16a34a" size={14} />
                  <AppText weight="bold" style={s.verifiedText}>VERIFIED</AppText>
                </View>
              ) : (
                <View style={s.pendingBadge}>
                  <AppText weight="bold" style={s.pendingBadgeText}>PENDING</AppText>
                </View>
              )}
            </View>

            <AppText weight="bold" style={s.commissionTitle}>
              {data.commissionAuthority || 'Commission authority not set'}
            </AppText>

            {/* Two-column License / Expiry */}
            <View style={s.twoCol}>
              <View style={s.colItem}>
                <AppText variant="caption" muted style={s.colLabel}>License Number</AppText>
                <AppText weight="bold" style={s.colValue}>{data.licenseNumber || '—'}</AppText>
              </View>
              <View style={s.colItem}>
                <AppText variant="caption" muted style={s.colLabel}>Expiry Date</AppText>
                <AppText weight="bold" style={s.colValue}>{formatExpiry(data.commissionExpiry)}</AppText>
              </View>
            </View>

            {/* E&O Coverage */}
            <AppText variant="caption" muted style={s.eoLabel}>E&O Coverage</AppText>
            <View style={s.eoRow}>
              <View style={s.eoPriceBox}>
                <AppText weight="bold" style={s.eoPrice}>{data.eoCoverage || 'Not provided'}</AppText>
              </View>
            </View>

            {/* Update Button */}
            <Pressable style={s.updateBtn} onPress={openUpdate}>
              <Edit2 color="#fff" size={16} />
              <AppText weight="bold" style={s.updateBtnText}>Update information</AppText>
            </Pressable>
          </AppCard>

          {/* ── BACKGROUND SCREENING ── */}
          <AppCard style={s.screeningCard}>
            <View style={s.screeningTop}>
              <View style={s.screeningIconBox}>
                <ShieldCheck color="#64748b" size={22} />
              </View>
              <View style={s.screeningContent}>
                <View style={s.screeningTitleRow}>
                  <AppText weight="bold" style={s.screeningTitle}>Background Screening</AppText>
                  <View style={[s.pendingDot, { backgroundColor: screening.dot }]} />
                  <AppText style={[s.pendingLabel, { color: screening.dot }]}>{screening.label}</AppText>
                </View>
              </View>
            </View>
            {data.backgroundScreeningDetail ? (
              <AppText muted style={s.screeningDesc}>{data.backgroundScreeningDetail}</AppText>
            ) : (
              <AppText muted style={s.screeningDesc}>No background screening details available yet.</AppText>
            )}
          </AppCard>

          {/* ── CREDENTIAL HISTORY ── */}
          <View style={s.historyHeader}>
            <AppText weight="bold" style={s.historyTitle}>Credential History</AppText>
            <Pressable style={s.filterBtn}>
              <Filter color="#0a49a8" size={16} />
              <AppText weight="bold" style={s.filterText}>FILTER</AppText>
            </Pressable>
          </View>

          {data.credentials.length === 0 ? (
            <EmptyState title="No credentials uploaded yet" />
          ) : (
            data.credentials.map((cred) => {
              const isAuto = cred.verification === 'Auto-Verified';
              return (
                <AppCard key={cred.id} style={s.credCard}>
                  <View style={s.credRow}>
                    <View style={[s.credIconBox, { backgroundColor: isAuto ? '#f0fdf4' : '#eff6ff' }]}>
                      <FileCheck2 color={isAuto ? '#16a34a' : '#2563eb'} size={20} />
                    </View>
                    <View style={s.credInfo}>
                      <View style={s.credTitleRow}>
                        <AppText weight="bold" style={s.credTitle}>{cred.documentName}</AppText>
                        <AppText muted style={s.credDate}>{cred.uploadDate}</AppText>
                      </View>
                      <AppText muted style={s.credIssuer}>{cred.issuer}</AppText>
                      <View style={s.credStatusRow}>
                        <View style={[s.statusDot, { backgroundColor: isAuto ? '#16a34a' : '#b96716' }]} />
                        <AppText weight="bold" style={[s.statusLabel, { color: isAuto ? '#16a34a' : '#b96716' }]}>
                          {cred.verification.toUpperCase()}
                        </AppText>
                        <View style={[s.reviewBadge, { backgroundColor: STATUS_TONE[cred.status].bg }]}>
                          <AppText weight="bold" style={[s.reviewBadgeText, { color: STATUS_TONE[cred.status].fg }]}>
                            {cred.status.toUpperCase()}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  </View>
                </AppCard>
              );
            })
          )}

          {/* ── UPLOAD NEW CREDENTIAL ── */}
          <Pressable style={s.uploadBtn} onPress={() => setUploadOpen(true)}>
            <Upload color="#0a49a8" size={18} />
            <AppText weight="bold" style={s.uploadBtnText}>Upload new credential</AppText>
          </Pressable>
        </>
      ) : null}

      {/* ── UPDATE COMMISSION MODAL ── */}
      <CredentialFormModal
        visible={updateOpen}
        title="Update Commission"
        onClose={() => setUpdateOpen(false)}
        onSubmit={() => void submitUpdate()}
        submitLabel="Save Changes"
        saving={saving}
      >
        <AppInput
          label="COMMISSION AUTHORITY"
          placeholder="e.g. California Secretary of State"
          value={updateForm.commissionAuthority}
          onChangeText={(v) => setUpdateForm((f) => ({ ...f, commissionAuthority: v }))}
        />
        <AppInput
          label="LICENSE NUMBER"
          placeholder="e.g. 2348910-CA"
          value={updateForm.licenseNumber}
          onChangeText={(v) => setUpdateForm((f) => ({ ...f, licenseNumber: v }))}
        />
        <AppInput
          label="COMMISSION EXPIRY"
          placeholder="YYYY-MM-DD"
          value={updateForm.commissionExpiry}
          onChangeText={(v) => setUpdateForm((f) => ({ ...f, commissionExpiry: v }))}
        />
        <AppInput
          label="E&O COVERAGE"
          placeholder="e.g. $100,000.00"
          value={updateForm.eoCoverage}
          onChangeText={(v) => setUpdateForm((f) => ({ ...f, eoCoverage: v }))}
        />
        <AppInput
          label="BACKGROUND SCREENING DETAIL"
          placeholder="Notes about your screening status"
          value={updateForm.backgroundScreeningDetail}
          onChangeText={(v) => setUpdateForm((f) => ({ ...f, backgroundScreeningDetail: v }))}
          multiline
          style={s.multilineInput}
        />
      </CredentialFormModal>

      {/* ── UPLOAD CREDENTIAL MODAL ── */}
      <CredentialFormModal
        visible={uploadOpen}
        title="Upload New Credential"
        onClose={() => setUploadOpen(false)}
        onSubmit={() => void submitUpload()}
        submitLabel="Submit for Review"
        saving={saving}
      >
        <AppInput
          label="DOCUMENT NAME"
          placeholder="e.g. NNA Certification"
          value={uploadForm.documentName}
          onChangeText={(v) => setUploadForm((f) => ({ ...f, documentName: v }))}
        />
        <AppInput
          label="ISSUER"
          placeholder="e.g. National Notary Association"
          value={uploadForm.issuer}
          onChangeText={(v) => setUploadForm((f) => ({ ...f, issuer: v }))}
        />
        <View style={s.verificationGroup}>
          <AppText variant="label" muted>VERIFICATION METHOD</AppText>
          <View style={s.verificationRow}>
            {(['Manual Review', 'Auto-Verified'] as NotaryCredentialVerification[]).map((option) => {
              const active = uploadForm.verification === option;
              return (
                <Pressable
                  key={option}
                  style={[s.verificationChip, active && s.verificationChipActive]}
                  onPress={() => setUploadForm((f) => ({ ...f, verification: option }))}
                >
                  <AppText weight="bold" style={[s.verificationChipText, active && s.verificationChipTextActive]}>
                    {option}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>
      </CredentialFormModal>

      <SuccessModal
        visible={successMessage !== null}
        title="Success"
        description={successMessage ?? ''}
        onClose={() => setSuccessMessage(null)}
      />
    </ScreenContainer>
  );
}

/* ─── Reusable form modal (bottom sheet) ─── */
function CredentialFormModal({
  visible,
  title,
  onClose,
  onSubmit,
  submitLabel,
  saving,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  submitLabel: string;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={s.modalRoot}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={s.modalBackdrop} onPress={onClose} />
        <View style={s.modalSheet}>
          <View style={s.modalHandle} />
          <View style={s.modalHeader}>
            <AppText weight="bold" style={s.modalTitle}>{title}</AppText>
            <Pressable style={s.modalClose} onPress={onClose} hitSlop={12}>
              <X color="#64748b" size={20} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={s.modalBody}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <View style={s.modalFooter}>
            <AppButton title="Cancel" variant="ghost" onPress={onClose} style={s.modalFooterBtn} />
            <AppButton title={submitLabel} onPress={onSubmit} loading={saving} style={s.modalFooterBtn} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/* ─── STYLES ─── */
const s = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  /* Commission Card */
  commissionCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 14,
    gap: 4,
  },
  commissionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commissionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: '#64748b',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  verifiedText: {
    fontSize: 11,
    color: '#16a34a',
    letterSpacing: 0.3,
  },
  pendingBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pendingBadgeText: {
    fontSize: 11,
    color: '#b45309',
    letterSpacing: 0.3,
  },
  commissionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
    marginTop: 4,
    marginBottom: 12,
  },
  /* Two-col layout */
  twoCol: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  colItem: {
    gap: 4,
  },
  colLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  colValue: {
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '700',
  },
  /* E&O */
  eoLabel: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
    marginBottom: 6,
  },
  eoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  eoPriceBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  eoPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0a49a8',
  },
  eoPlan: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  /* Update Btn */
  updateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    backgroundColor: '#0a49a8',
    borderRadius: 10,
    ...shadows.button,
  },
  updateBtnText: {
    color: '#fff',
    fontSize: 14,
  },

  /* Screening Card */
  screeningCard: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    gap: 10,
  },
  screeningTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  screeningIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screeningContent: {
    flex: 1,
  },
  screeningTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  screeningTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f59e0b',
  },
  pendingLabel: {
    fontSize: 13,
    color: '#f59e0b',
    fontWeight: '600',
  },
  screeningDesc: {
    fontSize: 13,
    lineHeight: 20,
    color: '#64748b',
    marginLeft: 54,
  },
  screeningDate: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 13,
  },

  /* Credential History */
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 13,
    color: '#0a49a8',
    letterSpacing: 0.3,
  },

  /* Credential Card */
  credCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 12,
  },
  credRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
  },
  credIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  credInfo: {
    flex: 1,
    gap: 2,
  },
  credTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  credTitle: {
    fontSize: 15,
    color: '#0f172a',
    flex: 1,
  },
  credDate: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '600',
  },
  credIssuer: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 1,
  },
  credStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  reviewBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  reviewBadgeText: {
    fontSize: 10,
    letterSpacing: 0.3,
  },

  /* Modal */
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(15,23,42,0.45)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 24,
    maxHeight: '88%',
    ...shadows.lg,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e2e8f0',
    alignSelf: 'center',
    marginBottom: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalTitle: { fontSize: 17, color: '#0f172a' },
  modalClose: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: { padding: 20, gap: 14 },
  multilineInput: { minHeight: 80, textAlignVertical: 'top', paddingTop: 12 },
  verificationGroup: { gap: 8 },
  verificationRow: { flexDirection: 'row', gap: 10 },
  verificationChip: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fbff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verificationChipActive: { borderColor: colors.primary, backgroundColor: '#eff6ff' },
  verificationChipText: { fontSize: 13, color: '#64748b' },
  verificationChipTextActive: { color: colors.primary },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalFooterBtn: { flex: 1 },

  /* Upload New Credential */
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    marginTop: 6,
    marginBottom: 8,
  },
  uploadBtnText: {
    fontSize: 14,
    color: '#0a49a8',
  },
});
