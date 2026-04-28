import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';
import { Briefcase, CheckCircle2, ChevronDown, Mail, Search, ShieldCheck, UserPlus } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { teamMembers } from '@/constants/mockData';
import { styles } from '@/features/shared/styles/screenStyles';
import { colors } from '@/theme';
import { MemberForm, memberSchema } from '@/utils/validation';
export function TeamScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Team Management</AppText>
        <AppText muted style={styles.pageSubtitle}>Manage your company team members and roles</AppText>
      </View>

      <AppButton 
        title="Add Member" 
        icon={<UserPlus color={colors.white} size={18} />} 
        onPress={() => router.push('/company/team/add')} 
        style={styles.teamAddBtn}
      />

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput 
          placeholder="Search members..." 
          style={styles.searchInput} 
          containerStyle={styles.searchBox} 
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.dropdownBtn}>
          <AppText style={styles.dropdownText}>Role: All</AppText>
          <ChevronDown color="#64748b" size={16} />
        </Pressable>
        <Pressable style={styles.dropdownBtn}>
          <AppText style={styles.dropdownText}>Status: Active</AppText>
          <ChevronDown color="#64748b" size={16} />
        </Pressable>
      </View>

      <View style={styles.memberList}>
        {teamMembers.map((member) => <TeamMemberCard key={member.id} member={member} />)}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

export function AddMemberScreen() {
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');
  const [permissions, setPermissions] = useState({
    create: true,
    view: true,
    download: false
  });

  const { control, handleSubmit, formState: { errors } } = useForm<MemberForm>({ 
    resolver: zodResolver(memberSchema), 
    defaultValues: { fullName: '', phone: '', email: '' } 
  });
  
  const submit = handleSubmit(() => router.replace('/company/team'));

  return (
    <ScreenContainer>
      <AppHeader 
        back 
        centerTitle 
        title="Add New Member" 
        onProfilePress={() => router.push('/company/settings')} 
      />
      
      <View style={styles.formSection}>
        <Controller 
          control={control} 
          name="fullName" 
          render={({ field }) => (
            <AppInput 
              label="FULL NAME" 
              placeholder="e.g. Alexander Pierce" 
              value={field.value} 
              onChangeText={field.onChange} 
              error={errors.fullName?.message} 
            />
          )} 
        />
        <Controller 
          control={control} 
          name="phone" 
          render={({ field }) => (
            <AppInput 
              label="PHONE" 
              placeholder="+1 (555) 000-0000" 
              value={field.value} 
              onChangeText={field.onChange} 
              rightElement={<AppText variant="caption" muted style={{ fontSize: 10 }}>OPTIONAL</AppText>}
            />
          )} 
        />
        <Controller 
          control={control} 
          name="email" 
          render={({ field }) => (
            <AppInput 
              label="EMAIL ADDRESS" 
              placeholder="alexander@company.com" 
              value={field.value} 
              onChangeText={field.onChange} 
              error={errors.email?.message} 
            />
          )} 
        />
      </View>

      <View style={styles.roleSelectionSection}>
        <AppText variant="label" muted style={styles.formSectionLabel}>SELECT ROLE</AppText>
        <View style={styles.roleRow}>
          <Pressable 
            style={[styles.roleSelectCard, role === 'Admin' && styles.roleSelectCardActive]} 
            onPress={() => setRole('Admin')}
          >
            <View style={[styles.roleIconBox, role === 'Admin' && styles.roleIconBoxActive]}>
              <ShieldCheck color={role === 'Admin' ? '#0a49a8' : '#94a3b8'} size={24} />
            </View>
            <AppText weight="bold" style={[styles.roleCardTitle, role === 'Admin' && styles.roleCardTitleActive]}>Admin</AppText>
            <AppText variant="caption" muted style={styles.roleCardDesc}>Full system access and member management</AppText>
            {role === 'Admin' && <View style={styles.roleCheckCircle}><CheckCircle2 color="#0a49a8" size={16} /></View>}
          </Pressable>

          <Pressable 
            style={[styles.roleSelectCard, role === 'Member' && styles.roleSelectCardActive]} 
            onPress={() => setRole('Member')}
          >
            <View style={[styles.roleIconBox, role === 'Member' && styles.roleIconBoxActive]}>
              <Briefcase color={role === 'Member' ? '#0a49a8' : '#94a3b8'} size={24} />
            </View>
            <AppText weight="bold" style={[styles.roleCardTitle, role === 'Member' && styles.roleCardTitleActive]}>Member</AppText>
            <AppText variant="caption" muted style={styles.roleCardDesc}>Limited access to specific projects and files</AppText>
            {role === 'Member' && <View style={styles.roleCheckCircle}><CheckCircle2 color="#0a49a8" size={16} /></View>}
          </Pressable>
        </View>
      </View>

      <AppCard style={styles.permissionsCard}>
        <AppText weight="bold" style={styles.permissionsTitle}>MEMBER PERMISSIONS</AppText>
        <Pressable style={styles.checkRow} onPress={() => setPermissions(p => ({ ...p, create: !p.create }))}>
          <View style={[styles.checkBox, permissions.create && styles.checkBoxActive]}>
            {permissions.create && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>Create Orders</AppText>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => setPermissions(p => ({ ...p, view: !p.view }))}>
          <View style={[styles.checkBox, permissions.view && styles.checkBoxActive]}>
            {permissions.view && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>View Orders</AppText>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => setPermissions(p => ({ ...p, download: !p.download }))}>
          <View style={[styles.checkBox, permissions.download && styles.checkBoxActive]}>
            {permissions.download && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>Download Documents</AppText>
        </Pressable>
      </AppCard>

      <AppCard style={styles.inviteToggleCard}>
        <View style={styles.inviteToggleRow}>
          <View style={styles.inviteIconBox}><Mail color="#64748b" size={18} /></View>
          <AppText weight="bold" style={styles.inviteText}>Send invitation email</AppText>
          <View style={styles.toggleSwitch}><View style={styles.toggleKnob} /></View>
        </View>
      </AppCard>

      <View style={styles.formActions}>
        <AppButton title="Add Member" style={styles.addMemberBtn} onPress={submit} />
        <Pressable onPress={() => router.back()} style={styles.cancelLink}>
          <AppText weight="bold" style={styles.cancelLinkText}>Cancel</AppText>
        </Pressable>
      </View>
      
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

