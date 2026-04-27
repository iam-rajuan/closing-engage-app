import { AppCard } from './AppCard';
import { AppText } from './AppText';

export function ErrorState({ message }: { message: string }) {
  return (
    <AppCard>
      <AppText style={{ color: '#dc2626' }}>{message}</AppText>
    </AppCard>
  );
}
