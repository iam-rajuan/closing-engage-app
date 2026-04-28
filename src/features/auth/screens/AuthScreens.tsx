import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { AppButton } from '@/components/common/AppButton';
import { BrandLogo } from '@/components/common/BrandLogo';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { styles } from '@/features/shared/styles/screenStyles';
import { LoginForm, loginSchema } from '@/utils/validation';
export function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'your@email.com', password: '', role: 'company' },
  });
  const role = watch('role');
  const submit = handleSubmit(async (values) => {
    await login(values.role, values.email);
    router.replace(values.role === 'company' ? '/company/home' : '/notary/home');
  });
  return (
    <ScreenContainer contentStyle={styles.authScreen}>
      <View style={styles.centerBlock}>
        <BrandLogo width={156} />
        <AppText style={styles.loginTitle}>Welcome back</AppText>
        <AppText muted>Your soft space is waiting for you.</AppText>
      </View>
      <AppCard style={styles.formCard}>
        <Controller control={control} name="email" render={({ field }) => <AppInput label="Email" value={field.value} onChangeText={field.onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} />
        <Controller control={control} name="password" render={({ field }) => <AppInput label="Password" value={field.value} onChangeText={field.onChange} placeholder="Enter your password" secureTextEntry error={errors.password?.message} />} />
        <Pressable onPress={() => router.push('/auth/forgot-password')}><AppText variant="caption" style={styles.rightLink}>Forgot password?</AppText></Pressable>
        <View style={styles.segment}>
          <Pressable style={[styles.segmentItem, role === 'company' && styles.segmentActive]} onPress={() => setValue('role', 'company')}><AppText weight="bold" style={role === 'company' && styles.segmentTextActive}>Signing Company</AppText></Pressable>
          <Pressable style={[styles.segmentItem, role === 'notary' && styles.segmentActive]} onPress={() => setValue('role', 'notary')}><AppText weight="bold" style={role === 'notary' && styles.segmentTextActive}>Notary</AppText></Pressable>
        </View>
        <AppButton title="Log In" onPress={submit} loading={isSubmitting} />
      </AppCard>
    </ScreenContainer>
  );
}

export function ForgotPasswordScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Forgot Password" />
      <AppCard style={styles.formCard}>
        <AppInput label="Email" placeholder="your@email.com" />
        <AppButton title="Send Reset Link" />
      </AppCard>
    </ScreenContainer>
  );
}


