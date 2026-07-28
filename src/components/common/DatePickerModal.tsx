import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius, shadows, spacing } from '@/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Props = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onChange: (dateString: string) => void;
};

const WEEK_DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatDateString = (date: Date) => {
  const month = MONTHS_SHORT[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day}, ${year}`;
};

const parseDateString = (value?: string | null) => {
  if (!value) return new Date();
  const parsed = new Date(value);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }
  return new Date();
};

export function DatePickerModal({ visible, value, onClose, onChange }: Props) {
  const [tempSelectedDate, setTempSelectedDate] = useState<Date>(new Date());
  const [visibleMonth, setVisibleMonth] = useState<Date>(new Date());

  useEffect(() => {
    if (visible) {
      const initialDate = parseDateString(value);
      setTempSelectedDate(initialDate);
      setVisibleMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    }
  }, [visible, value]);

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

    const totalCells = cells.length > 35 ? 42 : 35;
    while (cells.length < totalCells) {
      const day = cells.length - (firstDay + daysInMonth) + 1;
      cells.push({
        date: new Date(year, month + 1, day),
        currentMonth: false,
      });
    }

    return cells;
  }, [visibleMonth]);

  const handlePrevMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1));
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.dialog} onPress={(e) => e.stopPropagation()}>
          <View style={styles.calendarHeader}>
            <Pressable style={styles.navButton} onPress={handlePrevMonth}>
              <ChevronLeft color={colors.primary} size={20} />
            </Pressable>
            <AppText weight="bold" style={styles.monthTitle}>
              {`${MONTHS_FULL[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`}
            </AppText>
            <Pressable style={styles.navButton} onPress={handleNextMonth}>
              <ChevronRight color={colors.primary} size={20} />
            </Pressable>
          </View>

          <View style={styles.weekHeader}>
            {WEEK_DAYS.map((label, idx) => (
              <AppText key={`${label}-${idx}`} weight="bold" style={styles.weekLabel}>
                {label}
              </AppText>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {calendarDays.map(({ date, currentMonth }) => {
              const isSelected =
                tempSelectedDate.getFullYear() === date.getFullYear() &&
                tempSelectedDate.getMonth() === date.getMonth() &&
                tempSelectedDate.getDate() === date.getDate();

              return (
                <Pressable
                  key={date.toISOString()}
                  onPress={() => {
                    setTempSelectedDate(date);
                    if (!currentMonth) {
                      setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1));
                    }
                  }}
                  style={[styles.dateCell, isSelected && styles.dateCellActive]}
                >
                  <AppText
                    weight={isSelected ? 'bold' : 'medium'}
                    style={[
                      styles.dateText,
                      !currentMonth && styles.dateTextMuted,
                      isSelected && styles.dateTextActive,
                    ]}
                  >
                    {date.getDate()}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.buttonRow}>
            <AppButton title="Cancel" variant="secondary" onPress={onClose} style={styles.button} />
            <AppButton
              title="Confirm"
              variant="primary"
              onPress={() => {
                onChange(formatDateString(tempSelectedDate));
                onClose();
              }}
              style={styles.button}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  dialog: {
    width: '100%',
    maxWidth: 340,
    borderRadius: radius.xl || 24,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    alignItems: 'stretch',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...shadows.lg,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  navButton: {
    padding: spacing.xs,
    borderRadius: 8,
    backgroundColor: colors.blueSoft,
  },
  monthTitle: {
    fontSize: 16,
    color: colors.primaryDark,
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  weekLabel: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 4,
    marginBottom: spacing.md,
  },
  dateCell: {
    width: '14.28%',
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCellActive: {
    backgroundColor: colors.primary,
    borderRadius: 19,
    ...shadows.button,
  },
  dateText: {
    fontSize: 14,
    color: colors.text,
  },
  dateTextMuted: {
    color: '#cbd5e1',
  },
  dateTextActive: {
    color: colors.white,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    minHeight: 44,
  },
});
