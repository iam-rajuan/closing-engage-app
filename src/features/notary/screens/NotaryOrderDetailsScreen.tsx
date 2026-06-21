import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ArrowRight, Building, Calendar, CheckCircle2, ChevronLeft, CloudUpload, Download, FileText, Info, MapPin, MessageCircle, Send, Trash2, UserRound } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { getDocumentDownloadUrl } from '@/services/documents.service';
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

export function NotaryOrderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = params.id ?? '';
  const { data: order, loading, error, setData, reload } = useAsyncResource(() => getOrderById(orderId), [orderId]);
  const isOpenOrder = Boolean(order?.openForAll && !order?.assignedNotaryId);
  const [selectedFile, setSelectedFile] = useState<{
    uri: string;
    name: string;
    mimeType?: string;
    size?: number;
  } | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleDownload = async (docId: string, name: string) => {
    try {
      const url = await getDocumentDownloadUrl(docId);
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert('Download failed', 'Could not retrieve download URL for this document.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
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
    <ScreenContainer scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={notaryStyles.detailsHeader}>
          <Pressable onPress={() => router.back()}><ChevronLeft color="#0a49a8" size={24} /></Pressable>
          <AppText weight="bold" style={{ fontSize: 15, color: '#0f172a' }}>Order Details</AppText>
          <Badge
            label={isOpenOrder ? 'OPEN FOR ALL' : (order?.status || 'ASSIGNED').toUpperCase()}
            tone="blue"
            style={{ paddingHorizontal: 12 }}
          />
        </View>

        {loading && !order ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}

        {order ? (
          <>
            <View style={{ marginTop: 16 }}>
              <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>WORKFLOW PROGRESS</AppText>
              <AppCard style={{ padding: 16 }}>
                {order.timelineSteps.map((item, i) => (
                  <View key={item.label} style={notaryStyles.timelineItem}>
                    <View style={notaryStyles.timelineLeft}>
                      <View style={[notaryStyles.timelineDot, item.done && { backgroundColor: '#1d4ed8' }]}>
                        {item.done && <CheckCircle2 color="#fff" size={14} />}
                      </View>
                      {i < order.timelineSteps.length - 1 && <View style={notaryStyles.timelineLine} />}
                    </View>
                    <View style={{ flex: 1, paddingBottom: 24 }}>
                      <AppText weight="bold" style={{ fontSize: 14, color: item.done ? '#0f172a' : '#94a3b8' }}>{item.label}</AppText>
                      <AppText variant="caption" muted style={{ fontSize: 12, marginTop: 2 }}>{item.time}</AppText>
                    </View>
                  </View>
                ))}
              </AppCard>
            </View>

            <View style={{ marginTop: 16, gap: 10 }}>
              {isOpenOrder ? (
                <AppCard style={[notaryStyles.infoStrip, { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }]}>
                  <View style={[notaryStyles.iconCircle, { backgroundColor: '#dbeafe' }]}>
                    <Info size={18} color="#2563eb" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="caption" muted weight="bold">OPEN ORDER</AppText>
                    <AppText weight="bold" style={{ fontSize: 14, color: '#0f172a' }}>
                      First notary to accept will be assigned automatically.
                    </AppText>
                  </View>
                </AppCard>
              ) : null}
              <AppCard style={notaryStyles.infoStrip}>
                <View style={[notaryStyles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                  <UserRound size={18} color="#2563eb" />
                </View>
                <View>
                  <AppText variant="caption" muted weight="bold">CLIENT</AppText>
                  <AppText weight="bold" style={{ fontSize: 14, color: '#0f172a' }}>{order.clientName}</AppText>
                </View>
              </AppCard>
              <AppCard style={notaryStyles.infoStrip}>
                <View style={[notaryStyles.iconCircle, { backgroundColor: '#eff6ff' }]}>
                  <Calendar size={18} color="#2563eb" />
                </View>
                <View>
                  <AppText variant="caption" muted weight="bold">SIGNING SCHEDULE</AppText>
                  <AppText weight="bold" style={{ fontSize: 14, color: '#0f172a' }}>
                    {order.meeting?.date || order.signingDate} at {order.meeting?.time || order.signingTime || 'TBD'}
                  </AppText>
                </View>
              </AppCard>
            </View>

            <View style={{ marginTop: 16 }}>
              <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>PROPERTY ADDRESSES</AppText>
              <AppCard style={{ padding: 14, gap: 12 }}>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <MapPin size={18} color="#2563eb" />
                  <AppText weight="bold" style={{ color: '#334155', fontSize: 14 }}>{order.address}</AppText>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Building size={18} color="#2563eb" />
                  <AppText weight="bold" style={{ color: '#334155', fontSize: 14 }}>{order.location}</AppText>
                </View>
              </AppCard>
            </View>

            <AppCard style={styles.meetingCard}>
              <View style={styles.meetingHeader}>
                <View>
                  <AppText variant="caption" muted weight="bold" style={styles.meetingEyebrow}>CLOSING MEETING</AppText>
                  <AppText weight="bold" style={styles.meetingTitle}>
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
              <AppText style={styles.meetingBody}>
                {order.meeting
                  ? `${order.meeting.date} at ${order.meeting.time}`
                  : 'Choose a closing date and time so the company user can confirm this meeting.'}
              </AppText>
              <Pressable
                style={[styles.meetingAction, isOpenOrder && styles.meetingActionDisabled]}
                disabled={isOpenOrder}
                onPress={() => router.push(`/notary/assigned/schedule?orderId=${encodeURIComponent(order.id)}`)}
              >
                <AppText weight="bold" style={styles.meetingActionText}>
                  {isOpenOrder ? 'Accept order to schedule closing' : order.meeting ? 'Reschedule Closing' : 'Schedule Closing'}
                </AppText>
                {!isOpenOrder ? <ArrowRight size={18} color={colors.primary} /> : null}
              </Pressable>
            </AppCard>

            {order.instructions ? (
              <AppCard style={{ backgroundColor: '#f8fafc', padding: 16, marginTop: 12 }}>
                <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>SPECIAL INSTRUCTIONS</AppText>
                <AppText style={{ fontSize: 14, color: '#475569', lineHeight: 22 }}>{order.instructions}</AppText>
              </AppCard>
            ) : null}

            <View style={{ marginTop: 16 }}>
              <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>PROVIDED DOCUMENTS</AppText>
              <AppCard style={{ padding: 0 }}>
                {order.documents?.length ? (
                  order.documents.map((doc, i) => (
                    <View key={`${doc.name}-${i}`} style={[notaryStyles.docItem, i > 0 && { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                      <View style={[notaryStyles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                        <FileText size={18} color="#ef4444" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText weight="bold" numberOfLines={1} ellipsizeMode="middle" style={{ fontSize: 14, color: '#1e293b' }}>
                          {doc.name}
                        </AppText>
                        <AppText variant="caption" muted>{doc.meta}</AppText>
                      </View>
                      {doc.id ? (
                        <Pressable
                          style={styles.downloadBtn}
                          onPress={() => void handleDownload(doc.id!, doc.name)}
                        >
                          <Download color="#2563eb" size={18} />
                        </Pressable>
                      ) : (
                        <AppText variant="caption" muted>Documents list</AppText>
                      )}
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 16 }}>
                    <EmptyState title="No order documents yet" />
                  </View>
                )}
              </AppCard>
            </View>

            {!isOpenOrder ? (
              <View style={{ marginTop: 16 }}>
                <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>UPLOAD SCANBACKS</AppText>
                <AppCard style={styles.uploadCard}>
                  <Pressable style={styles.uploadDropZone} onPress={() => void browseFiles()}>
                    <View style={styles.uploadIconCircle}>
                      <CloudUpload color={colors.primary} size={28} />
                    </View>
                    <AppText weight="bold" style={styles.uploadTitle}>Select Scanbacks</AppText>
                    <AppText muted style={styles.uploadSubtitle}>Choose a PDF, JPG, or PNG from your device</AppText>
                  </Pressable>

                  <Pressable style={styles.uploadBrowseButton} onPress={() => void browseFiles()}>
                    <AppText weight="bold" style={styles.uploadBrowseButtonText}>Browse Files</AppText>
                  </Pressable>
                </AppCard>

                {selectedFile ? (
                  <AppCard style={styles.selectedFileCard}>
                    <View style={styles.selectedFileRow}>
                      <View style={styles.selectedFileIconBox}>
                        <FileText color="#dc2626" size={20} />
                      </View>
                      <View style={styles.selectedFileInfo}>
                        <AppText weight="bold" style={styles.selectedFileName}>{selectedFile.name}</AppText>
                        <AppText muted style={styles.selectedFileSize}>
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
      </ScrollView>

      {!isOpenOrder ? (
        <Pressable
          style={notaryStyles.floatingChat}
          onPress={() => router.push(`/notary/assigned/chat?orderId=${encodeURIComponent(orderId)}`)}
        >
          <MessageCircle color="#fff" size={24} />
          <View style={notaryStyles.onlineDotSmall} />
        </Pressable>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 11,
  },
  meetingTitle: {
    fontSize: 15,
    color: '#0f172a',
    marginTop: 4,
  },
  meetingBody: {
    fontSize: 14,
    lineHeight: 20,
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
    fontSize: 14,
    color: colors.primary,
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
    fontSize: 15,
    color: '#0f172a',
  },
  uploadSubtitle: {
    fontSize: 13,
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
    fontSize: 14,
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
    fontSize: 14,
    color: '#0f172a',
  },
  selectedFileSize: {
    fontSize: 12,
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
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
