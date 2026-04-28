import { Redirect, Tabs } from 'expo-router';
import { BadgeCheck, BriefcaseBusiness, FileUp, Home, Settings } from 'lucide-react-native';
import { colors } from '@/theme';
import { useAuthStore } from '@/features/auth/auth.store';

export default function NotaryLayout() {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== 'notary') return <Redirect href="/auth/login" />;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8, backgroundColor: colors.surface },
      }}
    >
      <Tabs.Screen name="home" options={{ title: 'Home', tabBarIcon: ({ color }) => <Home color={color} size={20} /> }} />
      <Tabs.Screen name="assigned" options={{ title: 'Assigned', tabBarIcon: ({ color }) => <BriefcaseBusiness color={color} size={20} /> }} />
      <Tabs.Screen name="documents/index" options={{ title: 'Documents', tabBarIcon: ({ color }) => <FileUp color={color} size={20} /> }} />
      <Tabs.Screen name="credentials" options={{ title: 'Notary', tabBarIcon: ({ color }) => <BadgeCheck color={color} size={20} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Settings color={color} size={20} /> }} />
      <Tabs.Screen name="documents/upload" options={{ href: null }} />
      <Tabs.Screen name="chat" options={{ href: null }} />
    </Tabs>
  );
}
