import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { router } from 'expo-router';
import { Calendar, ChevronDown, ChevronLeft, Info } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { notaryStyles } from '@/features/notary/styles';

export function ScheduleClosingScreen() {
  const dates = Array.from({ length: 28 }, (_, index) => index + 1);
  const times = ['09:00 AM', '10:30 AM', '11:15 AM', '12:45 PM', '02:00 PM', '02:15 PM', '03:30 PM', '04:00 PM', '05:15 PM'];
  const [selectedTime, setSelectedTime] = useState('02:00 PM');
  
  return (
    <ScreenContainer scroll contentStyle={{ paddingBottom: 40 }}>
      <View style={notaryStyles.detailsHeader}>
        <Pressable onPress={() => router.back()}><ChevronLeft color="#0a49a8" size={24} /></Pressable>
        <AppText weight="bold" style={{ fontSize: 17, color: '#0f172a' }}>Schedule Closing</AppText>
        <Pressable><Info color="#64748b" size={20} /></Pressable>
      </View>

      <View style={{ marginTop: 24 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <AppText weight="bold" style={{ fontSize: 18, color: '#1e293b' }}>Select Date</AppText>
          <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <AppText weight="bold" style={{ color: '#2563eb', fontSize: 14 }}>April 2026</AppText>
            <ChevronDown size={18} color="#2563eb" />
          </Pressable>
        </View>
        <AppCard style={{ padding: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
              <AppText key={day} variant="caption" muted weight="bold" style={{ width: 32, textAlign: 'center' }}>{day}</AppText>
            ))}
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 }}>
            {dates.map((date) => (
              <Pressable 
                key={date} 
                style={[notaryStyles.dateCell, date === 24 && notaryStyles.dateCellActive]}
              >
                <AppText weight="bold" style={[notaryStyles.dateText, date === 24 && { color: '#fff' }, date < 6 && { color: '#cbd5e1' }]}>
                  {date}
                </AppText>
              </Pressable>
            ))}
          </View>
        </AppCard>
      </View>

      <View style={{ marginTop: 32 }}>
        <AppText weight="bold" style={{ fontSize: 18, color: '#1e293b', marginBottom: 16 }}>Select Time</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {times.map((time) => (
            <Pressable 
              key={time} 
              onPress={() => setSelectedTime(time)}
              style={[notaryStyles.timeButton, selectedTime === time && notaryStyles.timeButtonActive]}
            >
              <AppText weight="bold" style={[notaryStyles.timeButtonText, selectedTime === time && { color: '#2563eb' }]}>
                {time}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 32 }}>
        <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 16 }}>PREVIEW SELECTION</AppText>
        <AppCard style={{ backgroundColor: '#f1f5f9', flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 }}>
          <View style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} color="#2563eb" />
          </View>
          <View>
            <AppText variant="caption" muted weight="bold">Closing Engagement</AppText>
            <AppText weight="bold" style={{ fontSize: 16, color: '#1e293b' }}>Tuesday, Apr 24 • 02:00 PM</AppText>
          </View>
        </AppCard>
      </View>

      <AppButton 
        title="Confirm Schedule" 
        style={{ marginTop: 32, height: 52, backgroundColor: '#1d4ed8' }}
      />
    </ScreenContainer>
  );
}
