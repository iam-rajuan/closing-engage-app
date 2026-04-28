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
  name?: string;
  onProfilePress?: () => void;
};

export function AppHeader({ title, subtitle, back, avatar, name = "Alex Thompson", onProfilePress }: Props) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handlePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      // Default navigation to profile/settings
      router.push('/company/settings');
    }
  };

  const defaultAvatar = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop';

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
        <Pressable onPress={handlePress} style={styles.avatarWrapper}>
          <View style={styles.avatarContainer}>
            {avatar || defaultAvatar ? (
              <Image 
                source={{ uri: avatar || defaultAvatar }} 
                style={styles.avatar} 
              />
            ) : (
              <View style={styles.initialsContainer}>
                <AppText weight="bold" style={styles.initialsText}>{initials}</AppText>
              </View>
            )}
          </View>
        </Pressable>
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
  avatarWrapper: {
    padding: 2,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16, // Circle for modern look
    overflow: 'hidden',
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  initialsContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  initialsText: {
    color: colors.white,
    fontSize: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
