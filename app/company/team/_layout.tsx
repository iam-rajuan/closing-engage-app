import { Stack } from 'expo-router';

export default function TeamLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="add" options={{ animation: 'none' }} />
    </Stack>
  );
}
