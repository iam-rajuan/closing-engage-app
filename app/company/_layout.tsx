import { Platform } from 'react-native';
import { Redirect, Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BriefcaseBusiness, FileText, Home, Settings, Users } from 'lucide-react-native';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { colors } from '@/theme';
import { useAuthStore } from '@/features/auth/auth.store';

export default function CompanyLayout() {
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const insets = useSafeAreaInsets();

  if (!isHydrated) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }
  
  if (!user || !token || user.role !== 'company') return <Redirect href="/auth/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { 
          height: Platform.OS === 'ios'
            ? (insets.bottom > 0 ? 56 + insets.bottom : 60)
            : 64 + (insets.bottom > 0 ? insets.bottom + 4 : 4), 
          paddingBottom: Platform.OS === 'ios'
            ? (insets.bottom > 0 ? insets.bottom : 8)
            : (insets.bottom > 0 ? insets.bottom + 12 : 12), 
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
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
