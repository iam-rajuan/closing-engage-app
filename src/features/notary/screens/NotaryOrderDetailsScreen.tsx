import { Alert, ActivityIndicator, BackHandler, Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ArrowRight, Building, Calendar, CheckCircle2, CloudUpload, Download, FileText, Info, MapPin, MessagesSquare, RefreshCcw, Send, Trash2, UserRound } from 'lucide-react-native';
import { getDocumentDownloadUrl } from '@/services/documents.service';
import { downloadFileToDevice } from '@/utils/fileDownload';
import { DownloadSuccessModal } from '@/components/common/DownloadSuccessModal';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import { DocumentIcon } from '@/components/common/DocumentIcon';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { notaryStyles } from '@/features/notary/styles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { deleteDocument, resubmitDocument, uploadDocumentBinary } from '@/services/documents.service';
import { acceptOpenOrder, confirmPrintedDocuments, getOrderById } from '@/services/orders.service';
import { colors } from '@/theme';
import { pickDocument } from '@/utils/fileUpload';

/* ─── Detail Field (mirrored from CompanyOrderDetailsScreen) ─── */
function DetailField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
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
    </View>
  );
}

const getDocStatusToneAndLabel = (status?: string) => {
  const normalized = status?.trim().toLowerCase() ?? '';
  if (normalized === 'approved' || normalized === 'verified') {
    return { tone: 'green' as const, label: 'Accepted' };
  }
  if (normalized === 'rejected') {
    return { tone: 'red' as const, label: 'Rejected' };
  }
  if (normalized === 'submitted') {
    return { tone: 'blue' as const, label: 'Submitted' };
  }
  if (normalized.includes('pending') || normalized.includes('review')) {
    return { tone: 'orange' as const, label: 'Pending Review' };
  }
  return { tone: 'gray' as const, label: status?.trim() || 'Pending' };
};

const canDeleteDoc = (status?: string) => {
  const normalized = status?.trim().toLowerCase() ?? '';
  // Locked once approved/verified ("Accepted"); deletable while still under review.
  return !(normalized === 'approved' || normalized === 'verified');
};

const firstParam = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value);

export function NotaryOrderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string; from?: string }>();
  const orderId = firstParam(params.id) ?? '';
  const source = firstParam(params.from);
  const backTarget = source === 'home'
    ? '/notary/home'
    : source === 'notifications'
      ? '/notary/notifications'
      : '/notary/assigned';
  const handleBack = useCallback(() => {
    router.replace(backTarget);
  }, [backTarget]);
  const { data: order, loading, error, setData, reload } = useAsyncResource(() => getOrderById(orderId), [orderId], {
    cacheKey: `order:${orderId}`,
  });
  const isOpenOrder = Boolean(order?.openForAll && !order?.assignedNotaryId);
  const isOpenOrderPreview = source === 'notifications' && isOpenOrder;
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [resubmittingDocumentId, setResubmittingDocumentId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleteSuccessVisible, setDeleteSuccessVisible] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    name: string;
    localUri: string;
    mimeType: string;
  } | null>(null);
  const [resubmitSuccessVisible, setResubmitSuccessVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [showUploadSuccess, setShowUploadSuccess] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  const handleDownload = async (docId: string, name: string) => {
    try {
      setDownloadingDocId(docId);
      const url = await getDocumentDownloadUrl(docId);
      const { localUri, mimeType } = await downloadFileToDevice(url, name, 'application/pdf');
      setDownloadSuccess({ name, localUri, mimeType });
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        'Download failed',
        error instanceof Error ? error.message : 'Could not download or save this document.'
      );
    } finally {
      setDownloadingDocId(null);
    }
  };

  const handleResubmit = async (docId: string) => {
    try {
      setResubmittingDocumentId(docId);
      await resubmitDocument(docId);
      await reload();
      setResubmitSuccessVisible(true);
    } catch (error) {
      Alert.alert(
        'Unable to resubmit',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setResubmittingDocumentId(null);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    try {
      setDeletingDocumentId(docId);
      await deleteDocument(docId);
      await reload();
      setDeleteSuccessVisible(true);
      setDocumentToDelete(null);
    } catch (error) {
      Alert.alert(
        'Unable to delete',
        error instanceof Error ? error.message : 'Please try again.'
      );
    } finally {
      setDeletingDocumentId(null);
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

  const markPrinted = async () => {
    const updated = await confirmPrintedDocuments(orderId);
    setData(updated);
  };

  const browseFiles = async () => {
    const picked = await pickDocument();
    if (picked) {
      setSelectedFile({
        uri: picked.uri,
        name: picked.name,
        size: picked.size,
        mimeType: picked.mimeType,
      });
    }
  };

  const submitUpload = async () => {
    if (!order || !selectedFile) {
      Alert.alert('Select a file', 'Pick a scanback before submitting.');
      return;
    }

    setUploading(true);
    try {
      await uploadDocumentBinary({
        orderNumber: order.orderNumber,
        file: selectedFile,
      });
      setSelectedFile(null);
      await reload();
      setShowUploadSuccess(true);
    } catch (caught) {
      Alert.alert('Upload failed', caught instanceof Error ? caught.message : 'Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleAcceptOrder = async () => {
    try {
      const acceptedOrder = await acceptOpenOrder(orderId);
      if (Array.isArray((acceptedOrder as { timelineSteps?: unknown }).timelineSteps)) {
        setData(acceptedOrder as Awaited<ReturnType<typeof getOrderById>>);
      } else {
        try {
          await reload();
        } catch {
          // The order is already assigned, so a fresh detail fetch is optional here.
        }
      }
    } catch (caught) {
      Alert.alert(
        'Unable to accept order',
        caught instanceof Error ? caught.message : 'Order is accepted by another notaries.',
      );
      try {
        await reload();
      } catch {
        // If another notary claimed it, the current user may no longer have access.
      }
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.headerPadding}>
        <AppHeader 
          back 
          title="Order Details" 
          onProfilePress={() => router.push('/notary/settings')} 
          onBackPress={handleBack}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading && !order ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {!loading && !order ? <EmptyState title="Order details could not be loaded" /> : null}

        {order ? (
          <>
            {/* ── Main Details Card (mirrored from Company) ── */}
            <AppCard style={styles.detailsMainCard}>
              <View style={styles.detailsHeader}>
                <AppText style={styles.detailsOrderNum} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                  {order.orderNumber}
                </AppText>
                <Badge
                  label={isOpenOrder ? 'OPEN FOR ALL' : order.status.toUpperCase()}
                  tone={isOpenOrder ? 'blue' : order.status === 'Completed' ? 'green' : 'blue'}
                  style={styles.detailsBadge}
                />
              </View>

              <DetailField label="CLIENT" value={order.clientName} />
              <DetailField
                label="SIGNING DATE & TIME"
                value={`${order.signingDate}, ${order.signingTime || 'TBD'}`}
                icon={<Calendar color={colors.primary} size={14} />}
              />
              <DetailField
                label="PROPERTY ADDRESS"
                value={order.address}
                icon={<MapPin color={colors.primary} size={14} />}
              />
            </AppCard>

            {/* ── Special Instructions ── */}
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

            {/* ── Open Order Info ── */}
            {isOpenOrder ? (
              <AppCard style={[notaryStyles.infoStrip, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe', marginTop: 16 }]}>
                <View style={[notaryStyles.iconCircle, { backgroundColor: '#dbeafe' }]}>
                  <Info size={18} color="#2563eb" />
                </View>
                <View style={styles.flexContent}>
                  <AppText style={styles.infoLabel} maxFontSizeMultiplier={1.05}>OPEN ORDER</AppText>
                  <AppText weight="semibold" style={styles.infoValue} maxFontSizeMultiplier={1.15}>
                    First notary to accept will be assigned automatically.
                  </AppText>
                </View>
              </AppCard>
            ) : null}

            {/* ── Closing Meeting (mirrored from Company) ── */}
            {order.meeting ? (
              <AppCard style={styles.engagementCard}>
                <View style={styles.engagementTopRow}>
                  <View style={styles.engagementIconBox}>
                    <Calendar color={colors.primary} size={24} />
                  </View>
                  <View style={styles.flexContent}>
                    <AppText variant="caption" muted style={styles.engagementSub} maxFontSizeMultiplier={1.1}>
                      Closing Meeting
                    </AppText>
                    <AppText weight="semibold" style={styles.engagementTitle} maxFontSizeMultiplier={1.15}>
                      {order.meeting.date} • {order.meeting.time}
                    </AppText>
                    <AppText variant="caption" muted style={styles.engagementDescription} maxFontSizeMultiplier={1.15}>
                      {order.meeting.status === 'confirmed' ? 'Confirmed and shared with the company.' : 'Awaiting company confirmation.'}
                    </AppText>
                  </View>
                  <Badge
                    label={order.meeting.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                    tone={order.meeting.status === 'confirmed' ? 'green' : 'blue'}
                  />
                </View>
                {!isOpenOrder ? (
                  <Pressable
                    style={styles.meetingAction}
                    onPress={() => router.push(`/notary/assigned/schedule?orderId=${encodeURIComponent(order.id)}`)}
                  >
                    <AppText weight="semibold" style={styles.meetingActionText} maxFontSizeMultiplier={1.1}>
                      {order.meeting ? 'Reschedule Closing' : 'Schedule Closing'}
                    </AppText>
                    <ArrowRight size={18} color={colors.primary} />
                  </Pressable>
                ) : null}
              </AppCard>
            ) : !isOpenOrder ? (
              <AppCard style={styles.engagementCard}>
                <View style={styles.engagementTopRow}>
                  <View style={styles.engagementIconBox}>
                    <Calendar color={colors.primary} size={24} />
                  </View>
                  <View style={styles.flexContent}>
                    <AppText variant="caption" muted style={styles.engagementSub} maxFontSizeMultiplier={1.1}>
                      Closing Meeting
                    </AppText>
                    <AppText weight="semibold" style={styles.engagementTitle} maxFontSizeMultiplier={1.15}>
                      Schedule a meeting
                    </AppText>
                    <AppText variant="caption" muted style={styles.engagementDescription} maxFontSizeMultiplier={1.15}>
                      Choose a closing date and time so the company can confirm.
                    </AppText>
                  </View>
                </View>
                <Pressable
                  style={styles.meetingAction}
                  onPress={() => router.push(`/notary/assigned/schedule?orderId=${encodeURIComponent(order.id)}`)}
                >
                  <AppText weight="semibold" style={styles.meetingActionText} maxFontSizeMultiplier={1.1}>
                    Schedule Closing
                  </AppText>
                  <ArrowRight size={18} color={colors.primary} />
                </Pressable>
              </AppCard>
            ) : null}

            {/* ── Property Addresses ── */}
            <View style={styles.detailsSection}>
              <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
                Property Location
              </AppText>
              <AppCard style={styles.fileCardDetails}>
                <MapPin size={18} color="#2563eb" />
                <View style={styles.flexContent}>
                  <AppText weight="semibold" style={styles.primaryRowText} maxFontSizeMultiplier={1.15}>{order.address}</AppText>
                  <AppText variant="caption" muted style={styles.secondaryRowText} maxFontSizeMultiplier={1.1}>{order.location}</AppText>
                </View>
              </AppCard>
            </View>

            {/* ── Documents ── */}
            {!isOpenOrderPreview ? (() => {
              const companyDocs = order.documents?.filter(
                (doc) => doc.uploadedBy?.toLowerCase() === 'title company' || doc.uploadedBy?.toLowerCase() === 'admin' || !doc.uploadedBy
              ) ?? [];
              const notaryDocs = order.documents?.filter(
                (doc) => doc.uploadedBy?.toLowerCase() === 'notary'
              ) ?? [];

              return (
                <>
                  <View style={styles.detailsSection}>
                    <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
                      Title Documents
                    </AppText>
                    {companyDocs.length ? (
                      companyDocs.map((doc, i) => (
                        <AppCard key={`company-doc-${i}`} style={styles.fileCardDetails}>
                          <DocumentIcon fileName={doc.name} size={44} iconSize={20} />
                          <View style={styles.flexContent}>
                            <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                              {doc.name}
                            </AppText>
                            <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>{doc.meta} • Provided by Company</AppText>
                          </View>
                          
                          <View style={styles.rightActionContainer}>
                            {doc.status === 'Rejected' && doc.id ? (
                              <Pressable
                                style={({ pressed }) => [
                                  styles.resubmitBtn,
                                  pressed && resubmittingDocumentId !== doc.id && styles.resubmitBtnPressed,
                                ]}
                                onPress={() => void handleResubmit(doc.id!)}
                                disabled={resubmittingDocumentId !== null}
                              >
                                <View style={styles.resubmitBtnContent}>
                                  <View style={styles.resubmitBtnIconBox}>
                                    {resubmittingDocumentId === doc.id ? (
                                      <ActivityIndicator color="#c2410c" size={8} />
                                    ) : (
                                      <RefreshCcw size={8} color="#c2410c" />
                                    )}
                                  </View>
                                  <AppText weight="bold" style={styles.resubmitBtnText} maxFontSizeMultiplier={1}>
                                    Resubmit
                                  </AppText>
                                </View>
                              </Pressable>
                            ) : null}
                            {doc.id ? (
                              <Pressable
                                style={styles.downloadBtn}
                                onPress={() => void handleDownload(doc.id!, doc.name)}
                                disabled={downloadingDocId !== null}
                              >
                                {downloadingDocId === doc.id ? (
                                  <ActivityIndicator color="#2563eb" size="small" />
                                ) : (
                                  <Download color="#2563eb" size={18} />
                                )}
                              </Pressable>
                            ) : null}
                          </View>
                        </AppCard>
                      ))
                    ) : (
                      <EmptyState title="No title documents uploaded yet" />
                    )}
                  </View>

                  <View style={styles.detailsSection}>
                    <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>
                      Notary Scanbacks
                    </AppText>
                    {notaryDocs.length ? (
                      notaryDocs.map((doc, i) => (
                        <AppCard key={`notary-doc-${i}`} style={styles.fileCardDetails}>
                          <DocumentIcon fileName={doc.name} size={44} iconSize={20} />
                          <View style={styles.flexContent}>
                            <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                              {doc.name}
                            </AppText>
                            <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                              {doc.meta} • Provided by Notary
                            </AppText>
                            <View style={styles.docBadgeRow}>
                              <Badge
                                label={getDocStatusToneAndLabel(doc.status).label}
                                tone={getDocStatusToneAndLabel(doc.status).tone}
                                size="small"
                                style={styles.docBadge}
                              />
                              {doc.status === 'Rejected' && doc.id ? (
                              <Pressable
                                style={({ pressed }) => [
                                  styles.resubmitBtn,
                                  pressed && resubmittingDocumentId !== doc.id && styles.resubmitBtnPressed,
                                ]}
                                onPress={() => void handleResubmit(doc.id!)}
                                disabled={resubmittingDocumentId !== null}
                              >
                                <View style={styles.resubmitBtnContent}>
                                  <View style={styles.resubmitBtnIconBox}>
                                    {resubmittingDocumentId === doc.id ? (
                                      <ActivityIndicator color="#c2410c" size={8} />
                                    ) : (
                                      <RefreshCcw size={8} color="#c2410c" />
                                    )}
                                  </View>
                                  <AppText weight="bold" style={styles.resubmitBtnText} maxFontSizeMultiplier={1}>
                                    Resubmit
                                  </AppText>
                                </View>
                              </Pressable>
                            ) : null}
                            </View>
                          </View>

                          <View style={styles.rightActionContainer}>
                            {doc.id && canDeleteDoc(doc.status) ? (
                              <Pressable
                                style={({ pressed }) => [styles.deleteIconBtn, pressed && styles.deleteIconBtnPressed]}
                                onPress={() => setDocumentToDelete({ id: doc.id!, name: doc.name })}
                                disabled={deletingDocumentId !== null}
                              >
                                {deletingDocumentId === doc.id ? (
                                  <ActivityIndicator color="#dc2626" size="small" />
                                ) : (
                                  <Trash2 color="#dc2626" size={18} />
                                )}
                              </Pressable>
                            ) : null}
                            {doc.id ? (
                              <Pressable
                                style={styles.downloadBtn}
                                onPress={() => void handleDownload(doc.id!, doc.name)}
                                disabled={downloadingDocId !== null}
                              >
                                {downloadingDocId === doc.id ? (
                                  <ActivityIndicator color="#2563eb" size="small" />
                                ) : (
                                  <Download color="#2563eb" size={18} />
                                )}
                              </Pressable>
                            ) : null}
                          </View>
                        </AppCard>
                      ))
                    ) : (
                      <EmptyState title="No notary scanbacks uploaded yet" />
                    )}
                  </View>
                </>
              );
            })() : null}

            {/* ── Upload Scanbacks ── */}
            {!isOpenOrderPreview ? (
              <View style={styles.detailsSection}>
                <AppText weight="semibold" style={styles.detailsSectionTitle} maxFontSizeMultiplier={1.1}>Upload Scanbacks</AppText>
                
                <Pressable style={styles.uploadDropZone} onPress={() => void browseFiles()}>
                  <View style={styles.uploadIconCircle}>
                    <CloudUpload color={colors.primary} size={24} />
                  </View>
                  <AppText weight="bold" style={styles.uploadTitle} maxFontSizeMultiplier={1.1}>Select Scanbacks</AppText>
                  <AppText muted style={styles.uploadSubtitle} maxFontSizeMultiplier={1.1}>Choose a PDF, JPG, or PNG from your device</AppText>
                  <View style={styles.uploadDropZoneBtn}>
                    <AppText weight="bold" style={styles.uploadDropZoneBtnText} maxFontSizeMultiplier={1.05}>Browse Files</AppText>
                  </View>
                </Pressable>

                {selectedFile ? (
                  <AppCard style={styles.selectedFileCard}>
                    <View style={styles.selectedFileRow}>
                      <View style={styles.selectedFileIconBox}>
                        <FileText color="#dc2626" size={20} />
                      </View>
                      <View style={styles.selectedFileInfo}>
                        <AppText weight="semibold" style={styles.selectedFileName} numberOfLines={1} maxFontSizeMultiplier={1.1}>{selectedFile.name}</AppText>
                        <AppText muted style={styles.selectedFileSize} maxFontSizeMultiplier={1.05}>
                          {selectedFile.size ? `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                        </AppText>
                      </View>
                      <Pressable style={styles.selectedFileDeleteButton} onPress={() => setSelectedFile(null)}>
                        <Trash2 color="#94a3b8" size={20} />
                      </Pressable>
                    </View>
                  </AppCard>
                ) : null}
              </View>
            ) : null}

            {/* ── Action Buttons ── */}
            {isOpenOrderPreview ? (
              <View style={styles.actionsContainer}>
                <Pressable
                  style={[styles.btnHalf, styles.btnPrimary, { flex: 1 }]}
                  onPress={() => void handleAcceptOrder()}
                >
                  <Send color="#fff" size={16} />
                  <AppText weight="bold" style={styles.btnTextPrimary}>
                    Accept This Order
                  </AppText>
                </Pressable>
              </View>
            ) : !isOpenOrder ? (
              <View style={styles.actionsContainer}>
                <Pressable
                  style={[
                    styles.btnHalf,
                    order.notaryPrintedConfirmed ? styles.btnSuccessOutline : styles.btnSecondaryOutline
                  ]}
                  disabled={order.notaryPrintedConfirmed}
                  onPress={() => void markPrinted()}
                >
                  {order.notaryPrintedConfirmed ? (
                    <>
                      <CheckCircle2 color="#10b981" size={16} />
                      <AppText weight="bold" style={styles.btnTextSuccess}>
                        Printed
                      </AppText>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 color="#0a49a8" size={16} />
                      <AppText weight="bold" style={styles.btnTextSecondary}>
                        Confirm Print
                      </AppText>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={[
                    styles.btnHalf,
                    styles.btnPrimary,
                    (!selectedFile || uploading) && styles.btnDisabled
                  ]}
                  disabled={!selectedFile || uploading}
                  onPress={() => void submitUpload()}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Send color="#fff" size={16} />
                      <AppText weight="bold" style={styles.btnTextPrimary}>
                        Upload & Submit
                      </AppText>
                    </>
                  )}
                </Pressable>
              </View>
            ) : null}

            {/* ── Order Status Timeline (hidden in open-order view-only mode) ── */}
            {!isOpenOrderPreview ? (
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
            ) : null}

            {/* ── Activity Log (hidden in open-order view-only mode) ── */}
            {!isOpenOrderPreview ? (
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
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {!isOpenOrderPreview && !isOpenOrder ? (
        <Pressable
          style={notaryStyles.floatingChat}
          onPress={() => router.push(`/notary/assigned/chat?orderId=${encodeURIComponent(orderId)}`)}
        >
          <MessagesSquare color="#fff" size={24} />
          <View style={notaryStyles.onlineDotSmall} />
        </Pressable>
      ) : null}



      <DownloadSuccessModal
        visible={downloadSuccess !== null}
        fileName={downloadSuccess?.name ?? ''}
        localUri={downloadSuccess?.localUri}
        mimeType={downloadSuccess?.mimeType}
        onClose={() => setDownloadSuccess(null)}
      />

      <SuccessModal
        visible={showUploadSuccess}
        title="Upload Complete"
        description="Your scanback documents were uploaded successfully."
        onClose={() => setShowUploadSuccess(false)}
      />
      <SuccessModal
        visible={resubmitSuccessVisible}
        title="Scanback Resubmitted"
        description="Your rejected scanback was sent back for admin review."
        onClose={() => setResubmitSuccessVisible(false)}
      />
      <SuccessModal
        visible={deleteSuccessVisible}
        title="Scanback Deleted"
        description="Your scanback document was removed successfully."
        onClose={() => setDeleteSuccessVisible(false)}
      />

      <ConfirmationModal
        visible={documentToDelete !== null}
        title="Delete Scanback"
        description={
          documentToDelete
            ? `Are you sure you want to delete "${documentToDelete.name}"? This action cannot be undone.`
            : ''
        }
        confirmTitle={deletingDocumentId === documentToDelete?.id ? 'Deleting...' : 'Delete'}
        loading={deletingDocumentId === documentToDelete?.id}
        onCancel={() => setDocumentToDelete(null)}
        onConfirm={() => {
          if (!documentToDelete) return;
          void handleDeleteDocument(documentToDelete.id);
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  /* ── Main Card ── */
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
  flexContent: {
    flex: 1,
    minWidth: 0,
  },
  /* ── Special Instructions ── */
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
  infoLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
    letterSpacing: 0.8,
    color: '#94a3b8',
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
    marginTop: 2,
  },
  /* ── Engagement / Meeting Card ── */
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
  meetingAction: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  },
  meetingActionText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
  },
  /* ── Sections ── */
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
  fileCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginBottom: 10,
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  resubmitBtn: {
    minHeight: 0,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#fdba74',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  resubmitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  resubmitBtnIconBox: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resubmitBtnPressed: {
    backgroundColor: '#ffedd5',
  },
  resubmitBtnText: {
    color: '#c2410c',
    fontSize: 8,
    lineHeight: 10,
  },
  docBadgeRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    flexWrap: 'wrap',
  },
  docBadge: {
    alignSelf: 'flex-start',
  },
  headerPadding: {
    paddingHorizontal: 16,
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
    fontSize: 13,
    lineHeight: 18,
  },
  documentMeta: {
    marginTop: 3,
    lineHeight: 17,
  },
  downloadBtn: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteIconBtnPressed: {
    backgroundColor: '#fee2e2',
  },
  /* ── Timeline (mirrored from Company) ── */
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
  /* ── Activity Log ── */
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
  /* ── Upload ── */
  uploadDropZone: {
    width: '100%',
    minHeight: 150,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#bfdbfe',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#f8fbff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#0a49a8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  uploadTitle: {
    fontSize: 14,
    lineHeight: 18,
    color: '#0a49a8',
  },
  uploadSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#94a3b8',
  },
  uploadDropZoneBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  uploadDropZoneBtnText: {
    color: '#0a49a8',
    fontSize: 12,
  },
  selectedFileCard: {
    marginTop: 12,
    padding: 14,
    borderRadius: 12,
  },
  selectedFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  selectedFileIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedFileInfo: {
    flex: 1,
    gap: 2,
  },
  selectedFileName: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
  },
  selectedFileSize: {
    fontSize: 11,
    lineHeight: 16,
    color: '#94a3b8',
  },
  selectedFileDeleteButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /* ── Action Buttons ── */
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    marginBottom: 8,
  },
  btnHalf: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
  btnPrimary: {
    backgroundColor: '#0a49a8',
    borderColor: '#0a49a8',
  },
  btnDisabled: {
    backgroundColor: '#e2e8f0',
    borderColor: '#e2e8f0',
  },
  btnTextPrimary: {
    color: '#ffffff',
    fontSize: 13,
  },
  btnSecondaryOutline: {
    backgroundColor: 'transparent',
    borderColor: '#0a49a8',
  },
  btnTextSecondary: {
    color: '#0a49a8',
    fontSize: 13,
  },
  btnSuccessOutline: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  btnTextSuccess: {
    color: '#10b981',
    fontSize: 13,
  },
});
