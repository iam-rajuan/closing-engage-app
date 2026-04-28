import { Image, StyleSheet, View } from 'react-native';
import { Edit3, Mail, Trash2 } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, spacing } from '@/theme';
import { TeamMember } from '@/types/team';

export function TeamMemberCard({ member }: { member: TeamMember }) {
  const isPending = member.status === 'Pending Invite';
  const statusColor = isPending ? '#f59e0b' : '#10b981'; // Orange for pending, Green for active

  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=eff6ff&color=0a49a8&bold=true`;

  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: member.id === 't1' ? 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=128&auto=format&fit=crop' : 
                          member.id === 't2' ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=128&auto=format&fit=crop' :
                          member.id === 't3' ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=128&auto=format&fit=crop' : defaultAvatar }} 
            style={styles.avatar} 
          />
        </View>
        <View style={styles.infoContainer}>
          <AppText weight="bold" style={styles.name}>{member.name}</AppText>
          <AppText variant="caption" muted style={styles.email}>{member.email}</AppText>
        </View>
        <Badge label={member.role.toUpperCase()} tone="blue" style={styles.roleBadge} />
      </View>

      <View style={styles.bottomRow}>
        <View style={styles.joinedContainer}>
          <AppText variant="caption" muted weight="bold" style={styles.joinedLabel}>
            {isPending ? 'INVITED' : 'JOINED'}
          </AppText>
          <AppText style={styles.joinedDate}>{member.joinedLabel}</AppText>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <AppText style={[styles.statusText, { color: statusColor }]}>{member.status}</AppText>
        </View>

        <View style={styles.actions}>
          {isPending ? (
            <Mail size={20} color="#64748b" style={styles.actionIcon} />
          ) : (
            <Edit3 size={20} color="#64748b" style={styles.actionIcon} />
          )}
          <Trash2 size={20} color="#ef4444" style={styles.actionIcon} />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: 14,
    gap: 12,
  },
  topRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16 
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  infoContainer: { 
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    lineHeight: 20,
  },
  email: {
    fontSize: 13,
    color: '#64748b',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  bottomRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  joinedContainer: {
    gap: 4,
  },
  joinedLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  joinedDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#334155',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
  },
  actions: { 
    flexDirection: 'row', 
    gap: 20,
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 4,
  },
});


