import { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, ChevronLeft, Info } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getOrderById, scheduleOrderMeeting } from '@/services/orders.service';
import { notaryStyles } from '@/features/notary/styles';

export function ScheduleClosingScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? '';
  const { data: order, loading, error } = useAsyncResource(() => getOrderById(orderId), [orderId]);

  const initialDate = useMemo(() => order?.signingDate || '', [order]);
  const initialTime = useMemo(() => order?.signingTime || '', [order]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedTime, setSelectedTime] = useState(initialTime);

  const submitSchedule = async () => {
    await scheduleOrderMeeting(orderId, selectedDate, selectedTime);
    router.back();
  };

  return (
    <ScreenContainer scroll contentStyle={{ paddingBottom: 16 }}>
      <View style={notaryStyles.detailsHeader}>
        <Pressable onPress={() => router.back()}><ChevronLeft color="#0a49a8" size={24} /></Pressable>
        <AppText weight="bold" style={{ fontSize: 15, color: '#0f172a' }}>Schedule Closing</AppText>
        <Pressable><Info color="#64748b" size={20} /></Pressable>
      </View>

      {loading && !order ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {order ? (
        <>
          <View style={{ marginTop: 16 }}>
            <AppText weight="bold" style={{ fontSize: 15, color: '#1e293b', marginBottom: 12 }}>Select Date</AppText>
            <AppCard style={{ padding: 16 }}>
              <TextInput
                value={selectedDate}
                onChangeText={setSelectedDate}
                placeholder="May 31, 2026"
                style={{ borderWidth: 1, borderColor: '#dbe4f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a' }}
              />
            </AppCard>
          </View>

          <View style={{ marginTop: 24 }}>
            <AppText weight="bold" style={{ fontSize: 15, color: '#1e293b', marginBottom: 12 }}>Select Time</AppText>
            <AppCard style={{ padding: 16 }}>
              <TextInput
                value={selectedTime}
                onChangeText={setSelectedTime}
                placeholder="9:30 AM"
                style={{ borderWidth: 1, borderColor: '#dbe4f0', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: '#0f172a' }}
              />
            </AppCard>
          </View>

          <View style={{ marginTop: 24 }}>
            <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>PREVIEW SELECTION</AppText>
            <AppCard style={{ backgroundColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
              <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={20} color="#2563eb" />
              </View>
              <View>
                <AppText variant="caption" muted weight="bold">Closing Engagement</AppText>
                <AppText weight="bold" style={{ fontSize: 14, color: '#1e293b' }}>{selectedDate} • {selectedTime}</AppText>
              </View>
            </AppCard>
          </View>

          <AppButton title="Confirm Schedule" style={{ marginTop: 24, height: 48, backgroundColor: '#1d4ed8' }} onPress={() => void submitSchedule()} />
        </>
      ) : null}
    </ScreenContainer>
  );
}
