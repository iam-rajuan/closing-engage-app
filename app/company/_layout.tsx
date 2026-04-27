import { Redirect, Tabs } from 'expo-router';
import { BriefcaseBusiness, FileText, Home, Settings, Users } from 'lucide-react-native';
import { colors } from '@/theme';
import { useAuthStore } from '@/features/auth/auth.store';

export default function CompanyLayout() {
  const user = useAuthStore((state) => state.user);
  if (!user || user.role !== 'company') return <Redirect href="/auth/login" />;
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
      <Tabs.Screen name="orders/index" options={{ title: 'Orders', tabBarIcon: ({ color }) => <BriefcaseBusiness color={color} size={20} /> }} />
      <Tabs.Screen name="documents/index" options={{ title: 'Documents', tabBarIcon: ({ color }) => <FileText color={color} size={20} /> }} />
      <Tabs.Screen name="team/index" options={{ title: 'Team', tabBarIcon: ({ color }) => <Users color={color} size={20} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Settings color={color} size={20} /> }} />
      <Tabs.Screen name="orders/create" options={{ href: null }} />
      <Tabs.Screen name="orders/[id]" options={{ href: null }} />
      <Tabs.Screen name="documents/[id]" options={{ href: null }} />
      <Tabs.Screen name="team/add" options={{ href: null }} />
    </Tabs>
  );
}
