import { Pressable, ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowRight, Building, Calendar, CheckCircle2, ChevronLeft, FileText, Info, MapPin, MessageCircle, Send, UserRound } from 'lucide-react-native';
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
import { confirmPrintedDocuments, getOrderById } from '@/services/orders.service';

export function NotaryOrderDetailsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const orderId = params.id ?? '';
  const { data: order, loading, error, setData } = useAsyncResource(() => getOrderById(orderId), [orderId]);

  const markPrinted = async () => {
    const updated = await confirmPrintedDocuments(orderId);
    setData(updated);
  };

  return (
    <ScreenContainer scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        <View style={notaryStyles.detailsHeader}>
          <Pressable onPress={() => router.back()}><ChevronLeft color="#0a49a8" size={24} /></Pressable>
          <AppText weight="bold" style={{ fontSize: 15, color: '#0f172a' }}>Order Details</AppText>
          <Badge label={(order?.status || 'ASSIGNED').toUpperCase()} tone="blue" style={{ paddingHorizontal: 12 }} />
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

            <Pressable
              style={notaryStyles.scheduleLink}
              onPress={() => router.push(`/notary/assigned/schedule?orderId=${encodeURIComponent(order.id)}`)}
            >
              <AppText weight="bold" style={{ fontSize: 18, color: '#1e293b' }}>
                {order.meeting ? 'Reschedule Closing' : 'Schedule Closing'}
              </AppText>
              <ArrowRight size={20} color="#64748b" />
            </Pressable>

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
                        <AppText weight="bold" style={{ fontSize: 14, color: '#1e293b' }}>{doc.name}</AppText>
                        <AppText variant="caption" muted>{doc.meta}</AppText>
                      </View>
                      <AppText variant="caption" muted>Documents list</AppText>
                    </View>
                  ))
                ) : (
                  <View style={{ padding: 16 }}>
                    <EmptyState title="No order documents yet" />
                  </View>
                )}
              </AppCard>
            </View>

            <AppButton
              title={order.notaryPrintedConfirmed ? 'Printed Confirmed' : 'Confirm Printed Documents'}
              icon={<Send color="#fff" size={16} />}
              style={{ marginTop: 24, backgroundColor: '#0a49a8', height: 46 }}
              onPress={() => void markPrinted()}
            />
          </>
        ) : null}
      </ScrollView>

      <Pressable
        style={notaryStyles.floatingChat}
        onPress={() => router.push(`/notary/assigned/chat?orderId=${encodeURIComponent(orderId)}`)}
      >
        <MessageCircle color="#fff" size={24} />
        <View style={notaryStyles.onlineDotSmall} />
      </Pressable>
    </ScreenContainer>
  );
}
