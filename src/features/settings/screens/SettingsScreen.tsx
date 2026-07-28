import { useEffect, useMemo, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Switch, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Bell, Calendar, ChevronRight, Edit2, KeyRound, LogOut, Shield, User } from 'lucide-react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { FeedbackModal } from '@/components/common/FeedbackModal';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { shadows } from '@/theme';
import {
  updateCompanyNotificationPreferences,
  updateCompanyPassword,
  updateCompanyProfile,
  updateNotaryNotificationPreferences,
  updateNotaryPassword,
  updateNotaryProfile,
} from '@/services/auth.service';
import { pickAvatar } from '@/utils/fileUpload';

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={s.sectionRow}>
      <View style={s.sectionIconBox}>{icon}</View>
      <AppText weight="bold" style={s.sectionTitle}>{title}</AppText>
    </View>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  rightIcon,
  editable,
}: {
  label: string;
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  editable?: boolean;
}) {
  return (
    <View style={s.inputGroup}>
      <AppText style={s.fieldLabel}>{label}</AppText>
      <View style={[s.inputShell, !editable && s.inputShellDisabled]}>
        <TextInput
          style={[s.input, !editable && s.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#94a3b8"
          editable={editable}
        />
        {rightIcon && <View style={s.inputRight}>{rightIcon}</View>}
      </View>
    </View>
  );
}

function ToggleItem({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={s.toggleRow}>
      <AppText weight="bold" style={s.toggleLabel}>{label}</AppText>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: '#0a49a8', false: '#e2e8f0' }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
        ios_backgroundColor="#e2e8f0"
      />
    </View>
  );
}

type CompanyForm = {
  contactPerson: string;
  businessEmail: string;
  phone: string;
  companyName: string;
  contactEmail: string;
  address: string;
  avatarUrl: string;
  notifications: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  };
};

type NotaryForm = {
  fullName: string;
  specialty: string;
  email: string;
  phone: string;
  license: string;
  expiry: string;
  serviceArea: string;
  avatarUrl: string;
  notifications: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  };
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type SettingsFeedback = {
  variant: 'success' | 'error';
  title: string;
  description: string;
};

export function SettingsForm({ role }: { role: 'company' | 'notary' }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatarUrl);
  const [feedback, setFeedback] = useState<SettingsFeedback | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const isNotary = role === 'notary';

  const initialCompanyForm = useMemo<CompanyForm>(() => ({
    contactPerson: user?.name || '',
    businessEmail: user?.email || '',
    phone: user?.phone || '',
    companyName: user?.company || '',
    contactEmail: user?.email || '',
    address: '',
    avatarUrl: user?.avatarUrl || '',
    notifications: user?.notifications || { email: true, orders: true, documents: true },
  }), [user]);

  const initialNotaryForm = useMemo<NotaryForm>(() => ({
    fullName: user?.name || '',
    specialty: 'Mobile Loan Signing Agent',
    email: user?.email || '',
    phone: user?.phone || '',
    license: '',
    expiry: '',
    serviceArea: '',
    avatarUrl: user?.avatarUrl || '',
    notifications: user?.notifications || { email: true, orders: true, documents: true },
  }), [user]);

  const [companyForm, setCompanyForm] = useState<CompanyForm>(initialCompanyForm);
  const [notaryForm, setNotaryForm] = useState<NotaryForm>(initialNotaryForm);

  useEffect(() => {
    setCompanyForm(initialCompanyForm);
    setNotaryForm(initialNotaryForm);
    setAvatarPreview(user?.avatarUrl);
  }, [initialCompanyForm, initialNotaryForm, user?.avatarUrl]);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  const handleAvatarPick = async () => {
    if (!isEditing) return;
    const asset = await pickAvatar();
    if (!asset) return;

    const nextAvatar = asset.base64
      ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
      : asset.uri;

    setAvatarPreview(nextAvatar);
    if (isNotary) {
      setNotaryForm((current) => ({ ...current, avatarUrl: nextAvatar }));
    } else {
      setCompanyForm((current) => ({ ...current, avatarUrl: nextAvatar }));
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setCompanyForm(initialCompanyForm);
    setNotaryForm(initialNotaryForm);
    setAvatarPreview(user?.avatarUrl);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updatedUser = isNotary
        ? await updateNotaryProfile(notaryForm)
        : await updateCompanyProfile(companyForm);

      if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
        if (isNotary) {
          await updateNotaryPassword(passwordForm);
        } else {
          await updateCompanyPassword(passwordForm);
        }
      }

      await setUser(updatedUser);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditing(false);
      setFeedback({
        variant: 'success',
        title: 'Profile updated',
        description: 'Your profile changes have been saved successfully.',
      });
    } catch (error) {
      setFeedback({
        variant: 'error',
        title: 'Unable to save profile',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationPreferences = async (nextNotifications: {
    email: boolean;
    orders: boolean;
    documents: boolean;
  }) => {
    setSavingPreferences(true);
    try {
      const updatedUser = isNotary
        ? await updateNotaryNotificationPreferences(nextNotifications)
        : await updateCompanyNotificationPreferences(nextNotifications);

      await setUser(updatedUser);
    } catch (error) {
      if (isNotary) {
        setNotaryForm((current) => ({
          ...current,
          notifications: user?.notifications || { email: true, orders: true, documents: true },
        }));
      } else {
        setCompanyForm((current) => ({
          ...current,
          notifications: user?.notifications || { email: true, orders: true, documents: true },
        }));
      }

      setFeedback({
        variant: 'error',
        title: 'Unable to update preferences',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleNotificationToggle = (key: 'email' | 'orders' | 'documents', value: boolean) => {
    if (isNotary) {
      const nextNotifications = {
        ...(notaryForm.notifications || { email: true, orders: true, documents: true }),
        [key]: value,
      };
      setNotaryForm((current) => ({ ...current, notifications: nextNotifications }));
      void saveNotificationPreferences(nextNotifications);
      return;
    }

    const nextNotifications = {
      ...(companyForm.notifications || { email: true, orders: true, documents: true }),
      [key]: value,
    };
    setCompanyForm((current) => ({ ...current, notifications: nextNotifications }));
    void saveNotificationPreferences(nextNotifications);
  };

  const avatarUri = avatarPreview || user?.avatarUrl || 'https://ui-avatars.com/api/?name=Closing+Engage&background=eff6ff&color=0a49a8&bold=true';

  return (
    <ScreenContainer scroll contentStyle={s.container} refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader
        title="Settings"
        centerTitle
        showLogo={false}
        showNotifications={false}
        showProfile={false}
      />

      <View style={s.profileSection}>
        <View style={s.avatarOuter}>
          <Image source={{ uri: avatarUri }} style={s.avatarImage} />
          <Pressable style={[s.editAvatarBtn, !isEditing && s.editAvatarBtnDisabled]} onPress={() => void handleAvatarPick()}>
            <Edit2 color="#fff" size={12} />
          </Pressable>
        </View>

        <AppText weight="bold" style={s.profileName}>{user?.name || 'Profile'}</AppText>
        <AppText muted style={s.profileEmail}>{user?.email || ''}</AppText>

        <View style={s.profileActions}>
          {!isEditing ? (
            <Pressable style={s.editProfileBtn} onPress={() => setIsEditing(true)}>
              <AppText weight="bold" style={s.editProfileText}>Edit Profile</AppText>
            </Pressable>
          ) : (
            <>
              <Pressable style={[s.actionPill, s.cancelPill]} onPress={cancelEditing}>
                <AppText weight="bold" style={s.cancelPillText}>Cancel</AppText>
              </Pressable>
              <Pressable style={[s.actionPill, s.savePill]} onPress={() => void saveProfile()}>
                <AppText weight="bold" style={s.savePillText}>{saving ? 'Saving...' : 'Save Changes'}</AppText>
              </Pressable>
            </>
          )}
        </View>
      </View>

      <View style={s.section}>
        <SectionTitle icon={<User color="#0a49a8" size={18} />} title="Personal Information" />
        <AppCard style={s.fieldsCard}>
          {isNotary ? (
            <>
              <InputField label="FULL NAME" value={notaryForm.fullName} onChangeText={(value) => setNotaryForm((current) => ({ ...current, fullName: value }))} editable={isEditing} />
              <InputField label="PHONE NUMBER" value={notaryForm.phone} onChangeText={(value) => setNotaryForm((current) => ({ ...current, phone: value }))} editable={isEditing} />
              <InputField label="EMAIL ADDRESS" value={notaryForm.email} onChangeText={(value) => setNotaryForm((current) => ({ ...current, email: value }))} editable={isEditing} />
            </>
          ) : (
            <>
              <InputField label="FULL NAME" value={companyForm.contactPerson} onChangeText={(value) => setCompanyForm((current) => ({ ...current, contactPerson: value }))} editable={isEditing} />
              <InputField label="PHONE NUMBER" value={companyForm.phone} onChangeText={(value) => setCompanyForm((current) => ({ ...current, phone: value }))} editable={isEditing} />
              <InputField label="EMAIL ADDRESS" value={companyForm.businessEmail} onChangeText={(value) => setCompanyForm((current) => ({ ...current, businessEmail: value }))} editable={isEditing} />
            </>
          )}
        </AppCard>
      </View>

      {isNotary ? (
        <View style={s.section}>
          <SectionTitle icon={<Shield color="#0a49a8" size={18} />} title="Professional Details" />
          <AppCard style={s.fieldsCard}>
            <InputField label="SPECIALTY" value={notaryForm.specialty} onChangeText={(value) => setNotaryForm((current) => ({ ...current, specialty: value }))} editable={isEditing} />
            <InputField label="LICENSE NUMBER" value={notaryForm.license} onChangeText={(value) => setNotaryForm((current) => ({ ...current, license: value }))} editable={isEditing} />
            <InputField label="COMMISSION EXPIRY" value={notaryForm.expiry} onChangeText={(value) => setNotaryForm((current) => ({ ...current, expiry: value }))} editable={isEditing} rightIcon={<Calendar color="#94a3b8" size={18} />} />
            <InputField label="SERVICE AREA" value={notaryForm.serviceArea} onChangeText={(value) => setNotaryForm((current) => ({ ...current, serviceArea: value }))} editable={isEditing} />
          </AppCard>
        </View>
      ) : (
        <View style={s.section}>
          <SectionTitle icon={<Shield color="#0a49a8" size={18} />} title="Company Information" />
          <AppCard style={s.fieldsCard}>
            <InputField label="COMPANY NAME" value={companyForm.companyName} onChangeText={(value) => setCompanyForm((current) => ({ ...current, companyName: value }))} editable={isEditing} />
            <InputField label="COMPANY EMAIL" value={companyForm.businessEmail} onChangeText={(value) => setCompanyForm((current) => ({ ...current, businessEmail: value }))} editable={isEditing} />
            <InputField label="CONTACT EMAIL" value={companyForm.contactEmail} onChangeText={(value) => setCompanyForm((current) => ({ ...current, contactEmail: value }))} editable={isEditing} />
            <InputField label="BUSINESS ADDRESS" value={companyForm.address} onChangeText={(value) => setCompanyForm((current) => ({ ...current, address: value }))} editable={isEditing} />
          </AppCard>
        </View>
      )}

      <View style={s.section}>
        <SectionTitle icon={<KeyRound color="#0a49a8" size={18} />} title="Security Settings" />
        <AppCard style={s.fieldsCard}>
          <InputField label="CURRENT PASSWORD" value={passwordForm.currentPassword} onChangeText={(value) => setPasswordForm((current) => ({ ...current, currentPassword: value }))} secureTextEntry editable={isEditing} />
          <InputField label="NEW PASSWORD" value={passwordForm.newPassword} onChangeText={(value) => setPasswordForm((current) => ({ ...current, newPassword: value }))} placeholder="Enter new password" secureTextEntry editable={isEditing} />
          <InputField label="CONFIRM NEW PASSWORD" value={passwordForm.confirmPassword} onChangeText={(value) => setPasswordForm((current) => ({ ...current, confirmPassword: value }))} placeholder="Confirm new password" secureTextEntry editable={isEditing} />
          {!isEditing ? <AppText muted style={s.lockedHint}>Tap Edit Profile to update password or profile fields.</AppText> : null}
        </AppCard>
      </View>

      <View style={s.section}>
        <SectionTitle icon={<Bell color="#0a49a8" size={18} />} title="Notification Preferences" />
        <AppCard style={s.toggleCard}>
          {isNotary ? (
            <>
              <ToggleItem
                label="Email Notifications"
                value={notaryForm.notifications?.email ?? true}
                onValueChange={(val) => handleNotificationToggle('email', val)}
                disabled={savingPreferences}
              />
              <View style={s.divider} />
              <ToggleItem
                label="Order Updates"
                value={notaryForm.notifications?.orders ?? true}
                onValueChange={(val) => handleNotificationToggle('orders', val)}
                disabled={savingPreferences}
              />
              <View style={s.divider} />
              <ToggleItem
                label="Document Updates"
                value={notaryForm.notifications?.documents ?? true}
                onValueChange={(val) => handleNotificationToggle('documents', val)}
                disabled={savingPreferences}
              />
            </>
          ) : (
            <>
              <ToggleItem
                label="Email Notifications"
                value={companyForm.notifications?.email ?? true}
                onValueChange={(val) => handleNotificationToggle('email', val)}
                disabled={savingPreferences}
              />
              <View style={s.divider} />
              <ToggleItem
                label="Order Updates"
                value={companyForm.notifications?.orders ?? true}
                onValueChange={(val) => handleNotificationToggle('orders', val)}
                disabled={savingPreferences}
              />
              <View style={s.divider} />
              <ToggleItem
                label="Document Updates"
                value={companyForm.notifications?.documents ?? true}
                onValueChange={(val) => handleNotificationToggle('documents', val)}
                disabled={savingPreferences}
              />
            </>
          )}
        </AppCard>
      </View>

      <View style={s.section}>
        <Pressable style={s.linkItem} onPress={() => router.push(isNotary ? '/notary/settings/privacy' : '/company/settings/privacy')}>
          <AppText weight="bold" style={s.linkText}>Privacy Policy</AppText>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>
        <View style={s.divider} />
        <Pressable style={s.linkItem} onPress={() => router.push(isNotary ? '/notary/settings/terms' : '/company/settings/terms')}>
          <AppText weight="bold" style={s.linkText}>Terms & Conditions</AppText>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>
        <View style={s.divider} />
        <Pressable style={s.linkItem} onPress={() => router.push(isNotary ? '/notary/settings/about' : '/company/settings/about')}>
          <AppText weight="bold" style={s.linkText}>About</AppText>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>
      </View>

      <Pressable style={s.logoutBtn} onPress={handleLogout}>
        <LogOut color="#ef4444" size={20} />
        <AppText weight="bold" style={s.logoutText}>Sign Out</AppText>
      </Pressable>

      <View style={{ height: 40 }} />

      <FeedbackModal
        visible={feedback !== null}
        variant={feedback?.variant ?? 'success'}
        title={feedback?.title ?? ''}
        description={feedback?.description ?? ''}
        buttonTitle={feedback?.variant === 'error' ? 'Try Again' : 'Continue'}
        onClose={() => setFeedback(null)}
      />
    </ScreenContainer>
  );
}

const s = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  avatarOuter: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0a49a8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#fff',
  },
  editAvatarBtnDisabled: {
    backgroundColor: '#94a3b8',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 24,
  },
  profileEmail: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: -2,
  },
  profileActions: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  editProfileBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#0f172a',
  },
  editProfileText: {
    color: '#fff',
    fontSize: 12,
  },
  actionPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 18,
  },
  cancelPill: {
    backgroundColor: '#eef2f7',
  },
  cancelPillText: {
    color: '#334155',
    fontSize: 12,
  },
  savePill: {
    backgroundColor: '#0a49a8',
  },
  savePillText: {
    color: '#fff',
    fontSize: 12,
  },
  section: {
    marginTop: 22,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionIconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    color: '#0f172a',
  },
  fieldsCard: {
    padding: 14,
    gap: 14,
    borderRadius: 12,
  },
  inputGroup: {
    gap: 5,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  inputShellDisabled: {
    backgroundColor: '#f8fafc',
    opacity: 0.9,
  },
  input: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  inputDisabled: {
    color: '#475569',
  },
  inputRight: {
    marginLeft: 8,
  },
  lockedHint: {
    fontSize: 12,
    lineHeight: 18,
  },
  toggleCard: {
    padding: 0,
    overflow: 'hidden',
    borderRadius: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 14,
    color: '#1e293b',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
    borderRadius: 10,
    backgroundColor: '#fffbfb',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
  },
});
