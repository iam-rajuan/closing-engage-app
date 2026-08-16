import { Alert, ActivityIndicator, BackHandler, Image, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { ArrowUpRight, Calendar, CheckCircle2, Clock, Download, FileText, Info, MapPin, Sparkles, Trash2, Upload, UserRound } from 'lucide-react-native';
import { deleteDocument, getDocumentDownloadUrl, uploadDocumentBinary } from '@/services/documents.service';
import { downloadFileToCache, downloadFileToDevice, getMimeType, openDownloadedFile } from '@/utils/fileDownload';
import { DownloadSuccessModal } from '@/components/common/DownloadSuccessModal';
import { FeedbackModal } from '@/components/common/FeedbackModal';
import { DocumentIcon, getFileCategory } from '@/components/common/DocumentIcon';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { DatePickerModal } from '@/components/common/DatePickerModal';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { confirmOrderMeeting, getOrderById, rejectOrderMeeting, scheduleOrderMeeting } from '@/services/orders.service';
import { TimePickerModal } from '@/components/common/TimePickerModal';
import { colors } from '@/theme';
import { pickDocument } from '@/utils/fileUpload';

function DetailField({ label, value, icon, children }: { label: string; value: string; icon?: React.ReactNode; children?: ReactNode }) {
  return (
    <View style={styles.detailField}>
      <AppText variant="caption" muted style={styles.detailLabel} maxFontSizeMultiplier={1.1}>
        {label}
      </AppText>
      <View style={styles.detailValueRow}>
        {icon && <View style={styles.detailIcon}>{icon}</View>}
        <AppText weight="semibold" style={styles.detailValue} maxFontSizeMultiplier={1.2}>
          {value}
        </AppText>
      </View>
      {children}
    </View>
  );
}

const firstParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);
const titleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
const fileKindLabel = (fileName: string) => {
  const category = getFileCategory(fileName);
  return category === 'other' ? 'File' : titleCase(category);
};

export function CompanyOrderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; from?: string }>();
  const orderId = firstParam(params.id) ?? '';
  const source = firstParam(params.from);
  const backTarget = source === 'home'
    ? '/company/home'
    : source === 'notifications'
      ? '/company/notifications'
      : '/company/orders';
  const handleBack = useCallback(() => {
    router.replace(backTarget);
  }, [backTarget]);
  const { data: order, loading, error, reload, setData } = useAsyncResource(
    () => getOrderById(orderId),
    [orderId],
    { cacheKey: `order:${orderId}` },
  );
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [openingDocumentId, setOpeningDocumentId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    name: string;
    localUri: string;
    mimeType: string;
  } | null>(null);
  const [uploadingCompanyDocument, setUploadingCompanyDocument] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [respondingToSchedule, setRespondingToSchedule] = useState(false);
  const [counterDate, setCounterDate] = useState('');
  const [counterTime, setCounterTime] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [counterDatePickerVisible, setCounterDatePickerVisible] = useState(false);
  const [counterTimePickerVisible, setCounterTimePickerVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState<{
    visible: boolean;
    title: string;
    description: string;
    variant: 'success' | 'error' | 'info';
    buttonTitle?: string;
  } | null>(null);

  const meeting = order?.meeting ?? null;
  const canUploadCompanyDocuments = Boolean(order?.assignedNotaryId || order?.openForAll);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleDownload = async (docId: string, name: string) => {
    try {
      setDownloadingDocId(docId);
      const url = await getDocumentDownloadUrl(docId);
      const { localUri, mimeType } = await downloadFileToDevice(url, name, getMimeType(name, 'application/octet-stream'));
      setDownloadSuccess({ name, localUri, mimeType });
    } catch (error) {
      console.error('Download error:', error);
      setFeedbackModal({
        visible: true,
        title: 'Download Failed',
        description: error instanceof Error ? error.message : 'Could not download or save this document.',
        variant: 'error',
        buttonTitle: 'Dismiss',
      });
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleOpenDocument = async (docId: string, name: string) => {
    try {
      setOpeningDocumentId(docId);
      const url = await getDocumentDownloadUrl(docId);
      const { localUri, mimeType } = await downloadFileToCache(url, name, getMimeType(name, 'application/octet-stream'));
      await openDownloadedFile(localUri, mimeType, name);
    } catch (error) {
      console.error('Open document error:', error);
      setFeedbackModal({
        visible: true,
        title: 'Unable to Open',
        description: error instanceof Error ? error.message : 'Could not open this document on your device.',
        variant: 'error',
        buttonTitle: 'Dismiss',
      });
    } finally {
      setOpeningDocumentId(null);
    }
  };

  const handleCompanyUpload = async () => {
    if (!order) return;
    if (!canUploadCompanyDocuments) {
      setFeedbackModal({
        visible: true,
        title: 'Upload Locked',
        description: 'Documents can be uploaded only after the order is assigned or opened to notaries.',
        variant: 'info',
        buttonTitle: 'Got It',
      });
      return;
    }

    const picked = await pickDocument();
    if (!picked) return;

    try {
      setUploadingCompanyDocument(true);
      await uploadDocumentBinary({
        orderNumber: order.orderNumber,
        file: {
          uri: picked.uri,
          name: picked.name,
          size: picked.size,
          mimeType: picked.mimeType,
        },
        uploaderRole: 'company',
        uploadedByName: 'Title Company',
      });
      await reload();
      setFeedbackModal({
        visible: true,
        title: 'Document Uploaded',
        description: `${picked.name} is now available in Title Documents.`,
        variant: 'success',
        buttonTitle: 'Done',
      });
    } catch (error) {
      setFeedbackModal({
        visible: true,
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
        buttonTitle: 'Dismiss',
      });
    } finally {
      setUploadingCompanyDocument(false);
    }
  };

  const canDeleteCompanyDocument = (document: { id?: string; uploadedBy?: string; status?: string }) => {
    const uploadedBy = document.uploadedBy?.trim().toLowerCase();
    const status = document.status?.trim().toLowerCase();

    return Boolean(
      document.id &&
      uploadedBy === 'title company' &&
      status !== 'approved' &&
      status !== 'verified',
    );
  };

  const handleDeleteCompanyDocument = (document: { id?: string; name: string; uploadedBy?: string; status?: string }) => {
    if (!document.id || !canDeleteCompanyDocument(document)) return;

    Alert.alert(
      'Delete document',
      `Are you sure you want to delete "${document.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setDeletingDocumentId(document.id!);
                await deleteDocument(document.id!);
                await reload();
                setFeedbackModal({
                  visible: true,
                  title: 'Document Deleted',
                  description: `${document.name} has been removed from this order.`,
                  variant: 'success',
                  buttonTitle: 'Done',
                });
              } catch (error) {
                setFeedbackModal({
                  visible: true,
                  title: 'Unable to Delete',
                  description: error instanceof Error ? error.message : 'Please try again.',
                  variant: 'error',
                  buttonTitle: 'Dismiss',
                });
              } finally {
                setDeletingDocumentId(null);
              }
            })();
          },
        },
      ],
    );
  };

  const acceptNotaryReschedule = async () => {
    setRespondingToSchedule(true);
    try {
      const updated = await confirmOrderMeeting(orderId);
      setData(updated);
      setFeedbackModal({
        visible: true,
        title: 'Preferred Time Accepted',
        description: 'The notary can now see the signing time as confirmed.',
        variant: 'success',
        buttonTitle: 'Done',
      });
    } catch (error) {
      setFeedbackModal({
        visible: true,
        title: 'Unable to Accept Time',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
        buttonTitle: 'Dismiss',
      });
    } finally {
      setRespondingToSchedule(false);
    }
  };

  const sendCounterSchedule = async () => {
    if (!counterDate || !counterTime) {
      setFeedbackModal({
        visible: true,
        title: 'Select date and time',
        description: 'Choose the new signing date and time before sending.',
        variant: 'info',
        buttonTitle: 'Got It',
      });
      return;
    }

    setRespondingToSchedule(true);
    try {
      const updated = await scheduleOrderMeeting(orderId, counterDate, counterTime);
      setData(updated);
      setFeedbackModal({
        visible: true,
        title: 'Schedule Sent',
        description: 'The notary has been asked to confirm the new signing time.',
        variant: 'success',
        buttonTitle: 'Done',
      });
    } catch (error) {
      setFeedbackModal({
        visible: true,
        title: 'Unable to Send Schedule',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
        buttonTitle: 'Dismiss',
      });
    } finally {
      setRespondingToSchedule(false);
    }
  };

  const rejectNotaryReschedule = async () => {
    if (!rejectNote.trim()) {
      setFeedbackModal({
        visible: true,
        title: 'Add Rejection Note',
        description: 'Tell the notary why the preferred time does not work.',
        variant: 'info',
        buttonTitle: 'Got It',
      });
      return;
    }

    setRespondingToSchedule(true);
    try {
      const updated = await rejectOrderMeeting(orderId, { note: rejectNote.trim() });
      setData(updated);
      setRejectModalVisible(false);
      setRejectNote('');
      setFeedbackModal({
        visible: true,
        title: 'Reschedule Rejected',
        description: 'The notary can still accept the current signing time or request another time.',
        variant: 'success',
        buttonTitle: 'Done',
      });
    } catch (error) {
      setFeedbackModal({
        visible: true,
        title: 'Unable to Reject Reschedule',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'error',
        buttonTitle: 'Dismiss',
      });
    } finally {
      setRespondingToSchedule(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });

      return () => subscription.remove();
    }, [handleBack]),
  );

  return (
    <ScreenContainer scroll refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader back title="Order Details" onProfilePress={() => router.push('/company/settings')} onBackPress={handleBack} />

      {loading && !order ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !order ? <EmptyState title="Order details could not be loaded" /> : null}

      {order ? (
        <>
          <AppCard style={styles.detailsMainCard}>
            <View style={styles.detailsHeader}>
              <AppText style={styles.detailsOrderNum} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                {order.orderNumber}
              </AppText>
              <Badge label={order.status.toUpperCase()} tone={order.status === 'Completed' ? 'green' : 'blue'} style={styles.detailsBadge} />
            </View>

            <DetailField label="CLIENT" value={order.clientName} />

            <View style={styles.metricsRow}>
              <View style={styles.metricCell}>
                <DetailField
                  label="TITLE COMPANY FEE"
                  value={
                    typeof order.price === 'number'
                      ? `$${order.price.toFixed(2)}`
                      : order.price
                        ? `$${Number(order.price).toFixed(2)}`
                        : 'Not set'
                  }
                />
              </View>
              <View style={styles.metricCell}>
                <DetailField label="STATE" value={order.state || 'Not set'} />
              </View>
            </View>

            <DetailField
              label="SIGNING DATE & TIME"
              value={`${order.signingDate}, ${order.signingTime || 'TBD'}`}
              icon={<Calendar color={colors.primary} size={14} />}
            >
              {meeting?.status === 'confirmed' ? (
                <View style={styles.scheduleNoticeSuccess}>
                  <AppText weight="semibold" style={styles.scheduleNoticeSuccessText} maxFontSizeMultiplier={1.1}>
                    Confirmed by notary
                  </AppText>
                </View>
              ) : null}
              {meeting?.status === 'rejected' ? (
                <View style={styles.rescheduleCompactCard}>
                  <View style={styles.rescheduleHeaderRow}>
                    <View style={styles.rescheduleBadgeDot} />
                    <AppText weight="bold" style={styles.rescheduleHeaderTitle} maxFontSizeMultiplier={1.1}>
                      Reschedule Requested
                    </AppText>
                  </View>

                  {meeting.preferredDate || meeting.preferredTime ? (
                    <View style={styles.preferredTimeBanner}>
                      <View style={styles.preferredTimeInfo}>
                        <Sparkles size={14} color="#0a49a8" />
                        <View style={styles.flexContent}>
                          <AppText variant="caption" style={styles.preferredTimeLabel} maxFontSizeMultiplier={1.05}>
                            PREFERRED WINDOW
                          </AppText>
                          <AppText weight="bold" style={styles.preferredTimeVal} maxFontSizeMultiplier={1.1}>
                            {[meeting.preferredDate, meeting.preferredTime].filter(Boolean).join(' at ')}
                          </AppText>
                        </View>
                      </View>
                      <Pressable
                        style={styles.acceptPreferredBtn}
                        disabled={respondingToSchedule}
                        onPress={() => void acceptNotaryReschedule()}
                      >
                        <CheckCircle2 size={14} color="#fff" />
                        <AppText weight="bold" style={styles.acceptPreferredText} maxFontSizeMultiplier={1.05}>
                          {respondingToSchedule ? 'Saving...' : 'Accept'}
                        </AppText>
                      </Pressable>
                    </View>
                  ) : null}

                  {meeting.rejectionNote ? (
                    <View style={styles.notaryNoteBox}>
                      <AppText style={styles.notaryNoteText} maxFontSizeMultiplier={1.1}>
                        <AppText weight="semibold" style={styles.notaryNoteLabel}>Note: </AppText>
                        "{meeting.rejectionNote}"
                      </AppText>
                    </View>
                  ) : null}

                  <AppText variant="caption" style={styles.counterSectionTitle} maxFontSizeMultiplier={1.05}>
                    PROPOSE ALTERNATIVE TIME
                  </AppText>

                  <View style={styles.compactPickerRow}>
                    <Pressable style={styles.compactPickerButton} onPress={() => setCounterDatePickerVisible(true)}>
                      <Calendar size={14} color={colors.primary} />
                      <AppText weight="semibold" style={styles.compactPickerText} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                        {counterDate || 'New date'}
                      </AppText>
                    </Pressable>
                    <Pressable style={styles.compactPickerButton} onPress={() => setCounterTimePickerVisible(true)}>
                      <Clock size={14} color={colors.primary} />
                      <AppText weight="semibold" style={styles.compactPickerText} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                        {counterTime || 'New time'}
                      </AppText>
                    </Pressable>
                  </View>

                  <AppButton
                    title={respondingToSchedule ? 'Submitting...' : 'Propose New Time'}
                    onPress={() => void sendCounterSchedule()}
                    disabled={respondingToSchedule}
                    style={styles.fullWidthProposeBtn}
                  />

                  <View style={styles.inlineDeclineRow}>
                    <TextInput
                      value={rejectNote}
                      onChangeText={setRejectNote}
                      placeholder="Decline note (reason)..."
                      placeholderTextColor="#94a3b8"
                      style={styles.declineTextInput}
                    />
                    <AppButton
                      title="Decline"
                      variant="secondary"
                      onPress={() => void rejectNotaryReschedule()}
                      disabled={respondingToSchedule}
                      style={styles.declineBtnInline}
                    />
                  </View>
                </View>
              ) : null}
              {meeting?.status === 'scheduled' ? (
                <View style={styles.pendingNotaryCard}>
                  <View style={styles.pendingNotaryHeader}>
                    <View style={styles.pendingNotaryInfo}>
                      <Clock size={15} color="#2563eb" />
                      <AppText weight="bold" style={styles.pendingNotaryTitle} maxFontSizeMultiplier={1.1}>
                        Pending Notary Confirmation
                      </AppText>
                    </View>
                    <View style={styles.awaitingBadge}>
                      <AppText weight="bold" style={styles.awaitingBadgeText} maxFontSizeMultiplier={1.05}>
                        AWAITING NOTARY
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.pendingDetailsBox}>
                    <AppText style={styles.pendingDateText} maxFontSizeMultiplier={1.1}>
                      Proposed Signing Time:{' '}
                      <AppText weight="bold" style={styles.pendingDateVal}>
                        {order.signingDate}, {order.signingTime || 'TBD'}
                      </AppText>
                    </AppText>
                    {meeting.rejectionNote ? (
                      <AppText style={styles.pendingNoteText} maxFontSizeMultiplier={1.1}>
                        <AppText weight="semibold" style={{ color: '#475569' }}>Decline Note: </AppText>
                        "{meeting.rejectionNote}"
                      </AppText>
                    ) : null}
                  </View>
                </View>
              ) : null}
            </DetailField>

            <DetailField
              label="PROPERTY ADDRESS"
              value={order.address}
              icon={<MapPin color={colors.primary} size={14} />}
            />
          </AppCard>

          {order.instructions ? (
            <View style={styles.specialInstructionBox}>
              <Info color={colors.primary} size={18} />
              <View style={styles.flexContent}>
                <AppText weight="semibold" style={styles.calloutTitle} maxFontSizeMultiplier={1.1}>
                  Special Instructions
                </AppText>
                <AppText style={styles.instructionText} maxFontSizeMultiplier={1.2}>
                  {order.instructions}
                </AppText>
              </View>
            </View>
          ) : null}

          <View style={styles.detailsSection}>
            <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
              Assigned Notary
            </AppText>
            <AppCard style={styles.fileCardDetails}>
              {order.assignedNotaryId && order.notaryAvatarUrl ? (
                <Image source={{ uri: order.notaryAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <UserRound color="#2563eb" size={20} />
                </View>
              )}
              <View style={styles.flexContent}>
                <AppText weight="semibold" style={styles.primaryRowText} maxFontSizeMultiplier={1.15}>
                  {order.notaryName || 'Not assigned yet'}
                </AppText>
                <AppText variant="caption" muted style={styles.secondaryRowText} maxFontSizeMultiplier={1.1}>
                  {order.assignedNotaryId ? 'Assigned' : 'Pending assignment'}
                </AppText>
              </View>
            </AppCard>
          </View>

          {(() => {
            const companyDocs = order.documents?.filter(
              (doc) => doc.uploadedBy?.toLowerCase() === 'title company' || doc.uploadedBy?.toLowerCase() === 'admin' || !doc.uploadedBy
            ) ?? [];
            const notaryDocs = order.documents?.filter(
              (doc) =>
                doc.uploadedBy?.toLowerCase() === 'notary' &&
                (doc.status === 'Approved' || doc.status === 'Verified')
            ) ?? [];

            return (
              <>
                <View style={styles.detailsSection}>
                  <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
                    Title Documents
                  </AppText>
                  <AppCard style={styles.documentUploadPanel}>
                    <View style={styles.documentUploadHeader}>
                      <View style={styles.documentUploadCopy}>
                        <AppText weight="bold" style={styles.documentUploadTitle} maxFontSizeMultiplier={1.1}>
                          Secure title package
                        </AppText>
                        <AppText variant="caption" muted style={styles.documentUploadSubtitle} maxFontSizeMultiplier={1.05}>
                          Upload disclosures, PDFs, images, and docs for the assigned notary.
                        </AppText>
                      </View>
                      <View style={styles.documentCountBadge}>
                        <AppText weight="bold" style={styles.documentCountBadgeText} maxFontSizeMultiplier={1}>
                          {companyDocs.length}
                        </AppText>
                      </View>
                    </View>

                    <AppButton
                      title={uploadingCompanyDocument ? 'Uploading...' : 'Upload Documents'}
                      onPress={() => void handleCompanyUpload()}
                      disabled={uploadingCompanyDocument || !canUploadCompanyDocuments}
                      icon={<Upload color={colors.white} size={16} />}
                      style={
                        canUploadCompanyDocuments
                          ? styles.inlineUploadButton
                          : { ...styles.inlineUploadButton, ...styles.inlineUploadButtonDisabled }
                      }
                    />

                    <View style={styles.documentUploadHintRow}>
                      <View
                        style={[
                          styles.documentUploadHintDot,
                          canUploadCompanyDocuments ? styles.documentUploadHintDotActive : styles.documentUploadHintDotLocked,
                        ]}
                      />
                      <AppText variant="caption" muted style={styles.inlineUploadHint} maxFontSizeMultiplier={1.05}>
                        {canUploadCompanyDocuments
                          ? 'Uploads are enabled after assignment or open broadcast.'
                          : 'Uploads unlock after assignment or open broadcast.'}
                      </AppText>
                    </View>
                  </AppCard>
                  {companyDocs.length ? (
                    companyDocs.map((document, index) => (
                      <AppCard key={`company-doc-${index}`} style={styles.documentCard}>
                        <Pressable
                          style={({ pressed }) => [styles.documentMainPressable, pressed && styles.documentMainPressablePressed]}
                          onPress={() => (document.id ? void handleOpenDocument(document.id, document.name) : undefined)}
                          disabled={!document.id || openingDocumentId !== null}
                        >
                          <DocumentIcon fileName={document.name} size={48} iconSize={22} style={styles.documentCardIcon} />
                          <View style={styles.flexContent}>
                            <View style={styles.documentTitleRow}>
                              <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                                {document.name}
                              </AppText>
                              {document.id ? (
                                <View style={styles.tapToOpenPill}>
                                  {openingDocumentId === document.id ? (
                                    <ActivityIndicator color="#1d4ed8" size={10} />
                                  ) : (
                                    <ArrowUpRight color="#1d4ed8" size={12} />
                                  )}
                                  <AppText weight="bold" style={styles.tapToOpenText} maxFontSizeMultiplier={1}>
                                    {openingDocumentId === document.id ? 'Opening' : 'Open'}
                                  </AppText>
                                </View>
                              ) : null}
                            </View>
                            <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                              {document.meta} • Provided by Company
                            </AppText>
                            <View style={styles.documentChipRow}>
                              <View style={styles.documentTypeChip}>
                                <AppText weight="bold" style={styles.documentTypeChipText} maxFontSizeMultiplier={1}>
                                  {fileKindLabel(document.name)}
                                </AppText>
                              </View>
                              {document.id ? (
                                <AppText variant="caption" muted style={styles.documentTapHint} maxFontSizeMultiplier={1}>
                                  Tap card to open in your device viewer
                                </AppText>
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                        {document.id ? (
                          <View style={styles.documentActionRail}>
                            <Pressable
                              style={({ pressed }) => [styles.documentActionBtn, styles.documentDownloadActionBtn, pressed && styles.documentActionBtnPressed]}
                              onPress={() => void handleDownload(document.id!, document.name)}
                              disabled={downloadingDocId !== null}
                            >
                              {downloadingDocId === document.id ? (
                                <ActivityIndicator color="#2563eb" size="small" />
                              ) : (
                                <Download color="#2563eb" size={17} />
                              )}
                            </Pressable>
                            {canDeleteCompanyDocument(document) ? (
                              <Pressable
                                style={({ pressed }) => [styles.documentActionBtn, styles.documentDeleteActionBtn, pressed && styles.documentDeleteActionBtnPressed]}
                                onPress={() => handleDeleteCompanyDocument(document)}
                                disabled={deletingDocumentId !== null}
                              >
                                {deletingDocumentId === document.id ? (
                                  <ActivityIndicator color="#dc2626" size="small" />
                                ) : (
                                  <Trash2 color="#dc2626" size={17} />
                                )}
                              </Pressable>
                            ) : null}
                          </View>
                        ) : null}
                      </AppCard>
                    ))
                  ) : (
                    <EmptyState title="No title company documents uploaded yet" />
                  )}
                </View>

                <View style={styles.detailsSection}>
                  <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
                    Notary Scanbacks
                  </AppText>
                  {notaryDocs.length ? (
                    notaryDocs.map((document, index) => (
                      <AppCard key={`notary-doc-${index}`} style={styles.documentCard}>
                        <Pressable
                          style={({ pressed }) => [styles.documentMainPressable, pressed && styles.documentMainPressablePressed]}
                          onPress={() => (document.id ? void handleOpenDocument(document.id, document.name) : undefined)}
                          disabled={!document.id || openingDocumentId !== null}
                        >
                          <DocumentIcon fileName={document.name} size={48} iconSize={22} style={styles.documentCardIcon} />
                          <View style={styles.flexContent}>
                            <View style={styles.documentTitleRow}>
                              <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                                {document.name}
                              </AppText>
                              {document.id ? (
                                <View style={[styles.tapToOpenPill, styles.tapToOpenPillGreen]}>
                                  {openingDocumentId === document.id ? (
                                    <ActivityIndicator color="#047857" size={10} />
                                  ) : (
                                    <ArrowUpRight color="#047857" size={12} />
                                  )}
                                  <AppText weight="bold" style={[styles.tapToOpenText, styles.tapToOpenTextGreen]} maxFontSizeMultiplier={1}>
                                    {openingDocumentId === document.id ? 'Opening' : 'Open'}
                                  </AppText>
                                </View>
                              ) : null}
                            </View>
                            <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                              {document.meta} • Provided by Notary
                            </AppText>
                            <View style={styles.documentChipRow}>
                              <View style={[styles.documentTypeChip, styles.documentTypeChipGreen]}>
                                <AppText weight="bold" style={[styles.documentTypeChipText, styles.documentTypeChipTextGreen]} maxFontSizeMultiplier={1}>
                                  {fileKindLabel(document.name)}
                                </AppText>
                              </View>
                              {document.id ? (
                                <AppText variant="caption" muted style={styles.documentTapHint} maxFontSizeMultiplier={1}>
                                  Tap card to open in your device viewer
                                </AppText>
                              ) : null}
                            </View>
                          </View>
                        </Pressable>
                        {document.id ? (
                          <View style={styles.documentActionRail}>
                            <Pressable
                              style={({ pressed }) => [styles.documentActionBtn, styles.documentDownloadActionBtn, pressed && styles.documentActionBtnPressed]}
                              onPress={() => void handleDownload(document.id!, document.name)}
                              disabled={downloadingDocId !== null}
                            >
                              {downloadingDocId === document.id ? (
                                <ActivityIndicator color="#2563eb" size="small" />
                              ) : (
                                <Download color="#2563eb" size={17} />
                              )}
                            </Pressable>
                          </View>
                        ) : null}
                      </AppCard>
                    ))
                  ) : (
                    <EmptyState title="No notary scanbacks uploaded yet" />
                  )}
                </View>
              </>
            );
          })()}

          <View style={styles.detailsSection}>
            <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
              Order Status
            </AppText>
            <AppCard style={styles.logCard}>
              {order.timelineSteps.map((step, index) => {
                const isLast = index === order.timelineSteps.length - 1;
                const isCurrent = step.done && (isLast || !order.timelineSteps[index + 1]?.done);

                return (
                  <View key={step.label} style={styles.timelineRow}>
                    <View style={styles.timelineIndicatorColumn}>
                      <View style={[
                        styles.timelineDot,
                        step.done ? styles.timelineDotDone : styles.timelineDotPending,
                        isCurrent && styles.timelineDotCurrent
                      ]}>
                        {step.done ? (
                          <View style={styles.checkmarkInner} />
                        ) : null}
                      </View>

                      {!isLast ? (
                        <View style={[
                          styles.timelineConnector,
                          step.done && order.timelineSteps[index + 1]?.done
                            ? styles.timelineConnectorDone
                            : styles.timelineConnectorPending
                        ]} />
                      ) : null}
                    </View>

                    <View style={styles.timelineContent}>
                      <AppText weight="semibold" style={[styles.timelineLabel, !step.done && styles.timelineLabelPending]} maxFontSizeMultiplier={1.1}>
                        {step.label}
                      </AppText>
                      <AppText variant="caption" muted style={styles.timelineTime} maxFontSizeMultiplier={1.05}>
                        {step.time || (step.done ? 'Completed' : 'Pending')}
                      </AppText>
                    </View>
                  </View>
                );
              })}
            </AppCard>
          </View>

          <View style={styles.detailsSection}>
            <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
              Activity Log
            </AppText>
            <AppCard style={styles.activityCard}>
              {(() => {
                const timeline = order.timeline ?? [];
                if (!timeline.length) {
                  return <EmptyState title="No activity recorded yet" />;
                }
                const showLimit = 3;
                const hasMore = timeline.length > showLimit;
                const displayEvents = activityExpanded ? timeline : timeline.slice(0, showLimit);

                return (
                  <>
                    {displayEvents.map((event, index, arr) => {
                      const isLast = index === arr.length - 1;
                      const toneColors = {
                        green: { dot: '#10b981', bg: '#dcfce7' },
                        blue: { dot: '#2563eb', bg: '#dbeafe' },
                        red: { dot: '#ef4444', bg: '#fee2e2' },
                        slate: { dot: '#64748b', bg: '#f1f5f9' },
                      };
                      const colorsConfig = toneColors[event.tone] || toneColors.slate;

                      return (
                        <View key={`event-${index}`} style={styles.timelineRow}>
                          <View style={styles.timelineIndicatorColumn}>
                            <View style={[styles.activityDot, { backgroundColor: colorsConfig.bg, borderColor: colorsConfig.dot }]}>
                              <View style={[styles.activityDotInner, { backgroundColor: colorsConfig.dot }]} />
                            </View>
                            {!isLast ? (
                              <View style={[styles.timelineConnector, styles.timelineConnectorPending]} />
                            ) : null}
                          </View>
                          <View style={styles.timelineContent}>
                            <AppText weight="semibold" style={styles.activityEventTitle} maxFontSizeMultiplier={1.1}>
                              {event.title}
                            </AppText>
                            <AppText variant="caption" muted style={styles.timelineTime} maxFontSizeMultiplier={1.05}>
                              {event.date}
                            </AppText>
                          </View>
                        </View>
                      );
                    })}

                    {hasMore ? (
                      <Pressable
                        onPress={() => setActivityExpanded(!activityExpanded)}
                        style={{
                          marginTop: 12,
                          paddingVertical: 10,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderTopWidth: 1,
                          borderTopColor: '#f1f5f9',
                        }}
                      >
                        <AppText weight="semibold" style={styles.showMoreText} maxFontSizeMultiplier={1.05}>
                          {activityExpanded ? 'Show Less' : `Show More (${timeline.length - showLimit} more)`}
                        </AppText>
                      </Pressable>
                    ) : null}
                  </>
                );
              })()}
            </AppCard>
          </View>
        </>
      ) : null}

      <DownloadSuccessModal
        visible={downloadSuccess !== null}
        fileName={downloadSuccess?.name ?? ''}
        localUri={downloadSuccess?.localUri}
        mimeType={downloadSuccess?.mimeType}
        onClose={() => setDownloadSuccess(null)}
      />

      <Modal
        transparent
        visible={rejectModalVisible}
        animationType="fade"
        onRequestClose={() => setRejectModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.scheduleModalCard}>
            <AppText weight="bold" style={styles.scheduleModalTitle} maxFontSizeMultiplier={1.15}>
              Reject Reschedule
            </AppText>
            <AppText style={styles.scheduleModalSubtitle} maxFontSizeMultiplier={1.15}>
              Decline the notary’s preferred time and leave the current signing time available for acceptance.
            </AppText>
            <TextInput
              value={rejectNote}
              onChangeText={setRejectNote}
              placeholder="Explain why this preferred time does not work"
              multiline
              textAlignVertical="top"
              style={styles.scheduleNoteInput}
              placeholderTextColor="#94a3b8"
            />
            <View style={styles.modalActions}>
              <AppButton
                title="Cancel"
                variant="secondary"
                onPress={() => setRejectModalVisible(false)}
                disabled={respondingToSchedule}
                style={styles.modalActionButton}
              />
              <AppButton
                title={respondingToSchedule ? 'Sending...' : 'Reject'}
                variant="danger"
                onPress={() => void rejectNotaryReschedule()}
                disabled={respondingToSchedule}
                style={styles.modalActionButton}
              />
            </View>
          </View>
        </View>
      </Modal>

      <DatePickerModal
        visible={counterDatePickerVisible}
        value={counterDate}
        onClose={() => setCounterDatePickerVisible(false)}
        onChange={setCounterDate}
      />
      <TimePickerModal
        visible={counterTimePickerVisible}
        value={counterTime}
        onClose={() => setCounterTimePickerVisible(false)}
        onChange={setCounterTime}
      />

      <FeedbackModal
        visible={Boolean(feedbackModal?.visible)}
        title={feedbackModal?.title ?? ''}
        description={feedbackModal?.description ?? ''}
        variant={feedbackModal?.variant ?? 'info'}
        buttonTitle={feedbackModal?.buttonTitle ?? 'Got It'}
        onClose={() => setFeedbackModal(null)}
      />

    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  detailsMainCard: {
    marginTop: 16,
    padding: 16,
    gap: 14,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 4,
  },
  detailsOrderNum: {
    flex: 1,
    minWidth: 0,
    fontSize: 16,
    fontWeight: '700',
    color: '#0a49a8',
    lineHeight: 22,
    letterSpacing: -0.2,
  },
  detailsBadge: {
    flexShrink: 0,
  },
  detailField: { gap: 5 },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    minWidth: 0,
  },
  detailIcon: {
    width: 20,
    alignItems: 'center',
    paddingTop: 1,
  },
  detailValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: '#1e293b',
    lineHeight: 19,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricCell: {
    flex: 1,
    minWidth: 0,
  },
  rescheduleCompactCard: {
    marginTop: 10,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  rescheduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rescheduleBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#d97706',
  },
  rescheduleHeaderTitle: {
    fontSize: 13,
    color: '#92400e',
  },
  preferredTimeBanner: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  preferredTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
  },
  preferredTimeLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0a49a8',
    letterSpacing: 0.5,
  },
  preferredTimeVal: {
    fontSize: 12,
    color: '#0f172a',
    marginTop: 1,
  },
  acceptPreferredBtn: {
    backgroundColor: '#0a49a8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 0,
  },
  acceptPreferredText: {
    color: '#ffffff',
    fontSize: 12,
  },
  notaryNoteBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#fef3c7',
    borderRadius: 8,
    padding: 8,
  },
  notaryNoteLabel: {
    color: '#78350f',
  },
  notaryNoteText: {
    fontSize: 12,
    color: '#451a03',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  counterSectionTitle: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.6,
    marginTop: 2,
  },
  compactPickerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  compactPickerButton: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 9,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compactPickerText: {
    flex: 1,
    minWidth: 0,
    color: '#1e293b',
    fontSize: 12,
  },
  fullWidthProposeBtn: {
    minHeight: 38,
    borderRadius: 9,
  },
  inlineDeclineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  declineTextInput: {
    flex: 1,
    height: 38,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#ffffff',
    borderRadius: 9,
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#1e293b',
  },
  declineBtnInline: {
    minHeight: 38,
    borderRadius: 9,
    paddingHorizontal: 14,
  },
  pendingNotaryCard: {
    marginTop: 10,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  pendingNotaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pendingNotaryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  pendingNotaryTitle: {
    fontSize: 13,
    color: '#1e40af',
  },
  awaitingBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  awaitingBadgeText: {
    color: '#1d4ed8',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  pendingDetailsBox: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 10,
    padding: 10,
    gap: 4,
  },
  pendingDateText: {
    fontSize: 12,
    color: '#334155',
  },
  pendingDateVal: {
    color: '#1e293b',
  },
  pendingNoteText: {
    fontSize: 12,
    color: '#475569',
    fontStyle: 'italic',
    marginTop: 2,
  },
  scheduleInlinePanel: {
    marginTop: 10,
    gap: 10,
  },
  scheduleActionButton: {
    minHeight: 44,
    borderRadius: 12,
  },
  scheduleNoticeSuccess: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  scheduleNoticeSuccessText: {
    color: '#15803d',
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  notaryProposalNotice: {
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fff7f7',
    borderRadius: 12,
    padding: 12,
    gap: 5,
  },
  notaryProposalText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
  counterPickerGrid: {
    gap: 10,
  },
  inlinePickerButton: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: '#f8fbff',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  inlinePickerText: {
    flex: 1,
    minWidth: 0,
    color: '#1e293b',
    fontSize: 13,
  },
  flexContent: {
    flex: 1,
    minWidth: 0,
  },
  specialInstructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    backgroundColor: '#eff6ff',
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  calloutTitle: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 18,
  },
  instructionText: {
    fontSize: 13,
    color: '#1e3a8a',
    marginTop: 4,
    lineHeight: 19,
  },
  engagementCard: {
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f8fbff',
    gap: 12,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  engagementTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  engagementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 21,
    marginTop: 2,
  },
  engagementDescription: {
    marginTop: 4,
    lineHeight: 18,
  },
  confirmButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    color: colors.white,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scheduleModalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 20,
    gap: 12,
  },
  scheduleModalTitle: {
    fontSize: 20,
    lineHeight: 26,
    color: '#0f172a',
  },
  scheduleModalSubtitle: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 19,
  },
  scheduleNoteInput: {
    minHeight: 112,
    borderWidth: 1,
    borderColor: '#dbeafe',
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1e293b',
    fontSize: 13,
    lineHeight: 19,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActionButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
  },
  detailsSection: {
    marginTop: 24,
  },
  detailsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  documentUploadPanel: {
    padding: 16,
    marginBottom: 14,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 12,
  },
  documentUploadHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  documentUploadCopy: {
    flex: 1,
    minWidth: 0,
  },
  documentUploadTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#0f172a',
  },
  documentUploadSubtitle: {
    marginTop: 4,
    lineHeight: 17,
  },
  documentCountBadge: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#dbeafe',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  documentCountBadgeText: {
    fontSize: 13,
    color: '#1d4ed8',
  },
  inlineUploadButton: {
    minHeight: 46,
    borderRadius: 14,
  },
  inlineUploadButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  documentUploadHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentUploadHintDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  documentUploadHintDotActive: {
    backgroundColor: '#22c55e',
  },
  documentUploadHintDotLocked: {
    backgroundColor: '#94a3b8',
  },
  inlineUploadHint: {
    lineHeight: 16,
    flex: 1,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'stretch',
    padding: 0,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  documentMainPressable: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
  },
  documentMainPressablePressed: {
    backgroundColor: '#f8fbff',
  },
  documentCardIcon: {
    marginTop: 2,
  },
  documentTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fileCardDetails: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    marginBottom: 10,
  },
  primaryRowText: {
    fontSize: 14,
    lineHeight: 18,
    color: '#0f172a',
  },
  secondaryRowText: {
    marginTop: 2,
    lineHeight: 17,
  },
  documentName: {
    color: '#1e293b',
    fontSize: 13.5,
    lineHeight: 18,
    flex: 1,
  },
  documentMeta: {
    marginTop: 3,
    lineHeight: 17,
  },
  tapToOpenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    flexShrink: 0,
  },
  tapToOpenPillGreen: {
    backgroundColor: '#ecfdf5',
    borderColor: '#d1fae5',
  },
  tapToOpenText: {
    fontSize: 10,
    color: '#1d4ed8',
    letterSpacing: 0.35,
  },
  tapToOpenTextGreen: {
    color: '#047857',
  },
  documentChipRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  documentTypeChip: {
    borderRadius: 999,
    backgroundColor: '#eef2ff',
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  documentTypeChipGreen: {
    backgroundColor: '#ecfdf5',
  },
  documentTypeChipText: {
    fontSize: 10,
    color: '#4338ca',
    letterSpacing: 0.35,
  },
  documentTypeChipTextGreen: {
    color: '#047857',
  },
  documentTapHint: {
    lineHeight: 15,
  },
  fileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentActionRail: {
    width: 62,
    borderLeftWidth: 1,
    borderLeftColor: '#eef2f7',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fcfdff',
  },
  documentActionBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  documentActionBtnPressed: {
    transform: [{ scale: 0.97 }],
  },
  documentDownloadActionBtn: {
    backgroundColor: '#eff6ff',
    borderColor: '#dbeafe',
  },
  documentDeleteActionBtn: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  documentDeleteActionBtnPressed: {
    backgroundColor: '#ffe4e6',
    borderColor: '#fda4af',
    transform: [{ scale: 0.97 }],
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logCard: {
    paddingTop: 20,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    minHeight: 56,
  },
  timelineIndicatorColumn: {
    width: 16,
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    backgroundColor: colors.white,
  },
  timelineDotDone: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  timelineDotPending: {
    borderColor: '#cbd5e1',
    backgroundColor: colors.white,
  },
  timelineDotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  checkmarkInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  timelineConnector: {
    width: 2,
    position: 'absolute',
    top: 16,
    bottom: -16,
    zIndex: 1,
  },
  timelineConnectorDone: {
    backgroundColor: '#10b981',
  },
  timelineConnectorPending: {
    backgroundColor: '#e2e8f0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
    lineHeight: 18,
  },
  timelineLabelPending: {
    color: '#64748b',
  },
  timelineTime: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
  },
  activityCard: {
    paddingTop: 20,
    paddingBottom: 4,
    paddingHorizontal: 20,
  },
  activityDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activityDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  activityEventTitle: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 18,
  },
  showMoreText: {
    color: '#2563eb',
    fontSize: 12,
    lineHeight: 16,
  },
});
