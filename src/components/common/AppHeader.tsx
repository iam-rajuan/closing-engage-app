import { Pressable, StyleSheet, View } from 'react-native';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, radius, spacing } from '@/theme';
import { BrandLogo } from './BrandLogo';
import { AppText } from './AppText';

type Props = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  avatar?: string;
};

export function AppHeader({ title, subtitle, back, avatar = 'A' }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {back ? (
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.primary} size={20} />
          </Pressable>
        ) : (
          <BrandLogo width={116} />
        )}
        <View>
          {title ? <AppText variant="subtitle">{title}</AppText> : null}
          {subtitle ? <AppText variant="caption" muted>{subtitle}</AppText> : null}
        </View>
      </View>
      <View style={styles.right}>
        <Bell color={colors.textMuted} size={20} />
        <View style={styles.avatar}><AppText variant="caption" weight="bold">{avatar}</AppText></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  left: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dbeafe',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
