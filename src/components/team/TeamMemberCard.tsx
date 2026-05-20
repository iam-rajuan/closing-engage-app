import { Pressable, StyleSheet, View } from 'react-native';
import { Edit3, Mail, Trash2 } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, spacing } from '@/theme';
import { TeamMember } from '@/types/team';

export function TeamMemberCard({
  member,
  onEdit,
  onDelete,
}: {
  member: TeamMember;
  onEdit?: (member: TeamMember) => void;
  onDelete?: (member: TeamMember) => void;
}) {
  const isPending = member.status === 'Pending Invite';
  const statusColor = isPending ? '#f59e0b' : '#10b981'; // Orange for pending, Green for active

  return (
    <AppCard style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarFallback}>
            <AppText weight="bold" style={styles.avatarLabel}>{member.avatar}</AppText>
          </View>
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
            <Pressable onPress={() => onEdit?.(member)} hitSlop={10}>
              <Mail size={18} color="#64748b" style={styles.actionIcon} />
            </Pressable>
          ) : (
            <Pressable onPress={() => onEdit?.(member)} hitSlop={10}>
              <Edit3 size={18} color="#64748b" style={styles.actionIcon} />
            </Pressable>
          )}
          <Pressable onPress={() => onDelete?.(member)} hitSlop={10}>
            <Trash2 size={18} color="#ef4444" style={styles.actionIcon} />
          </Pressable>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { 
    padding: 12,
    gap: 10,
  },
  topRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 12 
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  avatarLabel: {
    fontSize: 16,
    color: '#2563eb',
  },
  infoContainer: { 
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  email: {
    fontSize: 12,
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
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  joinedContainer: {
    gap: 4,
  },
  joinedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  joinedDate: {
    fontSize: 13,
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
    fontSize: 13,
    fontWeight: '800',
  },
  actions: { 
    flexDirection: 'row', 
    gap: 16,
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: 4,
  },
});


