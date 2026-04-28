import { useState } from 'react';
import { StyleSheet, Switch, View, Platform } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme';

export function ToggleRow({ 
  label, 
  description, 
  defaultEnabled = false,
  onValueChange 
}: { 
  label: string; 
  description?: string;
  defaultEnabled?: boolean;
  onValueChange?: (value: boolean) => void;
}) {
  const [isEnabled, setIsEnabled] = useState(defaultEnabled);

  const toggleSwitch = () => {
    const newValue = !isEnabled;
    setIsEnabled(newValue);
    onValueChange?.(newValue);
  };

  return (
    <View style={styles.row}>
      <View style={styles.textGroup}>
        <AppText weight="bold" style={styles.label}>{label}</AppText>
        {description && <AppText variant="caption" muted>{description}</AppText>}
      </View>
      <Switch 
        value={isEnabled} 
        onValueChange={toggleSwitch}
        trackColor={{ true: '#0a49a8', false: '#e2e8f0' }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
        ios_backgroundColor="#e2e8f0"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 18,
    backgroundColor: '#fff',
  },
  textGroup: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    color: '#1e293b',
  },
});
