import { Redirect } from 'expo-router';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';

export default function Index() {
  const { isHydrated, hasCompletedOnboarding, user, token } = useAuthStore();

  if (!isHydrated) {
    return (
      <ScreenContainer>
        <LoadingState />
      </ScreenContainer>
    );
  }

  if (user && token) {
    return <Redirect href={user.role === 'company' ? '/company/home' : '/notary/home'} />;
  }

  if (!hasCompletedOnboarding) return <Redirect href="/onboarding" />;
  if (!user || !token) return <Redirect href="/auth/login" />;
  return <Redirect href={user.role === 'company' ? '/company/home' : '/notary/home'} />;
}
