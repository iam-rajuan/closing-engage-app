import { Alert, ActivityIndicator, BackHandler, Image, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Calendar, Download, FileText, Info, MapPin, UserRound } from 'lucide-react-native';
import { getDocumentDownloadUrl } from '@/services/documents.service';
import { downloadFileToDevice } from '@/utils/fileDownload';
import { DownloadSuccessModal } from '@/components/common/DownloadSuccessModal';
import { SuccessModal } from '@/components/common/SuccessModal';
import { DocumentIcon } from '@/components/common/DocumentIcon';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { confirmOrderMeeting, getOrderById } from '@/services/orders.service';
import { colors } from '@/theme';

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
  const [isConfirmingMeeting, setIsConfirmingMeeting] = useState(false);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<{
    name: string;
    localUri: string;
    mimeType: string;
  } | null>(null);
  const [showMeetingConfirmed, setShowMeetingConfirmed] = useState(false);
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
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        handleBack();
        return true;
      });

      return () => subscription.remove();
    }, [handleBack]),
  );

  const confirmMeeting = async () => {
    if (!orderId) return;
    setIsConfirmingMeeting(true);
    try {
      const updated = await confirmOrderMeeting(orderId);
      setData(updated);
      setShowMeetingConfirmed(true);
    } catch (caught) {
      Alert.alert('Unable to confirm meeting', caught instanceof Error ? caught.message : 'Please try again.');
    } finally {
      setIsConfirmingMeeting(false);
    }
  };

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
            />
            <DetailField label="ORDER PRICE" value={typeof order.price === 'number' ? `$${order.price.toFixed(2)}` : 'Not set'} />
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
                    {order.meeting.status === 'confirmed' ? 'Confirmed and shared with the notary.' : 'The notary scheduled this meeting. Confirm it to notify them instantly.'}
                  </AppText>
                </View>
                <Badge
                  label={order.meeting.status === 'confirmed' ? 'CONFIRMED' : 'PENDING'}
                  tone={order.meeting.status === 'confirmed' ? 'green' : 'blue'}
                />
              </View>
              {order.meeting.status === 'scheduled' ? (
                <Pressable style={styles.confirmButton} onPress={() => void confirmMeeting()} disabled={isConfirmingMeeting}>
                  <AppText weight="semibold" style={styles.confirmButtonText} maxFontSizeMultiplier={1.1}>
                    {isConfirmingMeeting ? 'Confirming...' : 'Confirm Meeting'}
                  </AppText>
                </Pressable>
              ) : null}
            </AppCard>
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

      <SuccessModal
        visible={showMeetingConfirmed}
        title="Meeting Confirmed"
        description="The notary has been notified that this closing is now confirmed and finalized."
        buttonTitle="Done"
        onClose={() => setShowMeetingConfirmed(false)}
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
