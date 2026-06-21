import { Alert, ActivityIndicator, BackHandler, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ArrowRight, Building, Calendar, CheckCircle2, ChevronLeft, CloudUpload, Download, FileText, Info, MapPin, MessageCircle, Send, Trash2, UserRound } from 'lucide-react-native';
import { getDocumentDownloadUrl } from '@/services/documents.service';
import { downloadFileToDevice } from '@/utils/fileDownload';
import { DownloadSuccessModal } from '@/components/common/DownloadSuccessModal';
import { DocumentIcon } from '@/components/common/DocumentIcon';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { notaryStyles } from '@/features/notary/styles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { uploadDocumentBinary } from '@/services/documents.service';
import { acceptOpenOrder, confirmPrintedDocuments, getOrderById } from '@/services/orders.service';
import { colors } from '@/theme';
import { pickDocument } from '@/utils/fileUpload';

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
  const { data: order, loading, error, setData, reload } = useAsyncResource(() => getOrderById(orderId), [orderId]);
  const isOpenOrder = Boolean(order?.openForAll && !order?.assignedNotaryId);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    name: string;
    localUri: string;
    mimeType: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);

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

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

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
      Alert.alert('Upload complete', 'Your scanback was uploaded successfully.');
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
      Alert.alert('Order accepted', 'This order is now assigned to you.');
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
    <ScreenContainer scroll refreshing={refreshing} onRefresh={() => void handleRefresh()} contentStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={notaryStyles.detailsHeader}>
          <Pressable onPress={handleBack}><ChevronLeft color="#0a49a8" size={24} /></Pressable>
          <AppText weight="semibold" style={styles.headerTitle} maxFontSizeMultiplier={1.1}>Order Details</AppText>
          <Badge
            label={isOpenOrder ? 'OPEN FOR ALL' : (order?.status || 'ASSIGNED').toUpperCase()}
            tone="blue"
            style={styles.headerBadge}
          />
        </View>

        {loading && !order ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}

        {order ? (
          <>
            <View style={{ marginTop: 16 }}>
              <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>WORKFLOW PROGRESS</AppText>
              <AppCard style={{ padding: 16 }}>
                {order.timelineSteps.map((item, i) => (
                  <View key={item.label} style={notaryStyles.timelineItem}>
                    <View style={notaryStyles.timelineLeft}>
                      <View style={[notaryStyles.timelineDot, item.done && { backgroundColor: '#1d4ed8' }]}>
                        {item.done && <CheckCircle2 color="#fff" size={14} />}
                      </View>
                      {i < order.timelineSteps.length - 1 && <View style={notaryStyles.timelineLine} />}
                    </View>
                    <View style={styles.timelineStepContent}>
                      <AppText weight="semibold" style={[styles.timelineTitle, item.done ? styles.timelineTitleDone : styles.timelineTitlePending]} maxFontSizeMultiplier={1.1}>{item.label}</AppText>
                      <AppText variant="caption" muted style={styles.timelineMeta} maxFontSizeMultiplier={1.05}>{item.time}</AppText>
                    </View>
                  </View>
                ))}
              </AppCard>
            </View>

            <View style={{ marginTop: 16 }}>
              <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>ACTIVITY LOG</AppText>
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
                                <View style={styles.timelineConnector} />
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

            <View style={{ marginTop: 16, gap: 10 }}>
              {isOpenOrder ? (
                <AppCard style={[notaryStyles.infoStrip, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <View style={[notaryStyles.iconCircle, { backgroundColor: '#dbeafe' }]}>
                    <Info size={18} color="#2563eb" />
                  </View>
                  <View style={styles.flexContent}>
                    <AppText variant="caption" muted weight="bold" style={styles.infoLabel} maxFontSizeMultiplier={1.05}>OPEN ORDER</AppText>
                    <AppText weight="semibold" style={styles.infoValue} maxFontSizeMultiplier={1.15}>
                      First notary to accept will be assigned automatically.
                    </AppText>
                  </View>
                </AppCard>
              ) : null}
              <AppCard style={notaryStyles.infoStrip}>
                <View style={[notaryStyles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                  <UserRound size={18} color="#2563eb" />
                </View>
                <View style={styles.flexContent}>
                  <AppText variant="caption" muted weight="bold" style={styles.infoLabel} maxFontSizeMultiplier={1.05}>CLIENT</AppText>
                  <AppText weight="semibold" style={styles.infoValue} maxFontSizeMultiplier={1.15}>{order.clientName}</AppText>
                </View>
              </AppCard>
              <AppCard style={notaryStyles.infoStrip}>
                <View style={[notaryStyles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                  <Calendar size={18} color="#2563eb" />
                </View>
                <View style={styles.flexContent}>
                  <AppText variant="caption" muted weight="bold" style={styles.infoLabel} maxFontSizeMultiplier={1.05}>SIGNING SCHEDULE</AppText>
                  <AppText weight="semibold" style={styles.infoValue} maxFontSizeMultiplier={1.15}>
                    {order.meeting?.date || order.signingDate} at {order.meeting?.time || order.signingTime || 'TBD'}
                  </AppText>
                </View>
              </AppCard>
            </View>

            <View style={{ marginTop: 16 }}>
              <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>PROPERTY ADDRESSES</AppText>
              <AppCard style={{ padding: 14, gap: 12 }}>
                <View style={styles.addressRow}>
                  <MapPin size={18} color="#2563eb" />
                  <AppText weight="semibold" style={styles.addressValue} maxFontSizeMultiplier={1.15}>{order.address}</AppText>
                </View>
                <View style={styles.addressRow}>
                  <Building size={18} color="#2563eb" />
                  <AppText weight="semibold" style={styles.addressValue} maxFontSizeMultiplier={1.15}>{order.location}</AppText>
                </View>
              </AppCard>
            </View>

            <AppCard style={styles.meetingCard}>
              <View style={styles.meetingHeader}>
                <View>
                  <AppText variant="caption" muted weight="bold" style={styles.meetingEyebrow} maxFontSizeMultiplier={1.05}>CLOSING MEETING</AppText>
                  <AppText weight="semibold" style={styles.meetingTitle} maxFontSizeMultiplier={1.1}>
                    {order.meeting ? (order.meeting.status === 'confirmed' ? 'Meeting Confirmed' : 'Awaiting Company Confirmation') : 'Schedule a meeting'}
                  </AppText>
                </View>
                {order.meeting ? (
                  <Badge
                    label={order.meeting.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                    tone={order.meeting.status === 'confirmed' ? 'green' : 'blue'}
                  />
                ) : null}
              </View>
              <AppText style={styles.meetingBody} maxFontSizeMultiplier={1.15}>
                {order.meeting
                  ? `${order.meeting.date} at ${order.meeting.time}`
                  : 'Choose a closing date and time so the company user can confirm this meeting.'}
              </AppText>
              <Pressable
                style={[styles.meetingAction, isOpenOrder && styles.meetingActionDisabled]}
                disabled={isOpenOrder}
                onPress={() => router.push(`/notary/assigned/schedule?orderId=${encodeURIComponent(order.id)}`)}
              >
                <AppText weight="semibold" style={styles.meetingActionText} maxFontSizeMultiplier={1.1}>
                  {isOpenOrder ? 'Accept order to schedule closing' : order.meeting ? 'Reschedule Closing' : 'Schedule Closing'}
                </AppText>
                {!isOpenOrder ? <ArrowRight size={18} color={colors.primary} /> : null}
              </Pressable>
            </AppCard>

            {order.instructions ? (
              <AppCard style={{ backgroundColor: '#f8fafc', padding: 16, marginTop: 12 }}>
                <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>SPECIAL INSTRUCTIONS</AppText>
                <AppText style={styles.instructionsText} maxFontSizeMultiplier={1.15}>{order.instructions}</AppText>
              </AppCard>
            ) : null}

            {(() => {
              const companyDocs = order.documents?.filter(
                (doc) => doc.uploadedBy?.toLowerCase() === 'title company' || doc.uploadedBy?.toLowerCase() === 'admin' || !doc.uploadedBy
              ) ?? [];
              const notaryDocs = order.documents?.filter(
                (doc) => doc.uploadedBy?.toLowerCase() === 'notary'
              ) ?? [];

              return (
                <>
                  <View style={{ marginTop: 16 }}>
                    <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>TITLE DOCUMENTS</AppText>
                    <AppCard style={{ padding: 0 }}>
                      {companyDocs.length ? (
                        companyDocs.map((doc, i) => (
                          <View key={`company-doc-${i}`} style={[notaryStyles.docItem, i > 0 && { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                            <DocumentIcon fileName={doc.name} size={36} iconSize={18} />
                            <View style={styles.flexContent}>
                              <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                                {doc.name}
                              </AppText>
                              <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>{doc.meta} • Provided by Company</AppText>
                            </View>
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
                            ) : (
                              <AppText variant="caption" muted>Documents list</AppText>
                            )}
                          </View>
                        ))
                      ) : (
                        <View style={{ padding: 16 }}>
                          <EmptyState title="No title documents uploaded yet" />
                        </View>
                      )}
                    </AppCard>
                  </View>

                  <View style={{ marginTop: 16 }}>
                    <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>NOTARY SCANBACKS</AppText>
                    <AppCard style={{ padding: 0 }}>
                      {notaryDocs.length ? (
                        notaryDocs.map((doc, i) => (
                          <View key={`notary-doc-${i}`} style={[notaryStyles.docItem, i > 0 && { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                            <DocumentIcon fileName={doc.name} size={36} iconSize={18} />
                            <View style={styles.flexContent}>
                              <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                                {doc.name}
                              </AppText>
                              <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>{doc.meta} • Provided by Notary</AppText>
                            </View>
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
                            ) : (
                              <AppText variant="caption" muted>Documents list</AppText>
                            )}
                          </View>
                        ))
                      ) : (
                        <View style={{ padding: 16 }}>
                          <EmptyState title="No notary scanbacks uploaded yet" />
                        </View>
                      )}
                    </AppCard>
                  </View>
                </>
              );
            })()}

            {!isOpenOrder ? (
              <View style={{ marginTop: 16 }}>
                <AppText variant="caption" muted weight="bold" style={styles.sectionEyebrow} maxFontSizeMultiplier={1.05}>UPLOAD SCANBACKS</AppText>
                <AppCard style={styles.uploadCard}>
                  <Pressable style={styles.uploadDropZone} onPress={() => void browseFiles()}>
                    <View style={styles.uploadIconCircle}>
                      <CloudUpload color={colors.primary} size={28} />
                    </View>
                    <AppText weight="semibold" style={styles.uploadTitle} maxFontSizeMultiplier={1.1}>Select Scanbacks</AppText>
                    <AppText muted style={styles.uploadSubtitle} maxFontSizeMultiplier={1.1}>Choose a PDF, JPG, or PNG from your device</AppText>
                  </Pressable>

                  <Pressable style={styles.uploadBrowseButton} onPress={() => void browseFiles()}>
                    <AppText weight="semibold" style={styles.uploadBrowseButtonText} maxFontSizeMultiplier={1.05}>Browse Files</AppText>
                  </Pressable>
                </AppCard>

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

            {isOpenOrder ? (
              <AppButton
                title="Accept This Order"
                icon={<Send color="#fff" size={16} />}
                style={{ marginTop: 24, backgroundColor: '#0a49a8', height: 46 }}
                onPress={() => void handleAcceptOrder()}
              />
            ) : (
              <>
                <AppButton
                  title={uploading ? 'Uploading...' : 'Upload & Submit'}
                  icon={<Send color="#fff" size={16} />}
                  style={{ marginTop: 24, backgroundColor: '#0a49a8', height: 46 }}
                  onPress={() => void submitUpload()}
                />
                <AppButton
                  title={order.notaryPrintedConfirmed ? 'Printed Confirmed' : 'Confirm Printed Documents'}
                  icon={<Send color="#fff" size={16} />}
                  style={{ marginTop: 12, backgroundColor: '#0a49a8', height: 46 }}
                  onPress={() => void markPrinted()}
                />
              </>
            )}
          </>
        ) : null}


      {!isOpenOrder ? (
        <Pressable
          style={notaryStyles.floatingChat}
          onPress={() => router.push(`/notary/assigned/chat?orderId=${encodeURIComponent(orderId)}`)}
        >
          <MessageCircle color="#fff" size={24} />
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    color: '#0f172a',
    lineHeight: 20,
    textAlign: 'center',
  },
  headerBadge: {
    paddingHorizontal: 12,
    flexShrink: 0,
  },
  sectionEyebrow: {
    letterSpacing: 1,
    marginBottom: 12,
    fontSize: 10,
    lineHeight: 14,
  },
  flexContent: {
    flex: 1,
    minWidth: 0,
  },
  timelineStepContent: {
    flex: 1,
    minWidth: 0,
    paddingBottom: 24,
  },
  timelineTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  timelineTitleDone: {
    color: '#0f172a',
  },
  timelineTitlePending: {
    color: '#94a3b8',
  },
  timelineMeta: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  infoLabel: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.8,
  },
  infoValue: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
    marginTop: 2,
  },
  addressRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  addressValue: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  meetingCard: {
    marginTop: 18,
    padding: 16,
    backgroundColor: '#f8fbff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    gap: 10,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  meetingEyebrow: {
    letterSpacing: 1,
    fontSize: 10,
    lineHeight: 14,
  },
  meetingTitle: {
    fontSize: 14,
    color: '#0f172a',
    marginTop: 4,
    lineHeight: 19,
  },
  meetingBody: {
    fontSize: 13,
    lineHeight: 19,
    color: '#475569',
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
  meetingActionDisabled: {
    opacity: 0.7,
  },
  meetingActionText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.primary,
  },
  instructionsText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 19,
  },
  documentName: {
    fontSize: 13,
    lineHeight: 18,
    color: '#1e293b',
  },
  documentMeta: {
    marginTop: 2,
    lineHeight: 16,
  },
  uploadCard: {
    padding: 16,
    borderRadius: 14,
    gap: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  uploadDropZone: {
    width: '100%',
    minHeight: 130,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#cbd5e1',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fbff',
    paddingVertical: 20,
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
    color: '#0f172a',
  },
  uploadSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#94a3b8',
  },
  uploadBrowseButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#0a49a8',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBrowseButtonText: {
    color: '#fff',
    fontSize: 13,
    lineHeight: 18,
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
  downloadBtn: {
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityCard: {
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
  timelineConnector: {
    width: 2,
    position: 'absolute',
    top: 16,
    bottom: -16,
    zIndex: 1,
    backgroundColor: '#e2e8f0',
  },
  timelineContent: {
    flex: 1,
    paddingBottom: 16,
  },
  timelineTime: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 16,
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
