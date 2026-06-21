import { Pressable, StyleSheet, View } from 'react-native';
import { Edit3, Mail, Trash2 } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
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
          <AppText weight="bold" style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {member.name}
          </AppText>
          <AppText variant="caption" muted style={styles.email} numberOfLines={1} ellipsizeMode="tail">
            {member.email}
          </AppText>
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
            <Pressable onPress={() => onEdit?.(member)} hitSlop={10} style={styles.actionButton}>
              <Mail size={16} color="#64748b" />
            </Pressable>
          ) : (
            <Pressable onPress={() => onEdit?.(member)} hitSlop={10} style={styles.actionButton}>
              <Edit3 size={16} color="#64748b" />
            </Pressable>
          )}
          <Pressable onPress={() => onDelete?.(member)} hitSlop={10} style={[styles.actionButton, styles.actionButtonDanger]}>
            <Trash2 size={16} color="#ef4444" />
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
    gap: 10,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 11,
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
    fontSize: 14,
    color: '#2563eb',
  },
  infoContainer: { 
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    letterSpacing: -0.2,
    lineHeight: 17,
  },
  email: {
    fontSize: 11,
    color: '#64748b',
    lineHeight: 15,
  },
  roleBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bottomRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  joinedContainer: {
    flex: 1,
    minWidth: 104,
    gap: 3,
  },
  joinedLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  joinedDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    lineHeight: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#f8fafc',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  statusText: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '800',
  },
  actions: { 
    flexDirection: 'row', 
    gap: 8,
    alignItems: 'center',
    marginLeft: 'auto',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionButtonDanger: {
    backgroundColor: '#fff5f5',
    borderColor: '#fecaca',
  },
});


