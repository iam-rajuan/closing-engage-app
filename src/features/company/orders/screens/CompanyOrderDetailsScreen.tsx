import { Alert, Image, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Calendar, Download, FileText, Info, MapPin, UserRound } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { getDocumentDownloadUrl } from '@/services/documents.service';
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
      <AppText variant="caption" muted style={styles.detailLabel}>{label}</AppText>
      <View style={styles.detailValueRow}>
        {icon && <View style={styles.detailIcon}>{icon}</View>}
        <AppText weight="bold" style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  );
}

export function CompanyOrderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = params.id ?? '';
  const { data: order, loading, error, reload, setData } = useAsyncResource(
    () => getOrderById(orderId),
    [orderId],
  );
  const [isConfirmingMeeting, setIsConfirmingMeeting] = useState(false);

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

  const confirmMeeting = async () => {
    if (!orderId) return;
    setIsConfirmingMeeting(true);
    try {
      const updated = await confirmOrderMeeting(orderId);
      setData(updated);
      Alert.alert('Meeting confirmed', 'The notary has been notified that this closing is now confirmed.');
    } catch (caught) {
      Alert.alert('Unable to confirm meeting', caught instanceof Error ? caught.message : 'Please try again.');
    } finally {
      setIsConfirmingMeeting(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <AppHeader back title="Order Details" onProfilePress={() => router.push('/company/settings')} />

      {loading && !order ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}
      {!loading && !order ? <EmptyState title="Order details could not be loaded" /> : null}

      {order ? (
        <>
          <AppCard style={styles.detailsMainCard}>
            <View style={styles.detailsHeader}>
              <AppText style={styles.detailsOrderNum}>{order.orderNumber}</AppText>
              <Badge label={order.status.toUpperCase()} tone={order.status === 'Completed' ? 'green' : 'blue'} />
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

          {order.instructions ? (
            <View style={styles.specialInstructionBox}>
              <Info color={colors.primary} size={18} />
              <View style={{ flex: 1 }}>
                <AppText weight="bold" style={{ color: colors.primary }}>Special Instructions</AppText>
                <AppText style={styles.instructionText}>{order.instructions}</AppText>
              </View>
            </View>
          ) : null}

          {order.meeting ? (
            <AppCard style={styles.engagementCard}>
              <View style={styles.engagementTopRow}>
                <View style={styles.engagementIconBox}>
                  <Calendar color={colors.primary} size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="caption" muted style={styles.engagementSub}>Closing Meeting</AppText>
                  <AppText weight="bold" style={styles.engagementTitle}>
                    {order.meeting.date} • {order.meeting.time}
                  </AppText>
                  <AppText variant="caption" muted>
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
                  <AppText weight="bold" style={styles.confirmButtonText}>{isConfirmingMeeting ? 'Confirming...' : 'Confirm Meeting'}</AppText>
                </Pressable>
              ) : null}
            </AppCard>
          ) : null}

          <View style={styles.detailsSection}>
            <AppText weight="bold" style={styles.detailsSectionTitle}>Assigned Notary</AppText>
            <AppCard style={styles.fileCardDetails}>
              {order.assignedNotaryId && order.notaryAvatarUrl ? (
                <Image source={{ uri: order.notaryAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarFallback}>
                  <UserRound color="#2563eb" size={20} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <AppText weight="bold">{order.notaryName || 'Not assigned yet'}</AppText>
                <AppText variant="caption" muted>{order.assignedNotaryId ? 'Assigned' : 'Pending assignment'}</AppText>
              </View>
            </AppCard>
          </View>

          <View style={styles.detailsSection}>
            <AppText weight="bold" style={styles.detailsSectionTitle}>Documents</AppText>
            {order.documents?.length ? (
              order.documents.map((document, index) => (
                <AppCard key={`${document.name}-${index}`} style={styles.fileCardDetails}>
                  <View style={styles.fileIconBox}><FileText color="#dc2626" size={20} /></View>
                  <View style={{ flex: 1 }}>
                    <AppText weight="bold" numberOfLines={1} ellipsizeMode="middle" style={{ color: '#1e293b' }}>
                      {document.name}
                    </AppText>
                    <AppText variant="caption" muted>{document.meta}</AppText>
                  </View>
                  {document.id ? (
                    <Pressable
                      style={styles.downloadBtn}
                      onPress={() => void handleDownload(document.id!, document.name)}
                    >
                      <Download color="#2563eb" size={18} />
                    </Pressable>
                  ) : (
                    <AppText variant="caption" muted>Available in Documents</AppText>
                  )}
                </AppCard>
              ))
            ) : (
              <EmptyState title="No documents attached yet" />
            )}
          </View>

          <View style={styles.detailsSection}>
            <AppText weight="bold" style={styles.detailsSectionTitle}>Order Status</AppText>
            <AppCard style={styles.logCard}>
              {order.timelineSteps.map((step) => (
                <View key={step.label} style={styles.timelineRow}>
                  <Badge label={step.done ? 'Done' : 'Pending'} tone={step.done ? 'green' : 'gray'} />
                  <View style={{ flex: 1 }}>
                    <AppText weight="bold">{step.label}</AppText>
                    <AppText variant="caption" muted>{step.time}</AppText>
                  </View>
                </View>
              ))}
            </AppCard>
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  detailsMainCard: {
    marginTop: 16,
    padding: 16,
    gap: 12,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
    letterSpacing: 0.5,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    lineHeight: 20,
  },
  engagementCard: {
    padding: 16,
    marginTop: 16,
    backgroundColor: '#f8fbff',
    gap: 14,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  engagementTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 14,
    lineHeight: 20,
  },
  fileCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    marginBottom: 10,
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
    padding: 16,
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
});
