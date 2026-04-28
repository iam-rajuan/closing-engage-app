import { Stack } from 'expo-router';

export default function AssignedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
      <Stack.Screen name="index" options={{ animation: 'none' }} />
      <Stack.Screen name="[id]" options={{ animation: 'none' }} />
      <Stack.Screen name="schedule" options={{ animation: 'none' }} />
      <Stack.Screen name="chat" options={{ animation: 'none' }} />
    </Stack>
  );
}
