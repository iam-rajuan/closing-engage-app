import { ReactNode } from 'react';
import { View } from 'react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { notaryStyles } from '@/features/notary/styles';

export function StatCard({ label, value, icon, sublabel, color }: { label: string; value: string; icon: ReactNode; sublabel: string; color: string }) {
  return (
    <AppCard style={notaryStyles.statCard}>
      <View style={[notaryStyles.iconBox, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <View style={notaryStyles.statTextContent}>
        <AppText variant="caption" muted weight="bold" style={{ fontSize: 9, letterSpacing: 0.6 }}>{sublabel}</AppText>
        <AppText weight="bold" style={notaryStyles.statLabel}>{label}</AppText>
      </View>
      <AppText style={notaryStyles.statValueLarge}>{value}</AppText>
    </AppCard>
  );
}
