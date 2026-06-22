import { useCallback, useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Briefcase, CheckCircle2, ChevronDown, Mail, Search, ShieldAlert, ShieldCheck, UserPlus } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import { useAuthStore } from '@/features/auth/auth.store';
import { createTeamMember, deleteTeamMember, getTeamMembers, updateTeamMember } from '@/services/team.service';
import { styles } from '@/features/shared/styles/screenStyles';
import { colors, spacing } from '@/theme';
import { TeamMember } from '@/types/team';
import { MemberForm, memberSchema } from '@/utils/validation';

type MemberRole = 'Admin' | 'Member';
type MemberPermissions = {
  createOrders: boolean;
  viewOrders: boolean;
  downloadDocuments: boolean;
};

type MemberScreenMode = 'create' | 'edit';
type RoleFilter = 'All' | MemberRole;
type StatusFilter = 'Mixed' | TeamMember['status'];

const defaultPermissions: MemberPermissions = {
  createOrders: true,
  viewOrders: true,
  downloadDocuments: false,
};
const roleFilterOptions: RoleFilter[] = ['All', 'Admin', 'Member'];
const statusFilterOptions: StatusFilter[] = ['Mixed', 'Active', 'Pending Invite', 'Inactive'];

let localTeamMembersCache: TeamMember[] | null = null;

function useTeamMembers() {
  const token = useAuthStore((state) => state.token);
  const [members, setMembers] = useState<TeamMember[]>(localTeamMembersCache || []);
  const [loading, setLoading] = useState(!localTeamMembersCache);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear cache on logout/token change
  useEffect(() => {
    if (!token) {
      localTeamMembersCache = null;
    }
  }, [token]);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (!localTeamMembersCache) {
      setLoading(true);
    }

    try {
      const result = await getTeamMembers();
      localTeamMembersCache = result;
      setMembers(result);
      setError(null);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load team members.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!localTeamMembersCache) {
        void load();
      }
    }, [load]),
  );

  return {
    members,
    setMembers,
    loading,
    refreshing,
    error,
    reload: load,
  };
}

function TeamMemberForm({
  mode,
  initialMember,
  submitLabel,
}: {
  mode: MemberScreenMode;
  initialMember?: TeamMember | null;
  submitLabel: string;
}) {
  const [role, setRole] = useState<MemberRole>(initialMember?.role ?? 'Member');
  const [permissions, setPermissions] = useState<MemberPermissions>(initialMember?.permissions ?? defaultPermissions);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MemberForm>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: initialMember?.name ?? '',
      phone: initialMember?.phone ?? '',
      email: initialMember?.email ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    try {
      if (mode === 'edit' && initialMember) {
        await updateTeamMember(initialMember.email, {
          name: values.fullName,
          email: values.email,
          phone: values.phone,
          role,
          permissions,
          status: initialMember.status,
        });
      } else {
        const result = await createTeamMember({
          name: values.fullName,
          email: values.email,
          phone: values.phone,
          role,
          permissions,
          sendInvite: true,
        });

        if (!result.inviteDelivered) {
          localTeamMembersCache = null;
          router.replace({
            pathname: '/company/team',
            params: {
              bannerTitle: 'Member created',
              bannerMessage: `Invite email was not delivered. Temporary password: ${result.temporaryPassword}`,
              bannerTone: 'warning',
            },
          });
          return;
        }
      }

      localTeamMembersCache = null;
      router.replace({
        pathname: '/company/team',
        params: {
          bannerTitle: mode === 'edit' ? 'Member updated' : 'Member added',
          bannerMessage:
            mode === 'edit'
              ? 'Team member details were updated successfully.'
              : 'Invitation email sent successfully.',
          bannerTone: 'success',
        },
      });
    } catch (error) {
      router.replace({
        pathname: '/company/team',
        params: {
          bannerTitle: mode === 'edit' ? 'Unable to update member' : 'Unable to add member',
          bannerMessage: error instanceof Error ? error.message : 'Please try again.',
          bannerTone: 'danger',
        },
      });
    }
  });

  return (
    <ScreenContainer>
      <AppHeader
        back
        centerTitle
        title={mode === 'edit' ? 'Edit Member' : 'Add New Member'}
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
        <Pressable style={styles.checkRow} onPress={() => setPermissions((current) => ({ ...current, createOrders: !current.createOrders }))}>
          <View style={[styles.checkBox, permissions.createOrders && styles.checkBoxActive]}>
            {permissions.createOrders && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>Create Orders</AppText>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => setPermissions((current) => ({ ...current, viewOrders: !current.viewOrders }))}>
          <View style={[styles.checkBox, permissions.viewOrders && styles.checkBoxActive]}>
            {permissions.viewOrders && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>View Orders</AppText>
        </Pressable>
        <Pressable
          style={styles.checkRow}
          onPress={() => setPermissions((current) => ({ ...current, downloadDocuments: !current.downloadDocuments }))}
        >
          <View style={[styles.checkBox, permissions.downloadDocuments && styles.checkBoxActive]}>
            {permissions.downloadDocuments && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>Download Documents</AppText>
        </Pressable>
      </AppCard>

      <AppCard style={styles.inviteToggleCard}>
        <View style={styles.inviteToggleRow}>
          <View style={styles.inviteIconBox}><Mail color="#64748b" size={18} /></View>
          <AppText weight="bold" style={styles.inviteText}>
            {mode === 'edit' ? 'Changes will update the existing member record' : 'Invitation email will be sent automatically'}
          </AppText>
        </View>
      </AppCard>

      <View style={styles.formActions}>
        <AppButton title={isSubmitting ? `${submitLabel}...` : submitLabel} style={styles.addMemberBtn} onPress={() => void submit()} />
        <Pressable onPress={() => router.back()} style={styles.cancelLink}>
          <AppText weight="bold" style={styles.cancelLinkText}>Cancel</AppText>
        </Pressable>
      </View>

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

function DeleteMemberModal({
  visible,
  member,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  member: TeamMember | null;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!member) {
    return null;
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <View style={localStyles.overlay}>
        <View style={localStyles.dialog}>
          <View style={localStyles.dialogIcon}>
            <ShieldAlert color="#dc2626" size={24} />
          </View>
          <AppText variant="subtitle" weight="bold" style={localStyles.dialogTitle}>
            Delete team member?
          </AppText>
          <AppText muted style={localStyles.dialogMessage}>
            {member.name} will lose access to the company workspace immediately. This action cannot be undone.
          </AppText>

          <View style={localStyles.dialogMeta}>
            <AppText weight="bold" style={localStyles.dialogMetaName}>{member.name}</AppText>
            <AppText muted style={localStyles.dialogMetaEmail}>{member.email}</AppText>
          </View>

          <View style={localStyles.dialogActions}>
            <AppButton
              title="Cancel"
              variant="secondary"
              onPress={onCancel}
              style={localStyles.dialogButton}
            />
            <AppButton
              title={loading ? 'Deleting...' : 'Delete Member'}
              variant="danger"
              onPress={onConfirm}
              disabled={loading}
              style={localStyles.dialogButton}
              textStyle={localStyles.dialogDeleteText}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

function FilterPickerModal<T extends string>({
  visible,
  title,
  options,
  selectedValue,
  onClose,
  onSelect,
}: {
  visible: boolean;
  title: string;
  options: readonly T[];
  selectedValue: T;
  onClose: () => void;
  onSelect: (value: T) => void;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={localStyles.overlay} onPress={onClose}>
        <Pressable style={localStyles.filterDialog} onPress={(event) => event.stopPropagation()}>
          <AppText variant="subtitle" weight="bold" style={localStyles.filterDialogTitle}>
            {title}
          </AppText>
          <View style={localStyles.filterOptions}>
            {options.map((option) => {
              const isActive = option === selectedValue;
              return (
                <Pressable
                  key={option}
                  style={[localStyles.filterOption, isActive && localStyles.filterOptionActive]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                  }}
                >
                  <AppText weight="bold" style={[localStyles.filterOptionText, isActive && localStyles.filterOptionTextActive]}>
                    {option}
                  </AppText>
                  {isActive ? <CheckCircle2 color="#2563eb" size={18} /> : null}
                </Pressable>
              );
            })}
          </View>
          <AppButton title="Close" variant="secondary" onPress={onClose} style={localStyles.filterCloseButton} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function TeamScreen() {
  const params = useLocalSearchParams<{
    bannerTitle?: string;
    bannerMessage?: string;
    bannerTone?: 'success' | 'warning' | 'danger';
  }>();
  const { members, setMembers, loading, refreshing, error, reload } = useTeamMembers();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<RoleFilter>('All');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('Mixed');
  const [memberToDelete, setMemberToDelete] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'role' | 'status' | null>(null);

  const filteredMembers = useMemo(
    () =>
      members.filter((member) => {
        const matchesSearch =
          !search.trim() || `${member.name} ${member.email}`.toLowerCase().includes(search.trim().toLowerCase());
        const matchesRole = selectedRole === 'All' || member.role === selectedRole;
        const matchesStatus = selectedStatus === 'Mixed' || member.status === selectedStatus;
        return matchesSearch && matchesRole && matchesStatus;
      }),
    [members, search, selectedRole, selectedStatus],
  );

  const handleRefresh = async () => {
    await reload(true);
  };

  const handleDelete = async () => {
    if (!memberToDelete || isDeleting) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteTeamMember(memberToDelete.email);
      setMembers((current) => current.filter((member) => member.email !== memberToDelete.email));
      if (localTeamMembersCache) {
        localTeamMembersCache = localTeamMembersCache.filter((member) => member.email !== memberToDelete.email);
      }
      setMemberToDelete(null);
    } catch (deleteError) {
      router.replace({
        pathname: '/company/team',
        params: {
          bannerTitle: 'Unable to delete member',
          bannerMessage: deleteError instanceof Error ? deleteError.message : 'Please try again.',
          bannerTone: 'danger',
        },
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => void handleRefresh()}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />

      <View style={styles.pageHeader}>
        <AppText style={[styles.pageTitle, localStyles.pageTitle]} maxFontSizeMultiplier={1.1}>Team Management</AppText>
        <AppText muted style={[styles.pageSubtitle, localStyles.pageSubtitle]} maxFontSizeMultiplier={1.15}>
          Manage your company team members and roles
        </AppText>
      </View>

      {params.bannerTitle && params.bannerMessage ? (
        <AppCard
          style={[
            localStyles.bannerCard,
            params.bannerTone === 'danger'
              ? localStyles.bannerDanger
              : params.bannerTone === 'warning'
                ? localStyles.bannerWarning
                : localStyles.bannerSuccess,
          ]}
        >
          <AppText weight="bold" style={localStyles.bannerTitle}>{params.bannerTitle}</AppText>
          <AppText style={localStyles.bannerText}>{params.bannerMessage}</AppText>
        </AppCard>
      ) : null}

      <AppButton
        title="Add Member"
        icon={<UserPlus color={colors.white} size={18} />}
        onPress={() => router.push('/company/team/add')}
        style={[styles.teamAddBtn, localStyles.addMemberButton]}
        textStyle={localStyles.addMemberButtonText}
      />

      <View style={[styles.searchContainer, localStyles.searchContainer]}>
        <Search color="#94a3b8" size={16} style={localStyles.searchIcon} />
        <AppInput
          placeholder="Search members..."
          style={localStyles.searchInput}
          containerStyle={[styles.searchBox, localStyles.searchBox]}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={[styles.filterRow, localStyles.filterRow]}>
        <Pressable
          style={[styles.dropdownBtn, localStyles.dropdownBtn, selectedRole !== 'All' && localStyles.dropdownBtnActive]}
          onPress={() => setActiveFilter('role')}
        >
          <AppText style={[styles.dropdownText, localStyles.dropdownText]} numberOfLines={1}>
            Role: {selectedRole}
          </AppText>
          <ChevronDown color="#64748b" size={16} />
        </Pressable>
        <Pressable
          style={[styles.dropdownBtn, localStyles.dropdownBtn, selectedStatus !== 'Mixed' && localStyles.dropdownBtnActive]}
          onPress={() => setActiveFilter('status')}
        >
          <AppText style={[styles.dropdownText, localStyles.dropdownText]} numberOfLines={1}>
            Status: {selectedStatus}
          </AppText>
          <ChevronDown color="#64748b" size={16} />
        </Pressable>
      </View>

      {!loading && !error ? (
        <View style={localStyles.resultsRow}>
          <AppText muted style={localStyles.resultsText} maxFontSizeMultiplier={1.1}>
            {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
          </AppText>
        </View>
      ) : null}

      {loading ? <LoadingState /> : null}
      {!loading && error ? <ErrorState message={error} /> : null}

      <View style={[styles.memberList, localStyles.memberList]}>
        {!loading && !error ? (
          filteredMembers.length ? (
            filteredMembers.map((member) => (
              <TeamMemberCard
                key={member.id}
                member={member}
                onEdit={(selectedMember) =>
                  router.push({
                    pathname: '/company/team/edit',
                    params: { email: selectedMember.email },
                  })
                }
                onDelete={(selectedMember) => setMemberToDelete(selectedMember)}
              />
            ))
          ) : (
            <EmptyState title="No team members found" />
          )
        ) : null}
      </View>

      <DeleteMemberModal
        visible={!!memberToDelete}
        member={memberToDelete}
        loading={isDeleting}
        onCancel={() => {
          if (!isDeleting) {
            setMemberToDelete(null);
          }
        }}
        onConfirm={() => void handleDelete()}
      />
      <FilterPickerModal
        visible={activeFilter === 'role'}
        title="Filter by role"
        options={roleFilterOptions}
        selectedValue={selectedRole}
        onClose={() => setActiveFilter(null)}
        onSelect={setSelectedRole}
      />
      <FilterPickerModal
        visible={activeFilter === 'status'}
        title="Filter by status"
        options={statusFilterOptions}
        selectedValue={selectedStatus}
        onClose={() => setActiveFilter(null)}
        onSelect={setSelectedStatus}
      />

      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

export function AddMemberScreen() {
  return <TeamMemberForm mode="create" submitLabel="Add Member" />;
}

export function EditMemberScreen() {
  const { email } = useLocalSearchParams<{ email?: string }>();
  const { members, loading, error } = useTeamMembers();

  const member = useMemo(
    () => members.find((item) => item.email.toLowerCase() === (email ?? '').toLowerCase()) ?? null,
    [email, members],
  );

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader back centerTitle title="Edit Member" onProfilePress={() => router.push('/company/settings')} />
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (error || !member) {
    return (
      <ScreenContainer>
        <AppHeader back centerTitle title="Edit Member" onProfilePress={() => router.push('/company/settings')} />
        <ErrorState message={error ?? 'Unable to find this team member.'} />
      </ScreenContainer>
    );
  }

  return <TeamMemberForm mode="edit" initialMember={member} submitLabel="Save Changes" />;
}

const localStyles = StyleSheet.create({
  pageTitle: {
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.25,
  },
  pageSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    maxWidth: '94%',
  },
  bannerCard: {
    marginTop: spacing.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 4,
    borderWidth: 1,
  },
  bannerSuccess: {
    backgroundColor: '#effcf6',
    borderColor: '#bbf7d0',
  },
  bannerWarning: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  bannerDanger: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  bannerTitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#0f172a',
  },
  bannerText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
  },
  addMemberButton: {
    height: 42,
    borderRadius: 10,
    marginTop: 14,
  },
  addMemberButtonText: {
    fontSize: 13,
    lineHeight: 18,
  },
  searchContainer: {
    marginTop: 14,
    position: 'relative',
  },
  searchBox: {
    marginBottom: 0,
    gap: 0,
  },
  searchInput: {
    paddingLeft: 28,
    minHeight: 44,
    fontSize: 13,
    lineHeight: 18,
    color: '#334155',
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  filterRow: {
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
  },
  dropdownBtn: {
    flex: 1,
    minWidth: 0,
    minHeight: 38,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  dropdownText: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    color: '#475569',
  },
  dropdownBtnActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  resultsRow: {
    marginTop: 14,
    marginBottom: -2,
  },
  resultsText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748b',
  },
  memberList: {
    gap: 10,
    marginTop: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  dialog: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 18,
  },
  dialogIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    color: '#0f172a',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 13,
    lineHeight: 19,
    color: '#64748b',
  },
  dialogMeta: {
    marginTop: 16,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    gap: 2,
  },
  dialogMetaName: {
    fontSize: 13,
    color: '#0f172a',
  },
  dialogMetaEmail: {
    fontSize: 11,
    color: '#64748b',
  },
  dialogActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  dialogButton: {
    flex: 1,
  },
  dialogDeleteText: {
    color: '#dc2626',
  },
  filterDialog: {
    width: '100%',
    borderRadius: 22,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  filterDialogTitle: {
    color: '#0f172a',
    marginBottom: 14,
  },
  filterOptions: {
    gap: 10,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  filterOptionActive: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  filterOptionText: {
    fontSize: 13,
    color: '#334155',
  },
  filterOptionTextActive: {
    color: '#2563eb',
  },
  filterCloseButton: {
    marginTop: 16,
  },
});
