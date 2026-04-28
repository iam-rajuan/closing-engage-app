import { useState } from 'react';
import { StyleSheet, View, Pressable, Image, TextInput, Platform, Switch } from 'react-native';
import { router } from 'expo-router';
import {
  Bell,
  Calendar,
  ChevronRight,
  Edit2,
  KeyRound,
  LogOut,
  Shield,
  User,
} from 'lucide-react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { shadows } from '@/theme';

/* ─── Section Heading with Icon ─── */
function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <View style={s.sectionRow}>
      <View style={s.sectionIconBox}>{icon}</View>
      <AppText weight="bold" style={s.sectionTitle}>{title}</AppText>
    </View>
  );
}

/* ─── Input Field ─── */
function InputField({
  label,
  value,
  placeholder,
  secureTextEntry,
  rightIcon,
}: {
  label: string;
  value?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
}) {
  return (
    <View style={s.inputGroup}>
      <AppText style={s.fieldLabel}>{label}</AppText>
      <View style={s.inputShell}>
        <TextInput
          style={s.input}
          value={value}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          placeholderTextColor="#94a3b8"
        />
        {rightIcon && <View style={s.inputRight}>{rightIcon}</View>}
      </View>
    </View>
  );
}

/* ─── Toggle Row ─── */
function ToggleItem({ label, defaultOn = false }: { label: string; defaultOn?: boolean }) {
  const [enabled, setEnabled] = useState(defaultOn);
  return (
    <View style={s.toggleRow}>
      <AppText weight="bold" style={s.toggleLabel}>{label}</AppText>
      <Switch
        value={enabled}
        onValueChange={setEnabled}
        trackColor={{ true: '#0a49a8', false: '#e2e8f0' }}
        thumbColor={Platform.OS === 'ios' ? undefined : '#fff'}
        ios_backgroundColor="#e2e8f0"
      />
    </View>
  );
}

/* ─── Main Settings Form ─── */
export function SettingsForm({ role }: { role: 'company' | 'notary' }) {
  const logout = useAuthStore((state) => state.logout);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const isNotary = role === 'notary';

  return (
    <ScreenContainer
      scroll
      contentStyle={s.container}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <AppHeader onProfilePress={() => {}} />

      {/* ── PROFILE HEADER ── */}
      <View style={s.profileSection}>
        <View style={s.avatarOuter}>
          <Image
            source={{
              uri: isNotary
                ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
            }}
            style={s.avatarImage}
          />
          <Pressable style={s.editAvatarBtn}>
            <Edit2 color="#fff" size={12} />
          </Pressable>
        </View>

        <AppText weight="bold" style={s.profileName}>
          {isNotary ? 'Sarah Miller' : 'Alex Thompson'}
        </AppText>
        <AppText muted style={s.profileEmail}>
          {isNotary ? 'sarah.miller@realtygroup.com' : 'alex.t@estateflux.com'}
        </AppText>

        <Pressable style={s.editProfileBtn}>
          <AppText weight="bold" style={s.editProfileText}>Edit Profile</AppText>
        </Pressable>
      </View>

      {/* ── PERSONAL INFORMATION ── */}
      <View style={s.section}>
        <SectionTitle icon={<User color="#0a49a8" size={18} />} title="Personal Information" />
        <AppCard style={s.fieldsCard}>
          <InputField label="FULL NAME" value={isNotary ? 'Sarah Miller' : 'Alex Thompson'} />
          <InputField label="PHONE NUMBER" value={isNotary ? '(512) 555-0198' : '+1 (555) 902-4412'} />
          <InputField
            label="EMAIL ADDRESS"
            value={isNotary ? 'sarah.miller@realtygroup.com' : 'alex.t@estateflux.com'}
          />
        </AppCard>
      </View>

      {/* ── PROFESSIONAL DETAILS (Notary only) ── */}
      {isNotary && (
        <View style={s.section}>
          <SectionTitle icon={<Shield color="#0a49a8" size={18} />} title="Professional Details" />
          <AppCard style={s.fieldsCard}>
            <InputField label="LICENSE NUMBER" value="TX-987654321" />
            <InputField
              label="COMMISSION EXPIRY"
              value="08/24/2026"
              rightIcon={<Calendar color="#94a3b8" size={18} />}
            />
            <InputField label="SERVICE AREA" value="Austin, TX & surrounding Travis County" />
          </AppCard>
        </View>
      )}

      {/* ── COMPANY INFORMATION (Company only) ── */}
      {!isNotary && (
        <View style={s.section}>
          <SectionTitle icon={<Shield color="#0a49a8" size={18} />} title="Company Information" />
          <AppCard style={s.fieldsCard}>
            <InputField label="COMPANY NAME" value="Estate Flux Title" />
            <InputField label="COMPANY EMAIL" value="ops@estateflux.com" />
            <InputField label="CONTACT NUMBER" value="+1 (555) 200-1100" />
            <InputField label="BUSINESS ADDRESS" value="782 Commerce Blvd, Austin TX" />
          </AppCard>
        </View>
      )}

      {/* ── SECURITY SETTINGS ── */}
      <View style={s.section}>
        <SectionTitle icon={<KeyRound color="#0a49a8" size={18} />} title="Security Settings" />
        <AppCard style={s.fieldsCard}>
          <InputField label="CURRENT PASSWORD" value="••••••••" secureTextEntry />
          <InputField label="NEW PASSWORD" placeholder="Enter new password" secureTextEntry />
          <InputField label="CONFIRM NEW PASSWORD" placeholder="Confirm new password" secureTextEntry />
          <Pressable style={s.updatePasswordBtn}>
            <AppText weight="bold" style={s.updatePasswordText}>Update Password</AppText>
          </Pressable>
        </AppCard>
      </View>

      {/* ── NOTIFICATION PREFERENCES ── */}
      <View style={s.section}>
        <SectionTitle icon={<Bell color="#0a49a8" size={18} />} title="Notification Preferences" />
        <AppCard style={s.toggleCard}>
          <ToggleItem label="Email Notifications" defaultOn />
          <View style={s.divider} />
          <ToggleItem label="Order Updates" defaultOn />
          <View style={s.divider} />
          <ToggleItem label="Document Updates" />
        </AppCard>
      </View>

      {/* ── LEGAL LINKS ── */}
      <View style={s.section}>
        <Pressable
          style={s.linkItem}
          onPress={() =>
            router.push(isNotary ? '/notary/settings/privacy' : '/company/settings/privacy')
          }
        >
          <AppText weight="bold" style={s.linkText}>Privacy Policy</AppText>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>
        <View style={s.divider} />
        <Pressable
          style={s.linkItem}
          onPress={() =>
            router.push(isNotary ? '/notary/settings/terms' : '/company/settings/terms')
          }
        >
          <AppText weight="bold" style={s.linkText}>Terms & Conditions</AppText>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>
        <View style={s.divider} />
        <Pressable
          style={s.linkItem}
          onPress={() =>
            router.push(isNotary ? '/notary/settings/about' : '/company/settings/about')
          }
        >
          <AppText weight="bold" style={s.linkText}>About</AppText>
          <ChevronRight color="#94a3b8" size={20} />
        </Pressable>
      </View>

      {/* ── SIGN OUT ── */}
      <Pressable style={s.logoutBtn} onPress={handleLogout}>
        <LogOut color="#ef4444" size={20} />
        <AppText weight="bold" style={s.logoutText}>Sign Out</AppText>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

/* ─── STYLES ─── */
const s = StyleSheet.create({
  container: {
    paddingBottom: 16,
  },

  /* Profile Section */
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
  editProfileBtn: {
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#0f172a',
  },
  editProfileText: {
    color: '#fff',
    fontSize: 12,
  },

  /* Section */
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

  /* Fields Card */
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
  input: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: '#1e293b',
    fontWeight: '600',
  },
  inputRight: {
    marginLeft: 8,
  },

  /* Update Password */
  updatePasswordBtn: {
    height: 42,
    backgroundColor: '#eff6ff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  updatePasswordText: {
    color: '#0a49a8',
    fontSize: 13,
  },

  /* Toggle Card */
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

  /* Legal Links */
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

  /* Logout */
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
