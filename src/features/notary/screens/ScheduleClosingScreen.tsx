import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarDays, Check, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getOrderById, scheduleOrderMeeting } from '@/services/orders.service';
import { colors, shadows } from '@/theme';

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const TIME_OPTIONS = ['09:00 AM', '10:30 AM', '11:15 AM', '12:45 PM', '02:00 PM', '02:15 PM', '03:30 PM', '04:00 PM', '05:15 PM'];

const parseDateValue = (value?: string | null) => {
  if (!value) {
    return new Date();
  }

  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const slashParts = value.split('/');
  if (slashParts.length === 3) {
    const month = Number(slashParts[0]);
    const day = Number(slashParts[1]);
    const year = Number(slashParts[2]);
    const result = new Date(year, month - 1, day);
    if (!Number.isNaN(result.getTime())) {
      return result;
    }
  }

  return new Date();
};

const formatPayloadDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatMonthTitle = (date: Date) =>
  date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

const formatPreviewDate = (date: Date) =>
  date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

export function ScheduleClosingScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? '';
  const { data: order, loading, error, reload } = useAsyncResource(() => getOrderById(orderId), [orderId]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    if (!order) {
      return;
    }

    const baseDate = parseDateValue(order.meeting?.date || order.signingDate);
    const initialTime = order.meeting?.time || order.signingTime || '';
    setSelectedDate(baseDate);
    setVisibleMonth(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
    setSelectedTime(initialTime);
    setManualTime(TIME_OPTIONS.includes(initialTime) ? '' : initialTime);
  }, [order]);

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const cells: Array<{ date: Date; currentMonth: boolean }> = [];

    for (let i = firstDay - 1; i >= 0; i -= 1) {
      cells.push({
        date: new Date(year, month - 1, daysInPreviousMonth - i),
        currentMonth: false,
      });
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({
        date: new Date(year, month, day),
        currentMonth: true,
      });
    }

    while (cells.length < 35) {
      const day = cells.length - (firstDay + daysInMonth) + 1;
      cells.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return cells;
  }, [visibleMonth]);

  const activeTime = manualTime.trim() || selectedTime.trim();
  const previewText = `${formatPreviewDate(selectedDate)} · ${activeTime || 'Select a time'}`;

  const pickTime = (time: string) => {
    setSelectedTime(time);
    setManualTime('');
  };

  const submitSchedule = async () => {
    if (!orderId) {
      return;
    }

    if (!activeTime) {
      Alert.alert('Select a time', 'Choose a time slot or type a custom time before confirming.');
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleOrderMeeting(orderId, formatPayloadDate(selectedDate), activeTime);
      setSuccessModalVisible(true);
    } catch (caught) {
      Alert.alert('Unable to schedule', caught instanceof Error ? caught.message : 'Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSuccessModalVisible(false);
    router.back();
  };

  return (
    <ScreenContainer
      scroll
      contentStyle={{ paddingBottom: 28 }}
      refreshing={refreshing}
      onRefresh={() => void handleRefresh()}
    >
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} style={styles.iconButton}>
          <ChevronLeft color="#111827" size={24} />
        </Pressable>
        <AppText weight="bold" style={styles.headerTitle}>Schedule Closing</AppText>
        <Pressable style={styles.iconButton}>
          <MoreVertical color="#475569" size={20} />
        </Pressable>
      </View>

      {loading && !order ? <LoadingState /> : null}
      {error ? <ErrorState message={error} /> : null}

      {order ? (
        <>
          <View style={styles.sectionHeader}>
            <AppText weight="bold" style={styles.sectionTitle}>Select Date</AppText>
            <View style={styles.monthRow}>
              <Pressable style={styles.monthArrow} onPress={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}>
                <ChevronLeft color={colors.primary} size={18} />
              </Pressable>
              <AppText weight="bold" style={styles.monthTitle}>{formatMonthTitle(visibleMonth)}</AppText>
              <Pressable style={styles.monthArrow} onPress={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}>
                <ChevronRight color={colors.primary} size={18} />
              </Pressable>
            </View>
          </View>

          <AppCard style={styles.calendarCard}>
            <View style={styles.weekHeader}>
              {WEEK_DAYS.map((label) => (
                <AppText key={label} weight="bold" style={styles.weekLabel}>{label}</AppText>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {calendarDays.map(({ date, currentMonth }) => {
                const isSelected =
                  selectedDate.getFullYear() === date.getFullYear() &&
                  selectedDate.getMonth() === date.getMonth() &&
                  selectedDate.getDate() === date.getDate();

                return (
                  <Pressable
                    key={date.toISOString()}
                    onPress={() => {
                      setSelectedDate(date);
                      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                    }}
                    style={[styles.dateCell, isSelected && styles.dateCellActive]}
                  >
                    <AppText
                      weight={isSelected ? 'bold' : 'medium'}
                      style={[styles.dateText, !currentMonth && styles.dateTextMuted, isSelected && styles.dateTextActive]}
                    >
                      {date.getDate()}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </AppCard>

          <View style={[styles.sectionHeader, { marginTop: 28 }]}>
            <AppText weight="bold" style={styles.sectionTitle}>Select Time</AppText>
          </View>

          <View style={styles.timeGrid}>
            {TIME_OPTIONS.map((time) => {
              const isActive = activeTime === time;
              return (
                <Pressable key={time} onPress={() => pickTime(time)} style={[styles.timeButton, isActive && styles.timeButtonActive]}>
                  <AppText weight={isActive ? 'bold' : 'medium'} style={[styles.timeText, isActive && styles.timeTextActive]}>
                    {time}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={{ marginTop: 18 }}>
            <AppText variant="caption" muted weight="bold" style={styles.previewLabel}>CUSTOM TIME</AppText>
            <TextInput
              value={manualTime}
              onChangeText={(value) => {
                setManualTime(value);
                if (value.trim()) {
                  setSelectedTime('');
                }
              }}
              placeholder="Type time like 02:00 PM"
              placeholderTextColor="#94a3b8"
              style={styles.customTimeInput}
            />
          </View>

          <View style={{ marginTop: 26 }}>
            <AppText variant="caption" muted weight="bold" style={styles.previewLabel}>PREVIEW SELECTION</AppText>
            <AppCard style={styles.previewCard}>
              <View style={styles.previewIcon}>
                <CalendarDays size={22} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText style={styles.previewBrand}>Closing Engage</AppText>
                <AppText weight="bold" style={styles.previewText}>{previewText}</AppText>
              </View>
            </AppCard>
          </View>

          <AppButton
            title="Confirm Schedule"
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.confirmButton}
            onPress={() => void submitSchedule()}
          />

          <Modal
            visible={successModalVisible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={handleModalClose}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalIconContainer}>
                  <View style={styles.modalIconRing}>
                    <Check color="#10b981" size={28} strokeWidth={3} />
                  </View>
                </View>
                <AppText weight="bold" style={styles.modalTitle}>
                  Meeting Scheduled
                </AppText>
                <AppText style={styles.modalDescription}>
                  The company user has been notified and can now confirm the closing from their order page.
                </AppText>
                <AppButton
                  title="Great, Got It"
                  onPress={handleModalClose}
                  style={styles.modalButton}
                />
              </View>
            </View>
          </Modal>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    color: '#111827',
  },
  sectionHeader: {
    marginTop: 12,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    color: '#111827',
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  monthArrow: {
    padding: 4,
  },
  monthTitle: {
    fontSize: 14,
    color: colors.primary,
  },
  calendarCard: {
    padding: 16,
    borderRadius: 20,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  weekLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 10,
  },
  dateCell: {
    width: '14.28%',
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCellActive: {
    backgroundColor: '#2563eb',
    borderRadius: 21,
    ...shadows.button,
  },
  dateText: {
    fontSize: 15,
    color: '#1f2937',
  },
  dateTextMuted: {
    color: '#cbd5e1',
  },
  dateTextActive: {
    color: '#ffffff',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  timeButton: {
    width: '31.5%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#cfd8e3',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeButtonActive: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  timeText: {
    fontSize: 13,
    color: '#374151',
  },
  timeTextActive: {
    color: '#2563eb',
  },
  previewLabel: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 12,
  },
  customTimeInput: {
    borderWidth: 1,
    borderColor: '#dbe4f0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: '#0f172a',
    backgroundColor: '#ffffff',
    fontSize: 14,
  },
  previewCard: {
    backgroundColor: '#f4f7ff',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  previewIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBrand: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
  },
  previewText: {
    fontSize: 15,
    color: '#111827',
    lineHeight: 22,
  },
  confirmButton: {
    marginTop: 30,
    height: 54,
    backgroundColor: '#2563eb',
    borderRadius: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    ...shadows.card,
  },
  modalIconContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalIconRing: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#d1fae5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 20,
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#2563eb',
    borderRadius: 14,
  },
});
