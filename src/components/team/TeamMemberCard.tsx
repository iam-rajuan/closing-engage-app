import { StyleSheet, View } from 'react-native';
import { Edit3, Mail, Trash2 } from 'lucide-react-native';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { colors, radius, spacing } from '@/theme';
import { TeamMember } from '@/types/team';

export function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatar}><AppText weight="bold">{member.avatar}</AppText></View>
        <View style={styles.main}>
          <AppText weight="bold">{member.name}</AppText>
          <AppText variant="caption" muted>{member.email}</AppText>
        </View>
        <Badge label={member.role} tone="blue" />
      </View>
      <View style={styles.row}>
        <View><AppText variant="caption" muted>{member.status === 'Active' ? 'Joined' : 'Invited'}</AppText><AppText variant="caption" weight="semibold">{member.joinedLabel}</AppText></View>
        <Badge label={member.status} tone={member.status === 'Active' ? 'green' : 'orange'} />
        <View style={styles.icons}>
          <Mail size={16} color={colors.textMuted} />
          <Edit3 size={16} color={colors.textMuted} />
          <Trash2 size={16} color={colors.danger} />
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  row: { alignItems: 'center', flexDirection: 'row', gap: spacing.md },
  avatar: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.blueSoft },
  main: { flex: 1 },
  icons: { marginLeft: 'auto', flexDirection: 'row', gap: spacing.md },
});
