import { useState } from 'react';
import { StyleSheet, View, Pressable, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import { 
  ChevronRight, 
  Edit2, 
  Shield, 
  Bell, 
  LogOut, 
  User, 
  Building2, 
  Lock,
  Info
} from 'lucide-react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { AppButton } from '@/components/common/AppButton';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { Badge } from '@/components/common/Badge';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors, shadows, spacing } from '@/theme';

function SectionHeading({ title }: { title: string }) {
  return (
    <AppText weight="bold" style={styles.sectionLabel}>{title.toUpperCase()}</AppText>
  );
}

function InputField({ label, value, placeholder, secureTextEntry }: any) {
  return (
    <View style={styles.inputGroup}>
      <AppText style={styles.fieldLabel}>{label}</AppText>
      <TextInput 
        style={styles.input} 
        value={value} 
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );
}

export function SettingsForm({ role }: { role: 'company' | 'notary' }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleSave = () => {
    alert('Settings Saved Successfully');
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <ScreenContainer 
      scroll 
      contentStyle={styles.container}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <AppHeader onProfilePress={() => {}} />
        
        {/* Profile Header Card */}
      <AppCard style={styles.profileHeaderCard}>
        <View style={styles.avatarWrapper}>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop' }} 
            style={styles.avatarLg} 
          />
          <Pressable style={styles.editAvatarBtn}>
            <Edit2 color="#fff" size={12} />
          </Pressable>
        </View>
        
        <AppText variant="subtitle" style={styles.profileName}>Alex Thompson</AppText>
        <AppText muted style={styles.profileEmail}>alex.t@estateflux.com</AppText>
        
        <View style={styles.badgeRow}>
          <Badge label="Estate Flux Title" tone="blue" style={styles.companyBadge} />
        </View>
        
        <Pressable style={styles.editProfileBtn}>
          <AppText weight="bold" style={styles.editProfileText}>Edit Profile</AppText>
        </Pressable>
      </AppCard>

      {/* Personal Information */}
      <View style={styles.section}>
        <SectionHeading title="Personal Information" />
        <AppCard style={styles.fieldsCard}>
          <InputField label="Full Name" value="Alex Thompson" />
          <InputField label="Email Address" value="alex.t@estateflux.com" />
          <InputField label="Phone Number" value="+1 (555) 902-4412" />
        </AppCard>
      </View>

      {/* Company Information */}
      <View style={styles.section}>
        <SectionHeading title="Company Information" />
        <AppCard style={styles.fieldsCard}>
          <InputField label="Company Name" value="Estate Flux Title" />
          <InputField label="Company Email" value="ops@estateflux.com" />
          <InputField label="Contact Number" value="+1 (555) 200-1100" />
          <InputField label="Business Address" value="782 Commerce Blvd, Austin TX" />
        </AppCard>
      </View>

      {/* Security Settings */}
      <View style={styles.section}>
        <SectionHeading title="Security Settings" />
        <AppCard style={styles.fieldsCard}>
          <InputField label="Current Password" value="********" secureTextEntry />
          <InputField label="New Password" placeholder="Enter new password" secureTextEntry />
          <InputField label="Confirm New Password" placeholder="Confirm new password" secureTextEntry />
          <AppButton title="Update Password" style={styles.updatePasswordBtn} />
        </AppCard>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <SectionHeading title="Notification Preferences" />
        <AppCard style={styles.toggleCard}>
          <ToggleRow label="Email Notifications" defaultEnabled />
          <View style={styles.divider} />
          <ToggleRow label="Order Updates" defaultEnabled />
          <View style={styles.divider} />
          <ToggleRow label="Document Updates" />
        </AppCard>
      </View>

      {/* Legal & About */}
      <View style={styles.section}>
        <Pressable style={styles.linkItem} onPress={() => router.push('/company/settings/privacy')}>
          <AppText weight="bold" style={styles.linkText}>Privacy Policy</AppText>
          <ChevronRight color="#64748b" size={20} />
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.linkItem} onPress={() => router.push('/company/settings/terms')}>
          <AppText weight="bold" style={styles.linkText}>Terms & Conditions</AppText>
          <ChevronRight color="#64748b" size={20} />
        </Pressable>
        <View style={styles.divider} />
        <Pressable style={styles.linkItem} onPress={() => router.push('/company/settings/about')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <AppText weight="bold" style={styles.linkText}>About</AppText>
            <Badge label="NEW" tone="blue" />
          </View>
          <ChevronRight color="#64748b" size={20} />
        </Pressable>
      </View>

      {/* Logout */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <LogOut color="#ef4444" size={20} />
        <AppText weight="bold" style={styles.logoutText}>Log Out</AppText>
      </Pressable>
      
      <AppText variant="caption" muted style={styles.versionText}>Version 1.0.4 (Build 42)</AppText>
      <View style={styles.footerActions}>
        <Pressable style={styles.cancelBtn}>
          <AppText weight="bold" style={styles.cancelText}>Cancel</AppText>
        </Pressable>
        <Pressable style={styles.saveBtn} onPress={handleSave}>
          <AppText weight="bold" style={styles.saveText}>Save Changes</AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
  },
  profileHeaderCard: {
    alignItems: 'center',
    padding: 24,
    marginTop: 16,
    gap: 8,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarLg: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1d63d2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    lineHeight: 28,
  },
  profileEmail: {
    fontSize: 14,
    marginTop: -4,
  },
  companyBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
    alignSelf: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 4,
  },
  editProfileBtn: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  editProfileText: {
    color: '#0a49a8',
    fontSize: 14,
  },
  section: {
    marginTop: 28,
  },
  sectionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  fieldsCard: {
    padding: 16,
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  input: {
    height: 48,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  updatePasswordBtn: {
    marginTop: 8,
    backgroundColor: '#0a49a8',
    height: 48,
    borderRadius: 10,
  },
  toggleCard: {
    padding: 0,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 4,
  },
  linkText: {
    fontSize: 15,
    color: '#1e293b',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    marginTop: 32,
    ...shadows.sm,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: '#64748b',
  },
  saveBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#0a49a8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#fff',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 32,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#fee2e2',
    borderRadius: 12,
    backgroundColor: '#fffbff',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
  },
  versionText: {
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
});
