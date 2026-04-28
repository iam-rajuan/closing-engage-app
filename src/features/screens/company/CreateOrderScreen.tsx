import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Building,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Info,
  Plus,
  X,
  Zap,
} from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { UploadBox } from '@/components/documents/UploadBox';
import { colors, spacing } from '@/theme';
import { OrderForm, orderSchema } from '@/utils/validation';

export function CreateOrderScreen() {
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [scanBacks, setScanBacks] = useState<'yes' | 'no'>('no');

  const { control, handleSubmit, formState: { errors } } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { title: '', clientName: '', propertyAddress: '', city: '', state: 'TX', zip: '', signingDate: '', loanType: 'Refinance', requirements: '', preferredNotary: '', instructions: '' },
  });

  const submit = handleSubmit(() => router.replace('/company/orders'));

  const input = (name: keyof OrderForm, label: string, placeholder?: string) => (
    <Controller control={control} name={name} render={({ field }) => <AppInput label={label} value={String(field.value ?? '')} onChangeText={field.onChange} placeholder={placeholder} error={errors[name]?.message} />} />
  );

  return (
    <ScreenContainer scroll>
      <AppHeader back title="Create New Order" onProfilePress={() => router.push('/company/settings')} />
      
      {/* Section 1: Order Information */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Info color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Order Information</AppText>
        </View>
        
        {input('title', 'ORDER TITLE', 'e.g. Smith Refinance')}
        {input('clientName', 'CLIENT NAME', 'Full legal name')}
        {input('propertyAddress', 'PROPERTY ADDRESS', 'Street address')}
        <View style={styles.threeCols}>
          <View style={{ flex: 2 }}>{input('city', 'CITY')}</View>
          <View style={{ flex: 1 }}>{input('state', 'STATE')}</View>
          <View style={{ flex: 1 }}>{input('zip', 'ZIP')}</View>
        </View>
        
        <View>
          <AppText variant="caption" muted style={styles.fieldLabel}>SIGNING DATE</AppText>
          <Pressable style={styles.datePicker}>
            <AppText style={styles.dateText}>mm/dd/yyyy</AppText>
            <Calendar color="#64748b" size={16} />
          </Pressable>
        </View>
      </AppCard>

      {/* Section 2: Loan Details */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Building color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Loan Details</AppText>
        </View>
        
        <View>
          <AppText variant="caption" muted style={styles.fieldLabel}>LOAN TYPE</AppText>
          <View style={styles.picker}>
            <AppText>Refinance</AppText>
            <ChevronDown color="#64748b" size={18} />
          </View>
        </View>

        <View style={styles.subSection}>
          <AppText weight="bold">Requirements</AppText>
          <AppText variant="caption" muted style={styles.requirementLabel}>SCAN BACKS REQUIRED</AppText>
          <View style={styles.radioRow}>
            <Pressable style={styles.radioItem} onPress={() => setScanBacks('yes')}>
              <View style={[styles.radioCircle, scanBacks === 'yes' && styles.radioActive]} />
              <AppText>Yes, required</AppText>
            </Pressable>
            <Pressable style={styles.radioItem} onPress={() => setScanBacks('no')}>
              <View style={[styles.radioCircle, scanBacks === 'no' && styles.radioActive]} />
              <AppText>No</AppText>
            </Pressable>
          </View>
        </View>
      </AppCard>

      {/* Section 3: Instructions */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <FileText color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Instructions</AppText>
        </View>
        
        <View>
          <AppText variant="caption" muted style={styles.fieldLabel}>PREFERRED NOTARY</AppText>
          <View style={styles.picker}>
            <AppText style={{ color: '#94a3b8' }}>Select Notary (Optional)</AppText>
            <ChevronDown color="#64748b" size={18} />
          </View>
        </View>

        {input('instructions', 'SPECIAL INSTRUCTIONS', 'Additional notes for the notary...')}
      </AppCard>

      {/* Order Priority */}
      <View style={styles.priorityContainer}>
        <AppText weight="bold">Order Priority</AppText>
        <View style={styles.priorityRow}>
          <Pressable 
            style={[styles.priorityBtn, priority === 'normal' && styles.priorityNormalActive]} 
            onPress={() => setPriority('normal')}
          >
            <Clock color={priority === 'normal' ? colors.primary : '#64748b'} size={20} />
            <AppText weight="bold" style={[styles.priorityBtnText, priority === 'normal' && { color: colors.primary }]}>NORMAL</AppText>
          </Pressable>
          <Pressable 
            style={[styles.priorityBtn, priority === 'urgent' && styles.priorityUrgentActive]} 
            onPress={() => setPriority('urgent')}
          >
            <Zap color={priority === 'urgent' ? '#dc2626' : '#64748b'} size={20} />
            <AppText weight="bold" style={[styles.priorityBtnText, priority === 'urgent' && { color: '#dc2626' }]}>URGENT</AppText>
          </Pressable>
        </View>
      </View>

      {/* Section 4: Supporting Documents */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Plus color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Supporting Documents</AppText>
        </View>
        
        <UploadBox />

        <View style={styles.fileItem}>
          <View style={styles.fileIcon}><FileText color="#dc2626" size={18} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={styles.fileName}>Closing_Statement_V1.pdf</AppText>
            <AppText variant="caption" muted>1.2 MB</AppText>
          </View>
          <X color="#64748b" size={18} />
        </View>
      </AppCard>

      <View style={styles.actionRow}>
        <AppButton title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
        <AppButton title="Submit Order" style={{ flex: 2, backgroundColor: '#0a49a8' }} onPress={submit} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: { gap: spacing.md, marginBottom: spacing.md },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 16, color: '#1e293b' },
  fieldLabel: { fontSize: 11, fontWeight: '700', color: '#64748b', marginBottom: 6, letterSpacing: 0.5 },
  datePicker: {
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dateText: { color: '#64748b' },
  picker: {
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  subSection: { marginTop: spacing.md },
  requirementLabel: { marginTop: 12, marginBottom: 10 },
  radioRow: { flexDirection: 'row', gap: 20 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioCircle: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#cbd5e1' },
  radioActive: { borderColor: '#0a49a8', borderWidth: 5 },
  priorityContainer: { paddingHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.xl },
  priorityRow: { flexDirection: 'row', gap: spacing.md, marginTop: 12 },
  priorityBtn: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  priorityNormalActive: { backgroundColor: '#eff6ff', borderColor: '#3b82f6' },
  priorityUrgentActive: { backgroundColor: '#fef2f2', borderColor: '#ef4444' },
  priorityBtnText: { fontSize: 12, color: '#64748b' },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { fontSize: 13, color: '#1e293b' },
  threeCols: { flexDirection: 'row', gap: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.md, paddingBottom: 40, marginTop: spacing.lg },
});
