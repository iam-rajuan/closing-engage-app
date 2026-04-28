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
        tabBarStyle: { 
          height: 64, 
          paddingBottom: 8, 
          paddingTop: 8, 
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: '#f1f5f9',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen 
        name="home" 
        options={{ 
          title: 'Home',
          href: '/company/home', 
          tabBarIcon: ({ color }) => <Home color={color} size={22} /> 
        }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ 
          title: 'Orders',
          href: '/company/orders', 
          tabBarIcon: ({ color }) => <BriefcaseBusiness color={color} size={22} /> 
        }} 
      />
      <Tabs.Screen 
        name="documents" 
        options={{ 
          title: 'Documents',
          href: '/company/documents', 
          tabBarIcon: ({ color }) => <FileText color={color} size={22} /> 
        }} 
      />
      <Tabs.Screen 
        name="team" 
        options={{ 
          title: 'Team',
          href: '/company/team', 
          tabBarIcon: ({ color }) => <Users color={color} size={22} /> 
        }} 
      />
      <Tabs.Screen 
        name="settings" 
        options={{ 
          title: 'Settings',
          href: '/company/settings', 
          tabBarIcon: ({ color }) => <Settings color={color} size={22} /> 
        }} 
      />
    </Tabs>
  );
}
