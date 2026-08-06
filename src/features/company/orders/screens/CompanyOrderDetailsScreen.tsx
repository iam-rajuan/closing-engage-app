import { Alert, ActivityIndicator, BackHandler, Image, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import { Calendar, Clock, Download, FileText, Info, MapPin, UserRound } from 'lucide-react-native';
import { getDocumentDownloadUrl } from '@/services/documents.service';
import { downloadFileToDevice } from '@/utils/fileDownload';
import { DownloadSuccessModal } from '@/components/common/DownloadSuccessModal';
import { DocumentIcon } from '@/components/common/DocumentIcon';
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
  const [downloadSuccess, setDownloadSuccess] = useState<{
    name: string;
    localUri: string;
    mimeType: string;
  } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [respondingToSchedule, setRespondingToSchedule] = useState(false);
  const [counterDate, setCounterDate] = useState('');
  const [counterTime, setCounterTime] = useState('');
  const [rejectNote, setRejectNote] = useState('');
  const [counterDatePickerVisible, setCounterDatePickerVisible] = useState(false);
  const [counterTimePickerVisible, setCounterTimePickerVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const meeting = order?.meeting ?? null;

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

  const acceptNotaryReschedule = async () => {
    setRespondingToSchedule(true);
    try {
      const updated = await confirmOrderMeeting(orderId);
      setData(updated);
      Alert.alert('Preferred time accepted', 'The notary can now see the signing time as confirmed.');
    } catch (error) {
      Alert.alert('Unable to accept time', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setRespondingToSchedule(false);
    }
  };

  const sendCounterSchedule = async () => {
    if (!counterDate || !counterTime) {
      Alert.alert('Select date and time', 'Choose the new signing date and time before sending.');
      return;
    }

    setRespondingToSchedule(true);
    try {
      const updated = await scheduleOrderMeeting(orderId, counterDate, counterTime);
      setData(updated);
      Alert.alert('Schedule sent', 'The notary has been asked to confirm the new signing time.');
    } catch (error) {
      Alert.alert('Unable to send schedule', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setRespondingToSchedule(false);
    }
  };

  const rejectNotaryReschedule = async () => {
    if (!rejectNote.trim()) {
      Alert.alert('Add rejection note', 'Tell the notary why the preferred time does not work.');
      return;
    }

    setRespondingToSchedule(true);
    try {
      const updated = await rejectOrderMeeting(orderId, { note: rejectNote.trim() });
      setData(updated);
      setRejectModalVisible(false);
      setRejectNote('');
      Alert.alert('Reschedule rejected', 'The notary can still accept the current signing time or request another time.');
    } catch (error) {
      Alert.alert('Unable to reject reschedule', error instanceof Error ? error.message : 'Please try again.');
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
                <View style={styles.scheduleInlinePanel}>
                  <View style={styles.notaryProposalNotice}>
                    <AppText style={styles.notaryProposalText} maxFontSizeMultiplier={1.15}>
                      {meeting.rejectionNote || 'No note provided.'}
                    </AppText>
                    {meeting.preferredDate || meeting.preferredTime ? (
                      <AppText weight="semibold" style={styles.notaryProposalText} maxFontSizeMultiplier={1.15}>
                        Preferred: {[meeting.preferredDate, meeting.preferredTime].filter(Boolean).join(' at ')}
                      </AppText>
                    ) : null}
                  </View>

                  {meeting.preferredDate || meeting.preferredTime ? (
                    <AppButton
                      title={respondingToSchedule ? 'Saving...' : 'Accept Preferred Time'}
                      onPress={() => void acceptNotaryReschedule()}
                      disabled={respondingToSchedule}
                      style={styles.scheduleActionButton}
                    />
                  ) : null}

                  <View style={styles.counterPickerGrid}>
                    <Pressable style={styles.inlinePickerButton} onPress={() => setCounterDatePickerVisible(true)}>
                      <Calendar size={16} color={colors.primary} />
                      <AppText weight="semibold" style={styles.inlinePickerText} maxFontSizeMultiplier={1.1}>
                        {counterDate || 'New date'}
                      </AppText>
                    </Pressable>
                    <Pressable style={styles.inlinePickerButton} onPress={() => setCounterTimePickerVisible(true)}>
                      <Clock size={16} color={colors.primary} />
                      <AppText weight="semibold" style={styles.inlinePickerText} maxFontSizeMultiplier={1.1}>
                        {counterTime || 'New time'}
                      </AppText>
                    </Pressable>
                  </View>
                  <AppButton
                    title={respondingToSchedule ? 'Sending...' : 'Send New Time'}
                    onPress={() => void sendCounterSchedule()}
                    disabled={respondingToSchedule}
                    style={styles.scheduleActionButton}
                  />
                  <AppButton
                    title="Reject Reschedule"
                    variant="secondary"
                    onPress={() => setRejectModalVisible(true)}
                    disabled={respondingToSchedule}
                    style={styles.scheduleActionButton}
                  />
                </View>
              ) : null}
            </DetailField>
            <DetailField
              label="ORDER PRICE"
              value={
                typeof order.price === 'number'
                  ? `$${order.price.toFixed(2)}`
                  : order.price
                    ? `$${Number(order.price).toFixed(2)}`
                    : 'Not set'
              }
            />
            <DetailField label="STATE" value={order.state || 'Not set'} />
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
                  {companyDocs.length ? (
                    companyDocs.map((document, index) => (
                      <AppCard key={`company-doc-${index}`} style={styles.fileCardDetails}>
                        <DocumentIcon fileName={document.name} size={44} iconSize={20} />
                        <View style={styles.flexContent}>
                          <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                            {document.name}
                          </AppText>
                          <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                            {document.meta} • Provided by Company
                          </AppText>
                        </View>
                        {document.id ? (
                          <Pressable
                            style={styles.downloadBtn}
                            onPress={() => void handleDownload(document.id!, document.name)}
                            disabled={downloadingDocId !== null}
                          >
                            {downloadingDocId === document.id ? (
                              <ActivityIndicator color="#2563eb" size="small" />
                            ) : (
                              <Download color="#2563eb" size={18} />
                            )}
                          </Pressable>
                        ) : (
                          <AppText variant="caption" muted>Available in Documents</AppText>
                        )}
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
                      <AppCard key={`notary-doc-${index}`} style={styles.fileCardDetails}>
                        <DocumentIcon fileName={document.name} size={44} iconSize={20} />
                        <View style={styles.flexContent}>
                          <AppText weight="semibold" numberOfLines={1} ellipsizeMode="middle" style={styles.documentName} maxFontSizeMultiplier={1.1}>
                            {document.name}
                          </AppText>
                          <AppText variant="caption" muted style={styles.documentMeta} numberOfLines={1} maxFontSizeMultiplier={1.05}>
                            {document.meta} • Provided by Notary
                          </AppText>
                        </View>
                        {document.id ? (
                          <Pressable
                            style={styles.downloadBtn}
                            onPress={() => void handleDownload(document.id!, document.name)}
                            disabled={downloadingDocId !== null}
                          >
                            {downloadingDocId === document.id ? (
                              <ActivityIndicator color="#2563eb" size="small" />
                            ) : (
                              <Download color="#2563eb" size={18} />
                            )}
                          </Pressable>
                        ) : (
                          <AppText variant="caption" muted>Available in Documents</AppText>
                        )}
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
    fontSize: 13,
    lineHeight: 18,
  },
  documentMeta: {
    marginTop: 3,
    lineHeight: 17,
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
    marginLeft: 8,
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
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
