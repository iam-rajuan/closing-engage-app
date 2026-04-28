import { router } from 'expo-router';
import { StyleSheet, View, ScrollView } from 'react-native';
import { LogOut, User, Shield, Bell, ChevronRight } from 'lucide-react-native';
import { AppHeader } from '@/components/common/AppHeader';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors, spacing } from '@/theme';

function SettingsItem({ icon: Icon, label, value, onPress, color = '#64748b' }: any) {
  return (
    <Pressable style={styles.settingsItem} onPress={onPress}>
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIconBox, { backgroundColor: `${color}10` }]}>
          <Icon color={color} size={20} />
        </View>
        <AppText weight="bold" style={styles.settingsLabel}>{label}</AppText>
      </View>
      <View style={styles.settingsItemRight}>
        {value && <AppText muted style={styles.settingsValue}>{value}</AppText>}
        <ChevronRight color="#cbd5e1" size={20} />
      </View>
    </Pressable>
  );
}

import { Pressable } from 'react-native';

export function SettingsForm({ role }: { role: 'company' | 'notary' }) {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <ScreenContainer scroll>
      <AppHeader back title="Settings" />
      
      <View style={styles.profileSection}>
        <View style={styles.profileAvatarLarge}>
          <AppText weight="bold" style={styles.avatarText}>
            {user?.name?.charAt(0) || 'A'}
          </AppText>
        </View>
        <AppText variant="subtitle" style={styles.profileName}>{user?.name || 'Alex Thompson'}</AppText>
        <AppText muted>{user?.email || 'alex@company.com'}</AppText>
        <Badge label={role === 'company' ? 'SIGNING COMPANY' : 'NOTARY'} tone="blue" style={styles.roleBadge} />
      </View>

      <View style={styles.settingsSection}>
        <AppText variant="caption" muted weight="bold" style={styles.sectionLabel}>ACCOUNT SETTINGS</AppText>
        <AppCard style={styles.settingsCard}>
          <SettingsItem icon={User} label="Profile Information" value="Edit" color={colors.primary} />
          <View style={styles.divider} />
          <SettingsItem icon={Shield} label="Security & Password" color="#10b981" />
        </AppCard>
      </View>

      <View style={styles.settingsSection}>
        <AppText variant="caption" muted weight="bold" style={styles.sectionLabel}>NOTIFICATIONS</AppText>
        <AppCard style={styles.settingsCard}>
          <ToggleRow label="Push Notifications" />
          <View style={styles.divider} />
          <ToggleRow label="Email Updates" />
        </AppCard>
      </View>

      <View style={styles.settingsSection}>
        <AppCard style={styles.settingsCard}>
          <SettingsItem 
            icon={LogOut} 
            label="Log Out" 
            color="#ef4444" 
            onPress={handleLogout} 
          />
        </AppCard>
      </View>
      
      <AppText variant="caption" muted style={styles.versionText}>Version 1.0.4 (Build 42)</AppText>
    </ScreenContainer>
  );
}

import { Badge } from '@/components/common/Badge';

const styles = StyleSheet.create({
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: 32,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  roleBadge: {
    marginTop: spacing.sm,
  },
  settingsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  sectionLabel: {
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  settingsCard: {
    padding: 0,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingsIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsLabel: {
    fontSize: 15,
    color: '#1e293b',
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsValue: {
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  versionText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: 40,
  },
});
