import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <AppText weight="bold" style={styles.title}>
          Page not found
        </AppText>
        <AppText muted style={styles.body}>
          The route you tried to open does not exist in Closing Engage.
        </AppText>
        <Link href="/" asChild>
          <AppButton title="Go Home" />
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.textMuted,
    marginBottom: 24,
    textAlign: 'center',
  },
  container: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
});
