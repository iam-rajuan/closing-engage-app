import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { BackHandler, Image, Pressable, useWindowDimensions, View } from 'react-native';
import { ChevronRight, ShieldCheck, Zap } from 'lucide-react-native';
import { BrandLogo } from '@/components/common/BrandLogo';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { useAuthStore } from '@/features/auth/auth.store';
import { styles } from '@/features/shared/styles/screenStyles';
import { colors } from '@/theme';
export function OnboardingScreen() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { height, width } = useWindowDimensions();
  const completeOnboarding = useAuthStore((state) => state.completeOnboarding);
  const finish = async () => {
    await completeOnboarding();
    router.push('/auth/login');
  };
  const slides = [
    {
      title: 'Welcome to Closing\nEngage',
      description: 'Connect with notaries and manage\nclosing orders seamlessly',
      image: require('../../../../assets/onboarding/professional-collaboration.png'),
      imageStyle: styles.onboardingImageOne,
      framed: true,
      buttonLabel: 'Next',
    },
    {
      title: 'Manage Orders Easily',
      description: 'Create, assign, and track orders in\nreal-time',
      image: require('../../../../assets/onboarding/dashboard-workflow.png'),
      imageStyle: styles.onboardingImageTwo,
      framed: false,
      buttonLabel: 'Next',
    },
    {
      title: 'Fast, Secure, and\nReliable',
      description: 'Upload documents, communicate, and\ncomplete signings with confidence',
      image: require('../../../../assets/onboarding/security-illustration.png'),
      imageStyle: styles.onboardingImageThree,
      framed: false,
      buttonLabel: 'Get Started',
    },
  ];
  const slide = slides[Math.min(activeIndex, slides.length - 1)]!;
  const isCompact = height < 820;
  const isNarrow = width < 390;
  const frameSize = Math.min(width - 76, isCompact ? 262 : 286);
  const heroImageSize = frameSize - 44;
  const workflowImageSize = Math.min(width * 0.62, isCompact ? 222 : 244);
  const securityImageSize = Math.min(width * 0.42, isCompact ? 148 : 164);
  const titleSize = isNarrow ? 26 : 28;
  const descriptionSize = isNarrow ? 15 : 16;
  const goNext = () => {
    if (activeIndex === slides.length - 1) {
      void finish();
      return;
    }
    setActiveIndex((value) => value + 1);
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeIndex > 0) {
        setActiveIndex((value) => value - 1);
        return true;
      }

      return false;
    });

    return () => subscription.remove();
  }, [activeIndex]);

  return (
    <ScreenContainer scroll={false}>
        <View style={styles.onboardingScreen}>
          <View style={styles.onboardingHeader}>
          <BrandLogo width={isCompact ? 132 : 140} />
          {activeIndex < slides.length - 1 ? (
            <Pressable hitSlop={12} onPress={finish}>
              <AppText style={styles.skipText}>Skip</AppText>
            </Pressable>
          ) : null}
        </View>

        <View
          style={[
            styles.onboardingBody,
            isCompact && styles.onboardingBodyCompact,
            activeIndex === 2 && styles.onboardingBodySecurity,
          ]}
        >
          <View
            style={[
              styles.onboardingContent,
              isCompact && styles.onboardingContentCompact,
              activeIndex === 2 && styles.onboardingContentSecurity,
            ]}
          >
            <View
              style={[
                slide.framed ? styles.onboardingImageFrame : styles.onboardingImagePlain,
                slide.framed && { width: frameSize, height: frameSize },
              ]}
            >
              <Image
                source={slide.image}
                style={[
                  slide.imageStyle,
                  activeIndex === 0 && { width: heroImageSize, height: heroImageSize },
                  activeIndex === 1 && { width: workflowImageSize, height: workflowImageSize },
                  activeIndex === 2 && { width: securityImageSize, height: securityImageSize },
                ]}
                resizeMode="contain"
              />
            </View>

            <View
              style={[
                styles.onboardingCopy,
                activeIndex === 0 && styles.onboardingCopyWelcome,
                activeIndex === 1 && styles.onboardingCopyWorkflow,
                activeIndex === 2 && styles.onboardingCopyCompact,
                isCompact && styles.onboardingCopySmall,
              ]}
            >
              <AppText style={[styles.onboardingTitle, { fontSize: titleSize, lineHeight: titleSize + 6 }]}>
                {slide.title}
              </AppText>
              <AppText
                style={[
                  styles.onboardingDescription,
                  { fontSize: descriptionSize, lineHeight: descriptionSize + 8 },
                ]}
              >
                {slide.description}
              </AppText>
            </View>

            {activeIndex === 2 ? (
              <View style={[styles.onboardingFeatureRow, isCompact && styles.onboardingFeatureRowCompact]}>
                <View style={styles.onboardingFeatureCard}>
                  <ShieldCheck color={colors.primary} size={24} />
                  <AppText style={styles.onboardingFeatureText}>Encrypted</AppText>
                </View>
                <View style={styles.onboardingFeatureCard}>
                  <Zap color={colors.primary} size={24} />
                  <AppText style={styles.onboardingFeatureText}>Instant</AppText>
                </View>
              </View>
            ) : null}
          </View>

          <View style={[styles.onboardingFooter, isCompact && styles.onboardingFooterCompact]}>
            <View style={styles.onboardingDots}>
              {slides.map((item) => (
                <View
                  key={item.title}
                  style={[styles.onboardingDot, item.title === slide.title && styles.onboardingDotActive]}
                />
              ))}
            </View>

            <Pressable style={styles.onboardingButton} onPress={goNext}>
              <AppText style={styles.onboardingButtonText}>{slide.buttonLabel}</AppText>
              {activeIndex === 1 ? <ChevronRight color={colors.white} size={25} strokeWidth={2.6} /> : null}
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}


