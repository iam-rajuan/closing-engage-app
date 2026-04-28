import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PenTool,
  Shield,
} from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { BrandLogo } from '@/components/common/BrandLogo';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { LoginForm, loginSchema } from '@/utils/validation';
import { colors, shadows } from '@/theme';
import { styles as sharedStyles } from '@/features/shared/styles/screenStyles';

/* ─── Role Selector Card ─── */
function RoleCard({
  active,
  onPress,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <Pressable
      style={[s.roleCard, active && s.roleCardActive]}
      onPress={onPress}
    >
      <View style={[s.roleIconBox, active && s.roleIconBoxActive]}>
        {icon}
      </View>
      <AppText weight="bold" style={[s.roleTitle, active && s.roleTitleActive]}>
        {title}
      </AppText>
      <AppText style={[s.roleSubtitle, active && s.roleSubtitleActive]}>
        {subtitle}
      </AppText>
      {active && (
        <View style={s.roleCheck}>
          <View style={s.roleCheckInner} />
        </View>
      )}
    </Pressable>
  );
}

/* ─── Login Screen ─── */
export function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'your@email.com', password: '', role: 'company' },
  });

  const role = watch('role');

  const submit = handleSubmit(async (values) => {
    await login(values.role, values.email);
    router.replace(values.role === 'company' ? '/company/home' : '/notary/home');
  });

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header Branding ── */}
          <View style={s.branding}>
            <View style={s.logoContainer}>
              <BrandLogo width={140} />
            </View>
            <AppText weight="bold" style={s.welcomeTitle}>
              Welcome back
            </AppText>
            <AppText style={s.welcomeSubtitle}>
              Sign in to continue to your dashboard
            </AppText>
          </View>

          {/* ── Login Form Card ── */}
          <View style={s.formContainer}>
            {/* Email Field */}
            <View style={s.fieldGroup}>
              <AppText weight="bold" style={s.fieldLabel}>EMAIL ADDRESS</AppText>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <View style={[s.inputShell, errors.email && s.inputError]}>
                    <Mail color="#94a3b8" size={18} />
                    <TextInput
                      style={s.input}
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="your@email.com"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoComplete="email"
                    />
                  </View>
                )}
              />
              {errors.email && (
                <AppText style={s.errorText}>{errors.email.message}</AppText>
              )}
            </View>

            {/* Password Field */}
            <View style={s.fieldGroup}>
              <AppText weight="bold" style={s.fieldLabel}>PASSWORD</AppText>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <View style={[s.inputShell, errors.password && s.inputError]}>
                    <Lock color="#94a3b8" size={18} />
                    <TextInput
                      style={s.input}
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Enter your password"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                    />
                    <Pressable
                      onPress={() => setShowPassword(!showPassword)}
                      style={s.eyeBtn}
                    >
                      {showPassword ? (
                        <EyeOff color="#94a3b8" size={18} />
                      ) : (
                        <Eye color="#94a3b8" size={18} />
                      )}
                    </Pressable>
                  </View>
                )}
              />
              {errors.password && (
                <AppText style={s.errorText}>{errors.password.message}</AppText>
              )}
            </View>

            {/* Forgot Password */}
            <Pressable
              style={s.forgotRow}
              onPress={() => router.push('/auth/forgot-password')}
            >
              <AppText weight="bold" style={s.forgotText}>Forgot password?</AppText>
            </Pressable>

            {/* ── Role Selector ── */}
            <View style={s.roleSection}>
              <AppText weight="bold" style={s.roleSectionLabel}>SIGN IN AS</AppText>
              <View style={s.roleRow}>
                <RoleCard
                  active={role === 'company'}
                  onPress={() => setValue('role', 'company')}
                  icon={<Building2 color={role === 'company' ? '#0a49a8' : '#94a3b8'} size={18} />}
                  title="Signing Company"
                  subtitle="Manage orders & team"
                />
                <RoleCard
                  active={role === 'notary'}
                  onPress={() => setValue('role', 'notary')}
                  icon={<PenTool color={role === 'notary' ? '#0a49a8' : '#94a3b8'} size={18} />}
                  title="Notary"
                  subtitle="Sign & upload docs"
                />
              </View>
            </View>

            {/* ── Login Button ── */}
            <Pressable
              style={({ pressed }) => [s.loginBtn, pressed && s.loginBtnPressed]}
              onPress={submit}
              disabled={isSubmitting}
            >
              <AppText weight="bold" style={s.loginBtnText}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </AppText>
              {!isSubmitting && <ArrowRight color="#fff" size={20} />}
            </Pressable>

            {/* ── Security Notice ── */}
            <View style={s.securityRow}>
              <Shield color="#94a3b8" size={14} />
              <AppText style={s.securityText}>
                Protected by 256-bit SSL encryption
              </AppText>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={s.footer}>
            <AppText style={s.footerText}>
              © 2026 Closing Engage Inc.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ─── Forgot Password Screen ─── */
export function ForgotPasswordScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Forgot Password" />
      <AppCard style={sharedStyles.formCard}>
        <AppInput label="Email" placeholder="your@email.com" />
        <AppButton title="Send Reset Link" />
      </AppCard>
    </ScreenContainer>
  );
}

/* ─── STYLES ─── */
const s = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingBottom: 16,
  },

  /* Branding */
  branding: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 4,
  },
  logoContainer: {
    marginBottom: 6,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    lineHeight: 18,
  },

  /* Form */
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    ...shadows.card,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 46,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
  },
  inputError: {
    borderColor: '#fca5a5',
    backgroundColor: '#fffbfb',
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  eyeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -6,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: -4,
  },

  /* Forgot Password */
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotText: {
    fontSize: 12,
    color: '#0a49a8',
  },

  /* Role Section */
  roleSection: {
    gap: 8,
    marginTop: 0,
  },
  roleSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleCard: {
    flex: 1,
    padding: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  roleCardActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#0a49a8',
    borderWidth: 2,
  },
  roleIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIconBoxActive: {
    backgroundColor: '#dbeafe',
  },
  roleTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  roleTitleActive: {
    color: '#0a49a8',
  },
  roleSubtitle: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 13,
  },
  roleSubtitleActive: {
    color: '#6493d4',
  },
  roleCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#0a49a8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleCheckInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },

  /* Login Button */
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#0a49a8',
    borderRadius: 12,
    marginTop: 2,
    ...shadows.button,
  },
  loginBtnPressed: {
    opacity: 0.85,
  },
  loginBtnText: {
    color: '#fff',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  /* Security */
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: -2,
  },
  securityText: {
    fontSize: 11,
    color: '#94a3b8',
  },

  /* Footer */
  footer: {
    marginTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#cbd5e1',
  },
});
