import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { notaryStyles } from '@/features/notary/styles';

export function StatusReference() {
  return (
    <View style={{ marginTop: 32, marginBottom: 40 }}>
      <AppText style={notaryStyles.sectionEyebrow}>STATUS REFERENCE</AppText>
      <View style={notaryStyles.statusRefCard}>
        {[
          { label: 'Status: Assigned', desc: 'Order is confirmed and awaiting notary action.', color: '#2563eb' },
          { label: 'Status: In Progress', desc: 'The signing process has been initiated by the notary.', color: '#64748b' },
          { label: 'Status: Submitted', desc: 'Documentation has been uploaded and is in review.', color: '#94a3b8' },
        ].map((item, i) => (
          <View key={i} style={notaryStyles.statusRefItem}>
            <View style={[notaryStyles.statusDot, { backgroundColor: item.color }]} />
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={{ fontSize: 13, color: '#1e293b', lineHeight: 18 }}>{item.label}</AppText>
              <AppText variant="caption" muted style={{ fontSize: 12, marginTop: 2, lineHeight: 17 }}>{item.desc}</AppText>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
