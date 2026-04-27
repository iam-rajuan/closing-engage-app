import { AppCard } from './AppCard';
import { AppText } from './AppText';

export function EmptyState({ title = 'No records found' }: { title?: string }) {
  return (
    <AppCard>
      <AppText muted>{title}</AppText>
    </AppCard>
  );
}
