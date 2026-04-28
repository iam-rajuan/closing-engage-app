import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, spacing } from '@/theme';
import { BrandLogo } from './BrandLogo';
import { AppText } from './AppText';

type Props = {
  title?: string;
  subtitle?: string;
  back?: boolean;
  avatar?: string;
};

export function AppHeader({ title, subtitle, back, avatar }: Props) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {back ? (
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <ChevronLeft color={colors.primary} size={20} />
          </Pressable>
        ) : (
          <BrandLogo width={124} />
        )}
        <View>
          {title ? <AppText variant="subtitle" style={styles.headerTitle}>{title}</AppText> : null}
          {subtitle ? <AppText variant="caption" muted>{subtitle}</AppText> : null}
        </View>
      </View>
      <View style={styles.right}>
        <Bell color={colors.textMuted} size={22} />
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: avatar || 'file:///home/iam-rajuan/.gemini/antigravity/brain/fd2e95bd-c627-41ac-8ff1-6aed5adf67b8/professional_executive_avatar_1777342511054.png' }} 
            style={styles.avatar} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 0,
    height: 48,
  },
  left: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#f1f5f9',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
