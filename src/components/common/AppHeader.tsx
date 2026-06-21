import { Image, Pressable, StyleSheet, View } from 'react-native';
import { Bell, ChevronLeft } from 'lucide-react-native';
import { router, useNavigation, type Href } from 'expo-router';
import { useAuthStore } from '@/features/auth/auth.store';
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
  onNotificationPress?: () => void;
  onBackPress?: () => void;
  backHref?: Href;
  centerTitle?: boolean;
};

export function AppHeader({
  title,
  subtitle,
  back,
  avatar,
  name = "Alex Thompson",
  onProfilePress,
  onNotificationPress,
  onBackPress,
  backHref,
  centerTitle,
}: Props) {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const resolvedName = name === "Alex Thompson" ? user?.fullName || user?.name || name : name;
  const resolvedAvatar = avatar || user?.avatarUrl;
  
  const initials = resolvedName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
    } else {
      router.push('/company/settings');
    }
  };

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
      return;
    }

    if (user?.role === 'notary') {
      router.push('/notary/notifications');
      return;
    }

    router.push('/company/notifications');
  };

  const handleBack = () => {
    if (onBackPress) {
      onBackPress();
      return;
    }

    if (backHref) {
      router.replace(backHref);
      return;
    }

    if (navigation.canGoBack()) {
      router.back();
    } else {
      if (title?.toLowerCase().includes('order')) {
        router.replace('/company/orders');
      } else {
        router.replace('/company/home');
      }
    }
  };
  return (
    <View style={styles.header}>
      {/* Centered Title Layer */}
      {centerTitle && title ? (
        <View style={styles.centerTitleContainer}>
          <AppText weight="bold" style={styles.centeredTitleText}>{title}</AppText>
          {subtitle ? <AppText variant="caption" muted numberOfLines={1}>{subtitle}</AppText> : null}
        </View>
      ) : null}

      <View style={styles.left}>
        {back ? (
          <Pressable onPress={handleBack} style={styles.iconButton}>
            <ChevronLeft color={colors.primary} size={24} strokeWidth={2.5} />
          </Pressable>
        ) : (
          <BrandLogo width={124} />
        )}
        {!centerTitle && (
          <View style={styles.titleGroup}>
            {title ? <AppText variant="subtitle" style={styles.headerTitle} numberOfLines={1}>{title}</AppText> : null}
            {subtitle ? <AppText variant="caption" muted numberOfLines={1}>{subtitle}</AppText> : null}
          </View>
        )}
      </View>

      <View style={styles.right}>
        {!back && (
          <Pressable onPress={handleNotificationPress} style={styles.bellButton}>
            <Bell color={colors.textMuted} size={22} />
          </Pressable>
        )}
        {!centerTitle && (
          <Pressable onPress={handleProfilePress} style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              {resolvedAvatar ? (
                <Image 
                  source={{ uri: resolvedAvatar }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={styles.initialsContainer}>
                  <AppText weight="bold" style={styles.initialsText}>{initials}</AppText>
                </View>
              )}
            </View>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 60, // Slightly taller for better touch targets and premium feel
    backgroundColor: 'transparent',



    position: 'relative',
  },
  left: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    zIndex: 2,
  },
  centerTitleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  centeredTitleText: {
    fontSize: 17,
    color: '#0a49a8',
    letterSpacing: -0.3,
  },
  titleGroup: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  right: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingLeft: spacing.sm,
    zIndex: 2,
    minWidth: 40,
    justifyContent: 'flex-end',
  },
  avatarWrapper: {
    padding: 2,
  },
  bellButton: {
    padding: 2,
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 10, // More squared/modern look
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
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
});

