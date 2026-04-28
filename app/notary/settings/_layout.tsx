import { Stack } from 'expo-router';

export default function NotarySettingsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="privacy" options={{ animation: 'none' }} />
      <Stack.Screen name="terms" options={{ animation: 'none' }} />
      <Stack.Screen name="about" />
    </Stack>
  );
}
