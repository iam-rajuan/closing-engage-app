import { ReactNode } from 'react';
import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { notaryStyles } from '@/features/notary/styles';

export function StatCard({
  label,
  value,
  icon,
  iconBg,
  accent,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
  accent?: string;
}) {
  return (
    <View style={notaryStyles.statCard}>
      <View style={notaryStyles.statCardInner}>
        <View style={[notaryStyles.iconBox, { backgroundColor: iconBg }]}>
          {icon}
        </View>
        <View style={notaryStyles.statTextContent}>
          <AppText style={notaryStyles.statLabel}>{label}</AppText>
          <AppText style={[notaryStyles.statValueLarge, accent ? { color: accent } : undefined]}>
            {value}
          </AppText>
        </View>
      </View>
    </View>
  );
}
