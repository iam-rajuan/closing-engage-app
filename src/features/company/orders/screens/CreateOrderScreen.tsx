import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Building, Calendar, ChevronDown, Clock, FileText, Info, Plus, Zap } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { UploadBox } from '@/components/documents/UploadBox';
import { createOrder } from '@/services/orders.service';
import { colors } from '@/theme';
import { OrderForm, orderSchema } from '@/utils/validation';

export function CreateOrderScreen() {
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [scanBacks, setScanBacks] = useState<'yes' | 'no'>('no');

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      title: '',
      clientName: '',
      propertyAddress: '',
      city: '',
      state: 'TX',
      zip: '',
      signingDate: '',
      loanType: 'Refinance',
      requirements: '',
      preferredNotary: '',
      instructions: '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      await createOrder({
        title: values.title,
        clientName: values.clientName,
        propertyAddress: values.propertyAddress,
        city: values.city,
        state: values.state,
        zip: values.zip,
        signingDate: values.signingDate,
        loanType: values.loanType,
        preferredNotary: values.preferredNotary,
        instructions: values.instructions,
        scanbacksRequired: scanBacks === 'yes',
        priority: priority === 'urgent' ? 'Rush' : 'Standard',
      });
      router.replace('/company/orders');
    } catch (error) {
      Alert.alert('Unable to create order', error instanceof Error ? error.message : 'Please try again.');
    }
  });

  const input = (name: keyof OrderForm, label: string, placeholder?: string) => (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <AppInput
          label={label}
          value={String(field.value ?? '')}
          onChangeText={field.onChange}
          placeholder={placeholder}
          error={errors[name]?.message}
        />
      )}
    />
  );

  return (
    <ScreenContainer scroll>
      <AppHeader back title="Create New Order" onProfilePress={() => router.push('/company/settings')} />

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
        {input('signingDate', 'SIGNING DATE', 'May 31, 2026')}
      </AppCard>

      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Building color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Loan Details</AppText>
        </View>

        {input('loanType', 'LOAN TYPE', 'Refinance')}

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

      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <FileText color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Instructions</AppText>
        </View>

        {input('preferredNotary', 'PREFERRED NOTARY', 'Optional')}
        {input('instructions', 'SPECIAL INSTRUCTIONS', 'Additional notes for the notary...')}
      </AppCard>

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

      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Plus color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Supporting Documents</AppText>
        </View>
        <UploadBox title="Attach documents later if needed" subtitle="Order creation is already connected to the live backend" />
      </AppCard>

      <View style={styles.actionRow}>
        <AppButton title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
        <AppButton
          title={isSubmitting ? 'Submitting...' : 'Submit Order'}
          style={{ flex: 2, backgroundColor: '#0a49a8' }}
          onPress={() => void submit()}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  formCard: {
    marginTop: 16,
    padding: 16,
    gap: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#0a49a8',
    fontWeight: '700',
    lineHeight: 20,
  },
  subSection: { marginTop: 20 },
  requirementLabel: {
    marginTop: 16,
    marginBottom: 12,
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  radioRow: { flexDirection: 'row', gap: 24 },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
  },
  radioActive: {
    borderColor: '#0a49a8',
    borderWidth: 6,
  },
  priorityContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
  priorityBtn: {
    flex: 1,
    height: 80,
    borderRadius: 14,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  priorityNormalActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  priorityUrgentActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  priorityBtnText: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '700',
  },
  threeCols: {
    flexDirection: 'row',
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    paddingBottom: 40,
    marginTop: 32,
  },
});
