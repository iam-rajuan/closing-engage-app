import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from './AppText';

type Props = {
  title: string;
  action?: string;
  style?: ViewStyle;
  onActionPress?: () => void;
};

export function SectionHeader({ title, action, style, onActionPress }: Props) {
  return (
    <View style={[styles.row, style]}>
      <AppText style={styles.title}>{title}</AppText>
      {action ? (
        <Pressable onPress={onActionPress}>
          <AppText style={styles.action}>{action}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1d63d2',
  },
});
