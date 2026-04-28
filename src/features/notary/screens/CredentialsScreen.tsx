import { View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { credentials } from '@/constants/mockData';
import { FieldRow } from '@/features/notary/components/FieldRow';
import { styles } from '@/features/shared/styles/screenStyles';

export function CredentialsScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Primary Commission" onProfilePress={() => router.push('/notary/settings')} />
      <AppCard style={styles.formCard}><View style={styles.topRow}><AppText variant="subtitle">California Secretary of State</AppText><Badge label="Verified" tone="green" /></View><FieldRow label="License Number" value="2348910-CA" /><FieldRow label="Expiry Date" value="Oct 24, 2026" /><FieldRow label="E&O Coverage" value="$100,000.00" /><AppButton title="Update information" /></AppCard>
      <AppCard><View style={styles.topRow}><AppText weight="bold">Background Screening</AppText><Badge label="Pending Review" tone="orange" /></View><AppText muted>Verification in progress. Estimated completion by May 12, 2024.</AppText></AppCard>
      <SectionHeader title="Credential History" action="Filter" />
      {credentials.map((credential) => <AppCard key={credential.id} style={styles.formCard}><View style={styles.topRow}><AppText weight="bold">{credential.title}</AppText><Badge label={credential.status} tone={credential.status === 'Archived' ? 'gray' : 'green'} /></View><FieldRow label={credential.issuer} value={credential.date} /></AppCard>)}
      <AppButton title="Upload new credential" variant="secondary" />
    </ScreenContainer>
  );
}
