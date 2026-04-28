import { Stack } from 'expo-router';

export default function AssignedLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="chat" />
    </Stack>
  );
}
