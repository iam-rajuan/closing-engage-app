import { zodResolver } from '@hookform/resolvers/zod';
import { router, useLocalSearchParams } from 'expo-router';
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
  AlertCircle,
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
import { FeedbackModal } from '@/components/common/FeedbackModal';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { LoginForm, loginSchema } from '@/utils/validation';
import { colors, shadows } from '@/theme';
import { styles as sharedStyles } from '@/features/shared/styles/screenStyles';
import { requestPasswordReset, verifyResetOtp, resetPasswordWithOtp } from '@/services/auth.service';
import { describeApiError } from '@/services/api';

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
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', role: undefined },
  });

  const role = watch('role');

  const submit = handleSubmit(async (values) => {
    setAuthError(null);
    try {
      const user = await login(values.role, values.email, values.password);
      router.replace(user.role === 'company' ? '/company/home' : '/notary/home');
    } catch (error) {
      const desc = describeApiError(
        error,
        'Unable to sign in',
        'Invalid email or password. Please check your credentials.',
      );
      setAuthError(desc.description || 'Invalid email or password.');
    }
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
            <AppText weight="bold" style={s.welcomeTitle} numberOfLines={1} adjustsFontSizeToFit>
              Welcome back
            </AppText>
            <AppText style={s.welcomeSubtitle}>
              Sign in to continue to your dashboard
            </AppText>
          </View>

          {/* ── Login Form Card ── */}
          <View style={s.formContainer}>
            {authError ? (
              <View style={s.authErrorBanner}>
                <AlertCircle color="#dc2626" size={18} />
                <AppText style={s.authErrorText}>{authError}</AppText>
              </View>
            ) : null}

            {/* Email Field */}
            <View style={s.fieldGroup}>
              <AppText weight="bold" style={s.fieldLabel}>EMAIL ADDRESS</AppText>
              <Controller
                control={control}
                name="email"
                render={({ field }) => (
                  <View style={[s.inputShell, (errors.email || authError) && s.inputError]}>
                    <Mail color={authError || errors.email ? '#dc2626' : '#94a3b8'} size={18} />
                    <TextInput
                      style={s.input}
                      value={field.value}
                      onChangeText={(val) => {
                        field.onChange(val);
                        if (authError) setAuthError(null);
                      }}
                      placeholder="Email or username"
                      placeholderTextColor="#94a3b8"
                      autoCapitalize="none"
                      autoCorrect={false}
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
                  <View style={[s.inputShell, (errors.password || authError) && s.inputError]}>
                    <Lock color={authError || errors.password ? '#dc2626' : '#94a3b8'} size={18} />
                    <TextInput
                      style={s.input}
                      value={field.value}
                      onChangeText={(val) => {
                        field.onChange(val);
                        if (authError) setAuthError(null);
                      }}
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
                        <EyeOff color={authError || errors.password ? '#dc2626' : '#94a3b8'} size={18} />
                      ) : (
                        <Eye color={authError || errors.password ? '#dc2626' : '#94a3b8'} size={18} />
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
              <AppText weight="bold" style={s.roleSectionLabel}>SIGN IN AS (OPTIONAL)</AppText>
              <AppText style={s.roleHint}>
                You can leave this unselected. The app will detect whether the account is a title company or notary.
              </AppText>
              <View style={s.roleRow}>
                <RoleCard
                  active={role === 'company'}
                  onPress={() => setValue('role', 'company')}
                  icon={<Building2 color={role === 'company' ? '#0a49a8' : '#94a3b8'} size={18} />}
                  title="Title Company"
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
  const [email, setEmail] = useState('');
  const [errorFeedback, setErrorFeedback] = useState<{ title: string; description: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitReset = async () => {
    if (!email.trim()) {
      setErrorFeedback({
        title: 'Email Required',
        description: 'Please enter your email address to continue.',
      });
      return;
    }
    setSubmitting(true);
    setErrorFeedback(null);
    try {
      await requestPasswordReset(email);
      // Navigate directly to the verify-otp screen passing email
      router.push({
        pathname: '/auth/verify-otp',
        params: { email },
      });
    } catch (error) {
      setErrorFeedback(
        describeApiError(
          error,
          'Unable to send verification code',
          'Please try again in a moment.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader back title="Forgot Password" />
      <AppCard style={[sharedStyles.formCard, { padding: 20, gap: 20 }]}>
        <AppInput
          label="Email"
          placeholder="your@email.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <AppButton title={submitting ? 'Sending...' : 'Send Verification Code'} onPress={() => void submitReset()} />
      </AppCard>

      <FeedbackModal
        visible={errorFeedback !== null}
        variant="error"
        title={errorFeedback?.title ?? ''}
        description={errorFeedback?.description ?? ''}
        buttonTitle="Try Again"
        onClose={() => setErrorFeedback(null)}
      />
    </ScreenContainer>
  );
}

/* ─── Verify OTP Screen ─── */
export function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ email: string; role?: 'company' | 'notary' }>();
  const email = params.email ?? '';
  const role = params.role;

  const [otp, setOtp] = useState('');
  const [errorFeedback, setErrorFeedback] = useState<{ title: string; description: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitVerify = async () => {
    if (otp.length !== 6) {
      setErrorFeedback({
        title: 'Invalid Code',
        description: 'Please enter the 6-digit code sent to your email.',
      });
      return;
    }
    setSubmitting(true);
    setErrorFeedback(null);
    try {
      await verifyResetOtp(email, otp, role);
      // Navigate to reset password screen passing email, role and otp
      router.push({
        pathname: '/auth/reset-password',
        params: { email, role, otp },
      });
    } catch (error) {
      setErrorFeedback(
        describeApiError(
          error,
          'Verification Failed',
          'The code you entered is invalid or expired. Please try again.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer>
      <AppHeader back title="Verify Code" />
      <AppCard style={[sharedStyles.formCard, { padding: 20, gap: 20 }]}>
        <AppText style={s.resetInfoText}>
          Enter the 6-digit verification code sent to {email}.
        </AppText>
        <AppInput
          label="Verification Code"
          placeholder="123456"
          value={otp}
          onChangeText={setOtp}
          keyboardType="number-pad"
          maxLength={6}
        />
        <AppButton title={submitting ? 'Verifying...' : 'Verify Code'} onPress={() => void submitVerify()} />
      </AppCard>

      <FeedbackModal
        visible={errorFeedback !== null}
        variant="error"
        title={errorFeedback?.title ?? ''}
        description={errorFeedback?.description ?? ''}
        buttonTitle="Try Again"
        onClose={() => setErrorFeedback(null)}
      />
    </ScreenContainer>
  );
}

/* ─── Reset Password Screen ─── */
export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email: string; role?: 'company' | 'notary'; otp: string }>();
  const email = params.email ?? '';
  const role = params.role;
  const otp = params.otp ?? '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<{ title: string; description: string } | null>(null);
  const [successFeedback, setSuccessFeedback] = useState<{ title: string; description: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submitReset = async () => {
    if (newPassword.length < 8) {
      setErrorFeedback({
        title: 'Weak Password',
        description: 'New password must be at least 8 characters long.',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorFeedback({
        title: 'Passwords Mismatch',
        description: 'New password and confirm password do not match.',
      });
      return;
    }
    setSubmitting(true);
    setErrorFeedback(null);
    try {
      await resetPasswordWithOtp(email, otp, role, newPassword, confirmPassword);
      setSuccessFeedback({
        title: 'Success',
        description: 'Your password has been successfully updated.',
      });
    } catch (error) {
      setErrorFeedback(
        describeApiError(
          error,
          'Reset Failed',
          'We were unable to reset your password. Please try again.',
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessFeedback(null);
    router.replace('/auth/login');
  };

  return (
    <ScreenContainer>
      <AppHeader back title="Update Password" />
      <AppCard style={[sharedStyles.formCard, { padding: 20, gap: 20 }]}>
        <AppText style={s.resetInfoText}>
          Create a new password for your account.
        </AppText>
        <AppInput
          label="New Password"
          placeholder="Minimum 8 characters"
          secureTextEntry={!showPassword}
          leftIcon={<Lock color="#94a3b8" size={18} style={{ marginRight: 8 }} />}
          rightElement={
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: 8 }}>
              {showPassword ? (
                <EyeOff color="#94a3b8" size={18} />
              ) : (
                <Eye color="#94a3b8" size={18} />
              )}
            </Pressable>
          }
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <AppInput
          label="Confirm Password"
          placeholder="Repeat your password"
          secureTextEntry={!showPassword}
          leftIcon={<Lock color="#94a3b8" size={18} style={{ marginRight: 8 }} />}
          rightElement={
            <Pressable onPress={() => setShowPassword(!showPassword)} style={{ marginLeft: 8 }}>
              {showPassword ? (
                <EyeOff color="#94a3b8" size={18} />
              ) : (
                <Eye color="#94a3b8" size={18} />
              )}
            </Pressable>
          }
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <AppButton title={submitting ? 'Updating...' : 'Update Password'} onPress={() => void submitReset()} />
      </AppCard>

      <FeedbackModal
        visible={errorFeedback !== null}
        variant="error"
        title={errorFeedback?.title ?? ''}
        description={errorFeedback?.description ?? ''}
        buttonTitle="Try Again"
        onClose={() => setErrorFeedback(null)}
      />

      <FeedbackModal
        visible={successFeedback !== null}
        variant="success"
        title={successFeedback?.title ?? ''}
        description={successFeedback?.description ?? ''}
        buttonTitle="Go to Login"
        onClose={handleSuccessClose}
      />
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
  authErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fca5a5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  authErrorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#991b1b',
    lineHeight: 18,
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
  resetInfoText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
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
  roleHint: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 16,
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
