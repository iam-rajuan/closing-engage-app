import { View } from 'react-native';
import { router } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { UploadBox } from '@/components/documents/UploadBox';
import { FieldRow } from '@/features/notary/components/FieldRow';
import { styles } from '@/features/shared/styles/screenStyles';
import { colors } from '@/theme';

export function UploadDocumentsScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Upload Documents" onProfilePress={() => router.push('/notary/settings')} />
      <AppInput label="Selected Order" value="#CE-90210 - Jonathan Harker" editable={false} />
      <AppCard style={styles.formCard}><UploadBox title="Drag & Drop Scanbacks" subtitle="Upload high-resolution PDF scans only" /><AppButton title="Browse Files" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Uploaded Files (1)</AppText><FieldRow label="scanback_signed_final.pdf" value="4.2 MB" /><FieldRow label="Verification Complete" value="100%" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Submission Guide</AppText>{['Legibility (No blur or glare)', 'Order of Pages (Per instructions)', 'Full Stack (Include all 48 pages)'].map((item) => <View key={item} style={styles.checkRow}><CheckCircle2 color={colors.primary} size={18} /><AppText>{item}</AppText></View>)}</AppCard>
      <AppButton title="Upload & Submit" />
    </ScreenContainer>
  );
}

export function NotaryDocumentsScreen() {
  return <UploadDocumentsScreen />;
}
