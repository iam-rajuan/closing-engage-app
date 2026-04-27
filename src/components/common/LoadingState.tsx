import { ActivityIndicator } from 'react-native';
import { colors } from '@/theme';

export function LoadingState() {
  return <ActivityIndicator color={colors.primary} />;
}
