import React, { useState, useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Circle as SvgCircle, Line as SvgLine } from 'react-native-svg';
import { Clock, X } from 'lucide-react-native';
import { colors, radius, shadows, spacing } from '@/theme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';

type Props = {
  visible: boolean;
  value: string;
  onClose: () => void;
  onChange: (timeString: string) => void;
};

const parseTimeString = (val?: string) => {
  const safeVal = (val || '').trim();
  if (!safeVal) return { hour: 9, minute: 0, ampm: 'AM' };
  const match = safeVal.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let h = parseInt(match[1] ?? '9', 10);
    if (h < 1) h = 12;
    if (h > 12) h = 12;
    let m = parseInt(match[2] ?? '0', 10);
    if (isNaN(m) || m < 0 || m > 59) m = 0;
    const ampmStr = (match[3] ?? 'AM').toUpperCase();
    return { hour: h, minute: m, ampm: ampmStr };
  }
  return { hour: 9, minute: 0, ampm: 'AM' };
};

const HOURS_LIST = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES_LIST = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const CLOCK_SIZE = 236;
const RADIUS = 88;
const CENTER = CLOCK_SIZE / 2;
const BTN_SIZE = 36;
const BTN_HALF = BTN_SIZE / 2;

export function TimePickerModal({ visible, value, onClose, onChange }: Props) {
  const [mode, setMode] = useState<'hours' | 'minutes'>('hours');
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedMinute, setSelectedMinute] = useState<number>(0);
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('AM');

  useEffect(() => {
    if (visible) {
      const parsed = parseTimeString(value);
      setSelectedHour(parsed.hour);
      setSelectedMinute(parsed.minute);
      setAmpm(parsed.ampm as 'AM' | 'PM');
      setMode('hours');
    }
  }, [visible, value]);

  const handleHourSelect = (h: number) => {
    setSelectedHour(h);
    // Smooth transition to minutes mode after choosing hour
    setTimeout(() => {
      setMode('minutes');
    }, 150);
  };

  const handleMinuteSelect = (m: number) => {
    setSelectedMinute(m);
  };

  const handleConfirm = () => {
    const formattedHour = selectedHour < 10 ? `0${selectedHour}` : `${selectedHour}`;
    const formattedMin = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;
    const resultTime = `${formattedHour}:${formattedMin} ${ampm}`;
    onChange(resultTime);
    onClose();
  };

  const displayHour = selectedHour < 10 ? `0${selectedHour}` : `${selectedHour}`;
  const displayMin = selectedMinute < 10 ? `0${selectedMinute}` : `${selectedMinute}`;

  // Calculate active position for SVG clock hand
  const activeIndex =
    mode === 'hours'
      ? HOURS_LIST.indexOf(selectedHour)
      : MINUTES_LIST.findIndex((m) => Math.abs(selectedMinute - m) < 3 || (selectedMinute >= 57 && m === 0));

  const safeIndex = activeIndex >= 0 ? activeIndex : 0;
  const activeAngleDeg = safeIndex * 30 - 90;
  const activeAngleRad = (activeAngleDeg * Math.PI) / 180;
  const handTargetX = CENTER + RADIUS * Math.cos(activeAngleRad);
  const handTargetY = CENTER + RADIUS * Math.sin(activeAngleRad);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Clock size={20} color={colors.primary} />
              </View>
              <View>
                <AppText weight="bold" style={styles.title}>
                  Signing Time
                </AppText>
                <AppText variant="caption" muted style={styles.subtitle}>
                  Interactive analog clock dial
                </AppText>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <X size={18} color="#64748b" />
            </Pressable>
          </View>

          {/* Digital Time Card */}
          <View style={styles.digitalCard}>
            <View style={styles.digitsGroup}>
              {/* Hour Box */}
              <Pressable
                style={[styles.digitTab, mode === 'hours' && styles.digitTabActive]}
                onPress={() => setMode('hours')}
              >
                <AppText weight="bold" style={[styles.digitNumber, mode === 'hours' && styles.digitNumberActive]}>
                  {displayHour}
                </AppText>
                <AppText variant="caption" style={[styles.digitTag, mode === 'hours' && styles.digitTagActive]}>
                  HOUR
                </AppText>
              </Pressable>

              <AppText weight="bold" style={styles.colon}>
                :
              </AppText>

              {/* Minute Box */}
              <Pressable
                style={[styles.digitTab, mode === 'minutes' && styles.digitTabActive]}
                onPress={() => setMode('minutes')}
              >
                <AppText weight="bold" style={[styles.digitNumber, mode === 'minutes' && styles.digitNumberActive]}>
                  {displayMin}
                </AppText>
                <AppText variant="caption" style={[styles.digitTag, mode === 'minutes' && styles.digitTagActive]}>
                  MINUTE
                </AppText>
              </Pressable>
            </View>

            {/* AM / PM Segmented Selector */}
            <View style={styles.ampmWrap}>
              <Pressable
                style={[styles.ampmPill, ampm === 'AM' && styles.ampmPillActive]}
                onPress={() => setAmpm('AM')}
              >
                <AppText weight="bold" style={[styles.ampmText, ampm === 'AM' && styles.ampmTextActive]}>
                  AM
                </AppText>
              </Pressable>
              <Pressable
                style={[styles.ampmPill, ampm === 'PM' && styles.ampmPillActive]}
                onPress={() => setAmpm('PM')}
              >
                <AppText weight="bold" style={[styles.ampmText, ampm === 'PM' && styles.ampmTextActive]}>
                  PM
                </AppText>
              </Pressable>
            </View>
          </View>

          {/* Mode Switcher Pill */}
          <View style={styles.modePillRow}>
            <Pressable
              style={[styles.modePill, mode === 'hours' && styles.modePillActive]}
              onPress={() => setMode('hours')}
            >
              <AppText weight="bold" style={[styles.modePillText, mode === 'hours' && styles.modePillTextActive]}>
                Hours (1–12)
              </AppText>
            </Pressable>
            <Pressable
              style={[styles.modePill, mode === 'minutes' && styles.modePillActive]}
              onPress={() => setMode('minutes')}
            >
              <AppText weight="bold" style={[styles.modePillText, mode === 'minutes' && styles.modePillTextActive]}>
                Minutes (00–55)
              </AppText>
            </Pressable>
          </View>

          {/* Clock Dial Container */}
          <View style={styles.clockOuterWrapper}>
            <View style={styles.clockFace}>
              {/* SVG Clock Dial Background & Hands */}
              <Svg width={CLOCK_SIZE} height={CLOCK_SIZE} style={StyleSheet.absoluteFill}>
                {/* Outer face circle */}
                <SvgCircle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS + 20}
                  fill="#ffffff"
                  stroke="#e2e8f0"
                  strokeWidth={1.5}
                />
                <SvgCircle
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS + 14}
                  fill="#f8fbff"
                  stroke="#f1f5f9"
                  strokeWidth={1}
                />

                {/* Clock Hand Pointer Line */}
                <SvgLine
                  x1={CENTER}
                  y1={CENTER}
                  x2={handTargetX}
                  y2={handTargetY}
                  stroke={colors.primary}
                  strokeWidth={3}
                  strokeLinecap="round"
                />

                {/* Center Hub */}
                <SvgCircle cx={CENTER} cy={CENTER} r={6} fill={colors.primary} />
                <SvgCircle cx={CENTER} cy={CENTER} r={2.5} fill="#ffffff" />
              </Svg>

              {/* Number Buttons positioned around the dial */}
              {mode === 'hours'
                ? HOURS_LIST.map((h, idx) => {
                    const angleDeg = idx * 30 - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const x = CENTER + RADIUS * Math.cos(angleRad) - BTN_HALF;
                    const y = CENTER + RADIUS * Math.sin(angleRad) - BTN_HALF;
                    const isSelected = selectedHour === h;

                    return (
                      <Pressable
                        key={`hour-${h}`}
                        style={[
                          styles.clockNumBtn,
                          { left: x, top: y },
                          isSelected && styles.clockNumBtnActive,
                        ]}
                        onPress={() => handleHourSelect(h)}
                      >
                        <AppText
                          weight="bold"
                          style={[styles.clockNumText, isSelected && styles.clockNumTextActive]}
                        >
                          {h}
                        </AppText>
                      </Pressable>
                    );
                  })
                : MINUTES_LIST.map((m, idx) => {
                    const angleDeg = idx * 30 - 90;
                    const angleRad = (angleDeg * Math.PI) / 180;
                    const x = CENTER + RADIUS * Math.cos(angleRad) - BTN_HALF;
                    const y = CENTER + RADIUS * Math.sin(angleRad) - BTN_HALF;
                    const isSelected = Math.abs(selectedMinute - m) < 3 || (selectedMinute >= 57 && m === 0);

                    return (
                      <Pressable
                        key={`min-${m}`}
                        style={[
                          styles.clockNumBtn,
                          { left: x, top: y },
                          isSelected && styles.clockNumBtnActive,
                        ]}
                        onPress={() => handleMinuteSelect(m)}
                      >
                        <AppText
                          weight="bold"
                          style={[styles.clockNumText, isSelected && styles.clockNumTextActive]}
                        >
                          {m < 10 ? `0${m}` : `${m}`}
                        </AppText>
                      </Pressable>
                    );
                  })}
            </View>
          </View>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <AppButton title="Cancel" variant="secondary" style={styles.footerBtn} onPress={onClose} />
            <AppButton title="Set Time" variant="primary" style={styles.footerBtn} onPress={handleConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: 12,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitalCard: {
    backgroundColor: '#f8fbff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dbe6f3',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  digitsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  digitTab: {
    minWidth: 60,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  digitTabActive: {
    backgroundColor: '#eff6ff',
    borderColor: colors.primary,
  },
  digitNumber: {
    fontSize: 20,
    color: '#475569',
    lineHeight: 24,
  },
  digitNumberActive: {
    color: colors.primary,
  },
  digitTag: {
    fontSize: 8,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  digitTagActive: {
    color: colors.primary,
  },
  colon: {
    fontSize: 22,
    color: '#64748b',
  },
  ampmWrap: {
    width: 90,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#e2e8f0',
    padding: 2,
    flexDirection: 'row',
    gap: 2,
  },
  ampmPill: {
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmPillActive: {
    backgroundColor: colors.primary,
  },
  ampmText: {
    fontSize: 12,
    color: '#475569',
  },
  ampmTextActive: {
    color: '#ffffff',
  },
  modePillRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    padding: 3,
    gap: 4,
  },
  modePill: {
    flex: 1,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillActive: {
    backgroundColor: '#ffffff',
    ...shadows.sm,
  },
  modePillText: {
    fontSize: 12,
    color: '#64748b',
  },
  modePillTextActive: {
    color: colors.primary,
  },
  clockOuterWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  clockFace: {
    width: CLOCK_SIZE,
    height: CLOCK_SIZE,
    borderRadius: CLOCK_SIZE / 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockNumBtn: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  clockNumBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  clockNumText: {
    fontSize: 13,
    color: '#334155',
  },
  clockNumTextActive: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerBtn: {
    flex: 1,
  },
});
