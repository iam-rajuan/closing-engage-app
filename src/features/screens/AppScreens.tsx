import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { BackHandler, Image, Pressable, StyleSheet, useWindowDimensions, View, ScrollView } from 'react-native';
import {
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Hourglass,
  Phone,
  Plus,
  Printer,
  Send,
  ShieldCheck,
  Upload,
  UserPlus,
  Zap,
  Search,
  SlidersHorizontal,
  Calendar,
  ChevronLeft,
  Info,
  Building,
  Bell,
  Clock,
  ArrowRight,
  ChevronDown,
  X,
  Star,
  MapPin,
  Mail,
} from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { BrandLogo } from '@/components/common/BrandLogo';
import { AppCard } from '@/components/common/AppCard';
import { AppHeader } from '@/components/common/AppHeader';
import { AppInput } from '@/components/common/AppInput';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { SectionHeader } from '@/components/common/SectionHeader';
import { ChatBubble } from '@/components/chat/ChatBubble';
import { DocumentCard } from '@/components/documents/DocumentCard';
import { UploadBox } from '@/components/documents/UploadBox';
import { OrderCard } from '@/components/orders/OrderCard';
import { OrderStatusTimeline } from '@/components/orders/OrderStatusTimeline';
import { ProgressPipeline } from '@/components/orders/ProgressPipeline';
import { ToggleRow } from '@/components/settings/ToggleRow';
import { SettingsForm } from './SettingsScreen';

import { TeamMemberCard } from '@/components/team/TeamMemberCard';
import {
  companyOrders,
  companyStats,
  credentials,
  documents,
  messages,
  notaryOrders,
  orderTimeline,
  pipeline,
  teamMembers,
} from '@/constants/mockData';
import { useAuthStore } from '@/features/auth/auth.store';
import { colors, radius, shadows, spacing } from '@/theme';
import { LoginForm, MemberForm, OrderForm, loginSchema, memberSchema, orderSchema } from '@/utils/validation';

// Helper for detail field in details page
function DetailField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <View style={styles.detailField}>
      <AppText variant="caption" muted style={styles.detailLabel}>{label}</AppText>
      <View style={styles.detailValueRow}>
        {icon && <View style={styles.detailIcon}>{icon}</View>}
        <AppText weight="bold" style={styles.detailValue}>{value}</AppText>
      </View>
    </View>
  );
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <AppText variant="caption" muted style={styles.fieldLabel}>{label}</AppText>
      <AppText style={styles.fieldValue}>{value}</AppText>
    </View>
  );
}

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
      image: require('../../../assets/onboarding/professional-collaboration.png'),
      imageStyle: styles.onboardingImageOne,
      framed: true,
      buttonLabel: 'Next',
    },
    {
      title: 'Manage Orders Easily',
      description: 'Create, assign, and track orders in\nreal-time',
      image: require('../../../assets/onboarding/dashboard-workflow.png'),
      imageStyle: styles.onboardingImageTwo,
      framed: false,
      buttonLabel: 'Next',
    },
    {
      title: 'Fast, Secure, and\nReliable',
      description: 'Upload documents, communicate, and\ncomplete signings with confidence',
      image: require('../../../assets/onboarding/security-illustration.png'),
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

export function LoginScreen() {
  const login = useAuthStore((state) => state.login);
  const { control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'your@email.com', password: '', role: 'company' },
  });
  const role = watch('role');
  const submit = handleSubmit(async (values) => {
    await login(values.role, values.email);
    router.replace(values.role === 'company' ? '/company/home' : '/notary/home');
  });
  return (
    <ScreenContainer contentStyle={styles.authScreen}>
      <View style={styles.centerBlock}>
        <BrandLogo width={156} />
        <AppText style={styles.loginTitle}>Welcome back</AppText>
        <AppText muted>Your soft space is waiting for you.</AppText>
      </View>
      <AppCard style={styles.formCard}>
        <Controller control={control} name="email" render={({ field }) => <AppInput label="Email" value={field.value} onChangeText={field.onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} />
        <Controller control={control} name="password" render={({ field }) => <AppInput label="Password" value={field.value} onChangeText={field.onChange} placeholder="Enter your password" secureTextEntry error={errors.password?.message} />} />
        <Pressable onPress={() => router.push('/auth/forgot-password')}><AppText variant="caption" style={styles.rightLink}>Forgot password?</AppText></Pressable>
        <View style={styles.segment}>
          <Pressable style={[styles.segmentItem, role === 'company' && styles.segmentActive]} onPress={() => setValue('role', 'company')}><AppText weight="bold" style={role === 'company' && styles.segmentTextActive}>Signing Company</AppText></Pressable>
          <Pressable style={[styles.segmentItem, role === 'notary' && styles.segmentActive]} onPress={() => setValue('role', 'notary')}><AppText weight="bold" style={role === 'notary' && styles.segmentTextActive}>Notary</AppText></Pressable>
        </View>
        <AppButton title="Log In" onPress={submit} loading={isSubmitting} />
      </AppCard>
    </ScreenContainer>
  );
}

export function ForgotPasswordScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Forgot Password" />
      <AppCard style={styles.formCard}>
        <AppInput label="Email" placeholder="your@email.com" />
        <AppButton title="Send Reset Link" />
      </AppCard>
    </ScreenContainer>
  );
}

export function CompanyHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <ScreenContainer 
      scroll 
      contentStyle={styles.homeContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      <View style={styles.homeGreeting}>
        <AppText variant="caption" muted style={styles.overviewLabel}>Overview</AppText>
        <AppText variant="subtitle" style={styles.greetingText}>Good morning, Alex.</AppText>
      </View>
      
      <View style={styles.ordersStatsGrid}>
        <AppCard style={styles.statCardLarge}>
          <View style={styles.statHeader}>
            <AppText variant="caption" muted style={styles.statTitle}>Total Orders</AppText>
            <View style={styles.statIconBadge}>
              <FileText color={colors.primary} size={18} />
            </View>
          </View>
          <AppText style={styles.statValueLarge}>1,248</AppText>
        </AppCard>
        <View style={styles.statRowSmall}>
          <AppCard style={styles.statCardSmall}>
            <AppText variant="caption" muted style={styles.statTitle}>PENDING REVIEW</AppText>
            <AppText style={styles.statValueSmall}>56</AppText>
          </AppCard>
          <AppCard style={styles.statCardSmall}>
            <AppText variant="caption" muted style={styles.statTitle}>COMPLETED TODAY</AppText>
            <AppText style={styles.statValueSmall}>850</AppText>
          </AppCard>
        </View>
      </View>

      <ProgressPipeline items={pipeline} />
      <SectionHeader title="Recent Orders" action="View All" style={styles.homeSection} />
      <View style={styles.orderList}>
        {companyOrders.map((order) => <OrderCard key={order.id} order={order} href={`/company/orders/${order.id}` as Href} />)}
      </View>
    </ScreenContainer>
  );
}

export function CompanyOrdersScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Orders</AppText>
        <AppText muted style={styles.pageSubtitle}>Manage and track all your closing orders</AppText>
      </View>

      <AppButton 
        title="Create New Order" 
        icon={<Plus color={colors.white} size={18} />} 
        onPress={() => router.push('/company/orders/create')} 
        style={styles.createBtn}
      />

      <View style={styles.ordersStatsGrid}>
        <AppCard style={styles.statCardLarge}>
          <View style={styles.statHeader}>
            <AppText variant="caption" muted style={styles.statTitle}>Total Orders</AppText>
            <View style={styles.statIconBadge}>
              <FileText color={colors.primary} size={18} />
            </View>
          </View>
          <AppText style={styles.statValueLarge}>1,248</AppText>
        </AppCard>
        <View style={styles.statRowSmall}>
          <AppCard style={styles.statCardSmall}>
            <AppText variant="caption" muted style={styles.statTitle}>PENDING REVIEW</AppText>
            <AppText style={styles.statValueSmall}>56</AppText>
          </AppCard>
          <AppCard style={styles.statCardSmall}>
            <AppText variant="caption" muted style={styles.statTitle}>COMPLETED TODAY</AppText>
            <AppText style={styles.statValueSmall}>850</AppText>
          </AppCard>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput 
          placeholder="Search orders..." 
          style={styles.searchInput} 
          containerStyle={styles.searchBox} 
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Status</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Calendar color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Date Range</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <SlidersHorizontal color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Newest</AppText>
        </Pressable>
      </View>

      <View style={styles.orderList}>
        {companyOrders.map((order) => <OrderCard key={order.id} order={order} href={`/company/orders/${order.id}` as Href} />)}
      </View>

      <View style={styles.paginationContainer}>
        <Pressable style={styles.pageArrow}><ChevronLeft color="#64748b" size={18} /></Pressable>
        <View style={styles.pageNumbers}>
          <View style={[styles.pageNumber, styles.pageActive]}><AppText style={styles.pageTextActive}>1</AppText></View>
          <View style={styles.pageNumber}><AppText style={styles.pageText}>2</AppText></View>
          <View style={styles.pageNumber}><AppText style={styles.pageText}>3</AppText></View>
        </View>
        <Pressable style={styles.pageArrow}><ArrowRight color="#64748b" size={18} /></Pressable>
      </View>
    </ScreenContainer>
  );
}

export function CreateOrderScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [scanBacks, setScanBacks] = useState<'yes' | 'no'>('no');

  const { control, handleSubmit, formState: { errors } } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { title: '', clientName: '', propertyAddress: '', city: '', state: 'TX', zip: '', signingDate: '', loanType: 'Refinance', requirements: '', preferredNotary: '', instructions: '' },
  });

  const submit = handleSubmit(() => router.replace('/company/orders'));

  const input = (name: keyof OrderForm, label: string, placeholder?: string) => (
    <Controller control={control} name={name} render={({ field }) => <AppInput label={label} value={String(field.value ?? '')} onChangeText={field.onChange} placeholder={placeholder} error={errors[name]?.message} />} />
  );

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={() => {}}>
      <AppHeader back title="Create New Order" onProfilePress={() => router.push('/company/settings')} />
      
      {/* Section 1: Order Information */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Info color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Order Information</AppText>
        </View>
        
        {input('title', 'ORDER TITLE', 'e.g. Smith Refinance')}
        {input('clientName', 'CLIENT NAME', 'Full legal name')}
        {input('propertyAddress', 'PROPERTY ADDRESS', 'Street address')}
        <View style={styles.threeCols}>
          <View style={{ flex: 2 }}>{input('city', 'CITY')}</View>
          <View style={{ flex: 1 }}>{input('state', 'STATE')}</View>
          <View style={{ flex: 1 }}>{input('zip', 'ZIP')}</View>
        </View>
        
        <View>
          <AppText variant="caption" muted style={styles.fieldLabel}>SIGNING DATE</AppText>
          <Pressable style={styles.datePicker}>
            <AppText style={styles.dateText}>mm/dd/yyyy</AppText>
            <Calendar color="#64748b" size={16} />
          </Pressable>
        </View>
      </AppCard>

      {/* Section 2: Loan Details */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Building color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Loan Details</AppText>
        </View>
        
        <View>
          <AppText variant="caption" muted style={styles.fieldLabel}>LOAN TYPE</AppText>
          <View style={styles.picker}>
            <AppText>Refinance</AppText>
            <ChevronDown color="#64748b" size={18} />
          </View>
        </View>

        <View style={styles.subSection}>
          <AppText weight="bold">Requirements</AppText>
          <AppText variant="caption" muted style={styles.requirementLabel}>SCAN BACKS REQUIRED</AppText>
          <View style={styles.radioRow}>
            <Pressable style={styles.radioItem} onPress={() => setScanBacks('yes')}>
              <View style={[styles.radioCircle, scanBacks === 'yes' && styles.radioActive]} />
              <AppText>Yes, required</AppText>
            </Pressable>
            <Pressable style={styles.radioItem} onPress={() => setScanBacks('no')}>
              <View style={[styles.radioCircle, scanBacks === 'no' && styles.radioActive]} />
              <AppText>No</AppText>
            </Pressable>
          </View>
        </View>
      </AppCard>

      {/* Section 3: Instructions */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <FileText color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Instructions</AppText>
        </View>
        
        <View>
          <AppText variant="caption" muted style={styles.fieldLabel}>PREFERRED NOTARY</AppText>
          <View style={styles.picker}>
            <AppText style={{ color: '#94a3b8' }}>Select Notary (Optional)</AppText>
            <ChevronDown color="#64748b" size={18} />
          </View>
        </View>

        {input('instructions', 'SPECIAL INSTRUCTIONS', 'Additional notes for the notary...')}
      </AppCard>

      {/* Order Priority */}
      <View style={styles.priorityContainer}>
        <AppText weight="bold">Order Priority</AppText>
        <View style={styles.priorityRow}>
          <Pressable 
            style={[styles.priorityBtn, priority === 'normal' && styles.priorityNormalActive]} 
            onPress={() => setPriority('normal')}
          >
            <Clock color={priority === 'normal' ? colors.primary : '#64748b'} size={20} />
            <AppText weight="bold" style={[styles.priorityBtnText, priority === 'normal' && { color: colors.primary }]}>NORMAL</AppText>
          </Pressable>
          <Pressable 
            style={[styles.priorityBtn, priority === 'urgent' && styles.priorityUrgentActive]} 
            onPress={() => setPriority('urgent')}
          >
            <Zap color={priority === 'urgent' ? '#dc2626' : '#64748b'} size={20} />
            <AppText weight="bold" style={[styles.priorityBtnText, priority === 'urgent' && { color: '#dc2626' }]}>URGENT</AppText>
          </Pressable>
        </View>
      </View>

      {/* Section 4: Supporting Documents */}
      <AppCard style={styles.formCard}>
        <View style={styles.sectionTitleRow}>
          <Plus color={colors.primary} size={18} />
          <AppText weight="bold" style={styles.sectionTitle}>Supporting Documents</AppText>
        </View>
        
        <View style={styles.figmaUploadBox}>
          <View style={styles.uploadCircle}><Plus color={colors.primary} size={24} /></View>
          <AppText weight="bold" style={styles.uploadMainText}>Tap to upload files</AppText>
          <AppText variant="caption" muted>PDF, JPG, or PNG (Max 25MB)</AppText>
        </View>

        <View style={styles.fileItem}>
          <View style={styles.fileIcon}><FileText color="#dc2626" size={18} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={styles.fileName}>Closing_Statement_V1.pdf</AppText>
            <AppText variant="caption" muted>1.2 MB</AppText>
          </View>
          <X color="#64748b" size={18} />
        </View>
      </AppCard>

      <View style={styles.actionRow}>
        <AppButton title="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => router.back()} />
        <AppButton title="Submit Order" style={{ flex: 2, backgroundColor: '#0a49a8' }} onPress={submit} />
      </View>
    </ScreenContainer>
  );
}

export function CompanyOrderDetailsScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Order Details" onProfilePress={() => router.push('/company/settings')} />
      
      <AppCard style={styles.detailsMainCard}>
        <View style={styles.detailsHeader}>
          <AppText style={styles.detailsOrderNum}>Order #CE-9421</AppText>
          <Badge label="APPROVED" tone="green" />
        </View>
        
        <DetailField label="CLIENT" value="Mila Waters" />
        <DetailField 
          label="SIGNING DATE & TIME" 
          value="Mar 18, 2026, 2:45 PM" 
          icon={<Calendar color={colors.primary} size={14} />} 
        />
        <DetailField 
          label="PROPERTY ADDRESS" 
          value="442 Prospect St, Dallas TX 75201" 
          icon={<MapPin color={colors.primary} size={14} />} 
        />
      </AppCard>

      <View style={styles.specialInstructionBox}>
        <Info color={colors.primary} size={18} />
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={colors.primary}>Special Instructions</AppText>
          <AppText style={styles.instructionText}>
            Client requested a bilingual notary if possible. Please ensure all documents are signed with blue ink as per lender requirements. Park in the visitor section near building B.
          </AppText>
        </View>
      </View>

      <AppCard style={styles.engagementCard}>
        <View style={styles.engagementIconBox}>
          <Calendar color={colors.primary} size={24} />
        </View>
        <View>
          <AppText variant="caption" muted style={styles.engagementSub}>Closing Engagement</AppText>
          <AppText weight="bold" style={styles.engagementTitle}>Tuesday, Apr 24 • 02:00 PM</AppText>
        </View>
      </AppCard>

      <View style={styles.detailsSection}>
        <AppText weight="bold" style={styles.detailsSectionTitle}>Assigned Notary</AppText>
        <AppCard style={styles.notaryProfileCard}>
          <View style={styles.notaryInfoLarge}>
            <View style={styles.notaryAvatarBox}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=128&auto=format&fit=crop' }} 
                style={styles.notaryAvatarLg} 
              />
              <View style={styles.onlineDot} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={styles.notaryNameLg}>Sarah Jenkins</AppText>
              <View style={styles.ratingRow}>
                <Star color="#eab308" fill="#eab308" size={14} />
                <AppText style={styles.ratingText}>4.9</AppText>
                <Badge label="Available" tone="green" />
              </View>
            </View>
          </View>
          <Pressable style={styles.viewProfileBtn}>
            <AppText weight="bold" style={styles.viewProfileText}>View Full Profile</AppText>
          </Pressable>
        </AppCard>
      </View>

      <View style={styles.detailsSection}>
        <View style={styles.sectionHeaderWithCount}>
          <AppText weight="bold" style={styles.detailsSectionTitle}>Documents</AppText>
          <AppText variant="caption" muted weight="bold">1 File</AppText>
        </View>
        <AppCard style={styles.fileCardDetails}>
          <View style={styles.fileIconBox}><FileText color="#dc2626" size={20} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold">closing_statement.pdf</AppText>
            <AppText variant="caption" muted>2.4 MB</AppText>
          </View>
          <Pressable style={styles.downloadBtn}><Download color="#64748b" size={18} /></Pressable>
        </AppCard>
      </View>

      <View style={styles.detailsSection}>
        <AppText weight="bold" style={styles.detailsSectionTitle}>Order Status</AppText>
        <AppCard style={styles.statusCard}>
          <OrderStatusTimeline steps={orderTimeline} />
        </AppCard>
      </View>

      <View style={styles.detailsSection}>
        <AppText weight="bold" style={styles.detailsSectionTitle}>Activity Log</AppText>
        <AppCard style={styles.logCard}>
          <View style={styles.logItem}>
            <View style={styles.logIconBox}><FileText color={colors.primary} size={16} /></View>
            <View style={{ flex: 1 }}>
              <View style={styles.logHeader}>
                <AppText weight="bold">Documents Verified</AppText>
                <AppText variant="caption" muted>1h ago</AppText>
              </View>
              <AppText variant="caption" muted>System automatically verified the uploaded PDF for integrity and signature fields.</AppText>
            </View>
          </View>
          <View style={styles.logDivider} />
          <View style={styles.logItem}>
            <View style={styles.logIconBox}><UserPlus color={colors.primary} size={16} /></View>
            <View style={{ flex: 1 }}>
              <View style={styles.logHeader}>
                <AppText weight="bold">Notary Re-assigned</AppText>
                <AppText variant="caption" muted>3h ago</AppText>
              </View>
              <AppText variant="caption" muted>Sarah Jenkins accepted the updated order time for the Prospect St location.</AppText>
            </View>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

export function DocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Documents</AppText>
        <AppText muted style={styles.pageSubtitle}>Access and download your approved files</AppText>
      </View>

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput 
          placeholder="Filter by Order" 
          style={styles.searchInput} 
          containerStyle={styles.searchBox} 
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={[styles.filterBtn, styles.filterBtnActive]}>
          <FileText color={colors.white} size={14} />
          <AppText style={[styles.filterBtnText, styles.filterBtnTextActive]}>PDF Only</AppText>
        </Pressable>
        <Pressable style={styles.filterBtn}>
          <Calendar color="#64748b" size={14} />
          <AppText style={styles.filterBtnText}>Filter by Date</AppText>
        </Pressable>
        <Pressable style={styles.clearBtn}>
          <AppText style={styles.clearBtnText}>Clear</AppText>
        </Pressable>
      </View>

      <View style={styles.documentList}>
        {documents.map((doc) => (
          <DocumentCard 
            key={doc.id} 
            doc={doc} 
            onView={() => router.push(`/company/documents/${doc.id}`)} 
          />
        ))}
      </View>

      <View style={styles.listFooter}>
        <AppText style={styles.resultsCount} muted>Showing 3 of 12 documents</AppText>
        <AppButton 
          title="Load More" 
          variant="secondary" 
          style={styles.loadMoreBtn}
          textStyle={styles.loadMoreText}
        />
      </View>
    </ScreenContainer>
  );
}


export function DocumentViewScreen() {
  return (
    <ScreenContainer>
      <AppHeader 
        back 
        centerTitle 
        title="Document View" 
        onProfilePress={() => router.push('/company/settings')} 
      />
      
      <View style={styles.previewContainer}>
        <View style={styles.previewContent}>
          <FileText color="#cbd5e1" size={140} strokeWidth={1} />
          {/* Mock document representation */}
          <View style={styles.mockDocLayer}>
            <View style={styles.mockDocTitle} />
            <View style={styles.mockDocLine} />
            <View style={styles.mockDocLine} />
            <View style={styles.mockDocGrid}>
              <View style={styles.mockDocBox} />
              <View style={styles.mockDocBox} />
            </View>
          </View>
        </View>
        <View style={styles.previewControls}>
          <View style={styles.zoomPill}>
            <Pressable><AppText style={styles.zoomBtn}>−</AppText></Pressable>
            <AppText style={styles.zoomText}>85%</AppText>
            <Pressable><AppText style={styles.zoomBtn}>+</AppText></Pressable>
            <View style={styles.zoomDivider} />
            <Pressable><ChevronLeft color="#fff" size={16} /></Pressable>
            <AppText style={styles.zoomText}>1/12</AppText>
            <Pressable><ChevronRight color="#fff" size={16} /></Pressable>
          </View>
        </View>
      </View>

      <View style={styles.viewActionRow}>
        <AppButton 
          title="Download" 
          icon={<Download color={colors.white} size={18} />} 
          style={styles.viewDownloadBtn}
        />
        <AppButton 
          title="Print" 
          variant="secondary" 
          icon={<Printer color={colors.primary} size={18} />} 
          style={styles.viewPrintBtn}
        />
      </View>

      <AppCard style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <AppText weight="bold" style={styles.infoCardTitle}>File Details</AppText>
          <Badge label="APPROVED" tone="green" />
        </View>
        
        <View style={styles.fieldGrid}>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>NAME</AppText>
            <AppText weight="bold" style={styles.fieldValue}>Closing_Disclosure_Final.pdf</AppText>
          </View>
          <View style={styles.fieldHalf}>
            <AppText variant="caption" muted style={styles.fieldLabel}>SIZE</AppText>
            <AppText weight="bold" style={styles.fieldValue}>2.4 MB</AppText>
          </View>
          <View style={styles.fieldHalf}>
            <AppText variant="caption" muted style={styles.fieldLabel}>DATE</AppText>
            <AppText weight="bold" style={styles.fieldValue}>Apr 15, 2026</AppText>
          </View>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>UPLOADED BY</AppText>
            <View style={styles.uploadedByRow}>
              <View style={styles.userAvatarSm}>
                <AppText style={styles.userAvatarText}>JD</AppText>
              </View>
              <AppText weight="bold" style={styles.fieldValue}>Janet Doe (Notary)</AppText>
            </View>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.infoCard}>
        <AppText weight="bold" style={styles.infoCardTitle}>Order Information</AppText>
        <View style={styles.fieldGrid}>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>CLIENT NAME</AppText>
            <AppText weight="bold" style={styles.fieldValue}>Robert & Sarah Montgomery</AppText>
          </View>
          <View style={styles.fieldFull}>
            <AppText variant="caption" muted style={styles.fieldLabel}>PROPERTY ADDRESS</AppText>
            <AppText weight="bold" style={styles.fieldValue}>8421 Whispering Pines Dr, Austin, TX 78729</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard style={styles.infoCard}>
        <AppText weight="bold" style={styles.infoCardTitle}>Recent Activity</AppText>
        
        <View style={styles.activityTimeline}>
          <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={[styles.activityIcon, { backgroundColor: '#0a49a8' }]}>
                <CheckCircle2 color="#fff" size={12} />
              </View>
              <View style={styles.activityLine} />
            </View>
            <View style={styles.activityRight}>
              <View style={styles.activityHeader}>
                <AppText weight="bold" style={styles.activityTitle}>Approved by Admin</AppText>
              </View>
              <AppText variant="caption" muted style={styles.activitySub}>Final review completed by Michael S.</AppText>
              <AppText variant="caption" muted style={styles.activityTime}>TODAY, 2:45 PM</AppText>
            </View>
          </View>

          <View style={styles.activityItem}>
            <View style={styles.activityLeft}>
              <View style={[styles.activityIcon, { backgroundColor: '#eff6ff' }]}>
                <FileText color="#0a49a8" size={12} />
              </View>
            </View>
            <View style={styles.activityRight}>
              <View style={styles.activityHeader}>
                <AppText weight="bold" style={styles.activityTitle}>Uploaded by Notary</AppText>
              </View>
              <AppText variant="caption" muted style={styles.activitySub}>Signed disclosure docs attached.</AppText>
              <AppText variant="caption" muted style={styles.activityTime}>APR 14, 11:20 AM</AppText>
            </View>
          </View>
        </View>
      </AppCard>
      
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}


export function TeamScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader onProfilePress={() => router.push('/company/settings')} />
      
      <View style={styles.pageHeader}>
        <AppText style={styles.pageTitle}>Team Management</AppText>
        <AppText muted style={styles.pageSubtitle}>Manage your company team members and roles</AppText>
      </View>

      <AppButton 
        title="Add Member" 
        icon={<UserPlus color={colors.white} size={18} />} 
        onPress={() => router.push('/company/team/add')} 
        style={styles.teamAddBtn}
      />

      <View style={styles.searchContainer}>
        <Search color="#94a3b8" size={18} style={styles.searchIcon} />
        <AppInput 
          placeholder="Search members..." 
          style={styles.searchInput} 
          containerStyle={styles.searchBox} 
        />
      </View>

      <View style={styles.filterRow}>
        <Pressable style={styles.dropdownBtn}>
          <AppText style={styles.dropdownText}>Role: All</AppText>
          <ChevronDown color="#64748b" size={16} />
        </Pressable>
        <Pressable style={styles.dropdownBtn}>
          <AppText style={styles.dropdownText}>Status: Active</AppText>
          <ChevronDown color="#64748b" size={16} />
        </Pressable>
      </View>

      <View style={styles.memberList}>
        {teamMembers.map((member) => <TeamMemberCard key={member.id} member={member} />)}
      </View>
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}

export function AddMemberScreen() {
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');
  const [permissions, setPermissions] = useState({
    create: true,
    view: true,
    download: false
  });

  const { control, handleSubmit, formState: { errors } } = useForm<MemberForm>({ 
    resolver: zodResolver(memberSchema), 
    defaultValues: { fullName: '', phone: '', email: '' } 
  });
  
  const submit = handleSubmit(() => router.replace('/company/team'));

  return (
    <ScreenContainer>
      <AppHeader 
        back 
        centerTitle 
        title="Add New Member" 
        onProfilePress={() => router.push('/company/settings')} 
      />
      
      <View style={styles.formSection}>
        <Controller 
          control={control} 
          name="fullName" 
          render={({ field }) => (
            <AppInput 
              label="FULL NAME" 
              placeholder="e.g. Alexander Pierce" 
              value={field.value} 
              onChangeText={field.onChange} 
              error={errors.fullName?.message} 
            />
          )} 
        />
        <Controller 
          control={control} 
          name="phone" 
          render={({ field }) => (
            <AppInput 
              label="PHONE" 
              placeholder="+1 (555) 000-0000" 
              value={field.value} 
              onChangeText={field.onChange} 
              rightElement={<AppText variant="caption" muted style={{ fontSize: 10 }}>OPTIONAL</AppText>}
            />
          )} 
        />
        <Controller 
          control={control} 
          name="email" 
          render={({ field }) => (
            <AppInput 
              label="EMAIL ADDRESS" 
              placeholder="alexander@company.com" 
              value={field.value} 
              onChangeText={field.onChange} 
              error={errors.email?.message} 
            />
          )} 
        />
      </View>

      <View style={styles.roleSelectionSection}>
        <AppText variant="label" muted style={styles.formSectionLabel}>SELECT ROLE</AppText>
        <View style={styles.roleRow}>
          <Pressable 
            style={[styles.roleSelectCard, role === 'Admin' && styles.roleSelectCardActive]} 
            onPress={() => setRole('Admin')}
          >
            <View style={[styles.roleIconBox, role === 'Admin' && styles.roleIconBoxActive]}>
              <ShieldCheck color={role === 'Admin' ? '#0a49a8' : '#94a3b8'} size={24} />
            </View>
            <AppText weight="bold" style={[styles.roleCardTitle, role === 'Admin' && styles.roleCardTitleActive]}>Admin</AppText>
            <AppText variant="caption" muted style={styles.roleCardDesc}>Full system access and member management</AppText>
            {role === 'Admin' && <View style={styles.roleCheckCircle}><CheckCircle2 color="#0a49a8" size={16} /></View>}
          </Pressable>

          <Pressable 
            style={[styles.roleSelectCard, role === 'Member' && styles.roleSelectCardActive]} 
            onPress={() => setRole('Member')}
          >
            <View style={[styles.roleIconBox, role === 'Member' && styles.roleIconBoxActive]}>
              <Briefcase color={role === 'Member' ? '#0a49a8' : '#94a3b8'} size={24} />
            </View>
            <AppText weight="bold" style={[styles.roleCardTitle, role === 'Member' && styles.roleCardTitleActive]}>Member</AppText>
            <AppText variant="caption" muted style={styles.roleCardDesc}>Limited access to specific projects and files</AppText>
            {role === 'Member' && <View style={styles.roleCheckCircle}><CheckCircle2 color="#0a49a8" size={16} /></View>}
          </Pressable>
        </View>
      </View>

      <AppCard style={styles.permissionsCard}>
        <AppText weight="bold" style={styles.permissionsTitle}>MEMBER PERMISSIONS</AppText>
        <Pressable style={styles.checkRow} onPress={() => setPermissions(p => ({ ...p, create: !p.create }))}>
          <View style={[styles.checkBox, permissions.create && styles.checkBoxActive]}>
            {permissions.create && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>Create Orders</AppText>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => setPermissions(p => ({ ...p, view: !p.view }))}>
          <View style={[styles.checkBox, permissions.view && styles.checkBoxActive]}>
            {permissions.view && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>View Orders</AppText>
        </Pressable>
        <Pressable style={styles.checkRow} onPress={() => setPermissions(p => ({ ...p, download: !p.download }))}>
          <View style={[styles.checkBox, permissions.download && styles.checkBoxActive]}>
            {permissions.download && <CheckCircle2 color="#fff" size={14} />}
          </View>
          <AppText weight="bold" style={styles.checkLabel}>Download Documents</AppText>
        </Pressable>
      </AppCard>

      <AppCard style={styles.inviteToggleCard}>
        <View style={styles.inviteToggleRow}>
          <View style={styles.inviteIconBox}><Mail color="#64748b" size={18} /></View>
          <AppText weight="bold" style={styles.inviteText}>Send invitation email</AppText>
          <View style={styles.toggleSwitch}><View style={styles.toggleKnob} /></View>
        </View>
      </AppCard>

      <View style={styles.formActions}>
        <AppButton title="Add Member" style={styles.addMemberBtn} onPress={submit} />
        <Pressable onPress={() => router.back()} style={styles.cancelLink}>
          <AppText weight="bold" style={styles.cancelLinkText}>Cancel</AppText>
        </Pressable>
      </View>
      
      <View style={{ height: 40 }} />
    </ScreenContainer>
  );
}


export function CompanySettingsScreen() {
  return <SettingsForm role="company" />;
}

function StatCard({ label, value, icon, sublabel, color }: any) {
  return (
    <AppCard style={notaryStyles.statCard}>
      <View style={[notaryStyles.iconBox, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <View style={notaryStyles.statTextContent}>
        <AppText variant="caption" muted weight="bold" style={{ fontSize: 9, letterSpacing: 0.6 }}>{sublabel}</AppText>
        <AppText weight="bold" style={notaryStyles.statLabel}>{label}</AppText>
      </View>
      <AppText style={notaryStyles.statValueLarge}>{value}</AppText>
    </AppCard>
  );
}

function NotaryOrderCard({ order }: { order: any }) {
  const initials = order.clientName.split(' ').map((n: string) => n[0]).join('');
  
  return (
    <AppCard style={notaryStyles.orderCard}>
      <View style={notaryStyles.orderTop}>
        <View style={[notaryStyles.initialsAvatar, { backgroundColor: '#dbeafe' }]}>
          <AppText weight="bold" style={{ color: '#1d4ed8', fontSize: 15 }}>{initials}</AppText>
        </View>
        <View style={{ flex: 1 }}>
          <AppText weight="bold" style={notaryStyles.orderClientName}>{order.clientName}</AppText>
          <AppText variant="caption" muted style={{ fontWeight: '600', fontSize: 12 }}>#{order.orderNumber.replace('#', '')}</AppText>
        </View>
        <Badge label={order.status} tone={order.status === 'In Progress' ? 'blue' : 'gray'} />
      </View>

      <View style={notaryStyles.orderInfoRow}>
        <View style={notaryStyles.infoItem}>
          <MapPin size={15} color="#0a49a8" />
          <View>
            <AppText variant="caption" muted weight="bold" style={{ fontSize: 9 }}>LOCATION</AppText>
            <AppText weight="bold" style={{ color: '#0f172a', fontSize: 13 }}>Denver, CO</AppText>
          </View>
        </View>
        <View style={notaryStyles.infoItem}>
          <Calendar size={15} color="#0a49a8" />
          <View>
            <AppText variant="caption" muted weight="bold" style={{ fontSize: 9 }}>DATE & TIME</AppText>
            <AppText weight="bold" style={{ color: '#0f172a', fontSize: 13 }}>{order.signingDate}</AppText>
          </View>
        </View>
      </View>

      <View style={notaryStyles.orderFooter}>
        <View style={{ flex: 1 }}>
          {order.status === 'Pending Upload' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Info size={14} color="#ef4444" />
              <AppText variant="caption" weight="bold" style={{ color: '#ef4444' }}>Action Required</AppText>
            </View>
          ) : order.status === 'Assigned' ? (
            <AppText weight="bold" style={{ color: '#64748b', fontSize: 11 }}>Pending initial signature</AppText>
          ) : (
            <View style={notaryStyles.avatarGroup}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=64&auto=format&fit=crop' }} style={notaryStyles.miniAvatar} />
              <Image source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=64&auto=format&fit=crop' }} style={[notaryStyles.miniAvatar, { marginLeft: -10 }]} />
            </View>
          )}
        </View>
        <Pressable style={notaryStyles.viewDetailsBtn} onPress={() => router.push(`/notary/assigned/${order.id}` as Href)}>
          <AppText weight="bold" style={notaryStyles.viewDetailsText}>VIEW DETAILS</AppText>
          <ArrowRight size={16} color="#0a49a8" />
        </Pressable>
      </View>
    </AppCard>
  );
}

const notaryStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 14,
    marginBottom: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContent: {
    flex: 1,
    gap: 1,
  },
  statLabel: {
    fontSize: 14,
    color: '#1e293b',
  },
  statValueLarge: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#ef4444',
  },
  orderCard: {
    padding: 14,
    marginBottom: 12,
    gap: 14,
  },
  orderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  initialsAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderClientName: {
    fontSize: 18,
    color: '#0f172a',
  },
  orderInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  avatarGroup: {
    flexDirection: 'row',
  },
  miniAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 11,
    color: '#0a49a8',
    letterSpacing: 0.4,
  },
});

export function NotaryHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };
  
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh} contentStyle={{ paddingBottom: 40 }}>
      <View style={notaryStyles.header}>
        <BrandLogo width={140} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable>
            <Bell color="#334155" size={24} />
          </Pressable>
          <Pressable onPress={() => router.push('/notary/settings')}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&auto=format&fit=crop' }} 
              style={{ width: 36, height: 36, borderRadius: 18 }} 
            />
          </Pressable>
        </View>
      </View>

      <View style={{ marginTop: 16, marginBottom: 16 }}>
        <AppText weight="bold" style={{ fontSize: 24, color: '#0a49a8' }}>Assigned Workload</AppText>
        <AppText muted style={{ fontSize: 13, marginTop: 4, lineHeight: 18 }}>
          Manage your active signing appointments and document verifications from a central atrium.
        </AppText>
      </View>

      <AppButton 
        title="Upload Documents" 
        icon={<Upload color="#fff" size={18} />} 
        onPress={() => router.push('/notary/documents/upload')} 
        style={{ marginBottom: 32, backgroundColor: '#0a49a8', height: 48 }}
        textStyle={{ fontSize: 15 }}
      />

      <StatCard 
        label="Total Assigned" 
        sublabel="GLOBAL" 
        value="24" 
        color="#3b82f6" 
        icon={<FileText color="#3b82f6" size={20} />} 
      />
      <StatCard 
        label="In Progress" 
        sublabel="ACTIVE" 
        value="08" 
        color="#f97316" 
        icon={<Zap color="#f97316" size={20} />} 
      />
      <StatCard 
        label="Completed" 
        sublabel="HISTORY" 
        value="13" 
        color="#22c55e" 
        icon={<CheckCircle2 color="#22c55e" size={20} />} 
      />

      <View style={notaryStyles.sectionTitleRow}>
        <AppText weight="bold" style={{ fontSize: 18, color: '#0a49a8' }}>Assigned Orders</AppText>
        <View style={notaryStyles.liveBadge}>
          <View style={notaryStyles.dot} />
          <AppText variant="caption" weight="bold" style={{ color: '#64748b' }}>LIVE UPDATES</AppText>
        </View>
      </View>

      {notaryOrders.map((order) => (
        <NotaryOrderCard key={order.id} order={order} />
      ))}
    </ScreenContainer>
  );
}

export function NotaryAssignedScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Assigned" onProfilePress={() => router.push('/notary/settings')} />
      <AppInput placeholder="Filter by Order" />
      <View style={styles.filterRow}><Badge label="ALL ORDERS" /><Badge label="ASSIGNED" tone="gray" /><Badge label="IN PROGRESS" tone="gray" /></View>
      <SectionHeader title="Current Assignments" />
      {notaryOrders.map((order) => <OrderCard key={order.id} order={order} href={`/notary/assigned/${order.id}` as Href} />)}
      <AppCard style={styles.formCard}><AppText weight="bold">Status Reference</AppText><FieldRow label="Status: Assigned" value="Order is confirmed and awaiting notary action." /><FieldRow label="Status: In Progress" value="The signing process has been initiated." /><FieldRow label="Status: Submitted" value="Documentation has been uploaded and is in review." /></AppCard>
    </ScreenContainer>
  );
}

export function NotaryOrderDetailsScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Order Details" onProfilePress={() => router.push('/notary/settings')} />
      <Badge label="ASSIGNED" />
      <AppCard style={styles.formCard}><AppText weight="bold">Workflow Progress</AppText><FieldRow label="Docs Ready to Print" value="Completed Oct 23, 11:30 AM" /><FieldRow label="Docs Printed by Notary" value="Waiting for confirmation" /><FieldRow label="Scanbacks Uploaded" value="Final step" /></AppCard>
      <AppCard style={styles.formCard}><FieldRow label="Client" value="Jonathan Aris" /><FieldRow label="Signing Schedule" value="Oct 24, 2023 at 2:00 PM" /><FieldRow label="Property Addresses" value="123 Oak St, Austin, TX 78701 · San Francisco, CA" /></AppCard>
      <Pressable style={styles.navRow} onPress={() => router.push('/notary/assigned/schedule')}><AppText weight="bold">Schedule Closing</AppText><ChevronRight color={colors.primary} /></Pressable>
      <AppCard><AppText weight="bold">Special Instructions</AppText><AppText muted>Please ensure all signatures are in blue ink. Scan and upload the full package once completed.</AppText></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Provided Documents</AppText><FieldRow label="Closing_Instructions.pdf" value="1.2 MB" /><FieldRow label="Signature_Package.pdf" value="5.4 MB" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Upload Scanbacks</AppText><UploadBox title="Tap to browse or drop here" subtitle="PDF, JPG up to 25MB" /><FieldRow label="Scanback_Part1.pdf" value="2.4 MB · Uploaded 2m ago" /><AppButton title="Submit Documents" /></AppCard>
    </ScreenContainer>
  );
}

export function ScheduleClosingScreen() {
  const dates = Array.from({ length: 28 }, (_, index) => index + 1);
  const times = ['09:00 AM', '10:30 AM', '11:15 AM', '12:45 PM', '02:00 PM', '02:15 PM', '03:30 PM', '04:00 PM', '05:15 PM'];
  return (
    <ScreenContainer>
      <AppHeader back title="Schedule Closing" onProfilePress={() => router.push('/notary/settings')} />
      <SectionHeader title="Select Date" action="April 2026" />
      <AppCard style={styles.calendar}>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <AppText key={`${day}${index}`} variant="caption" muted style={styles.dayCell}>{day}</AppText>)}
        {dates.map((date) => <View key={date} style={[styles.dateCell, date === 24 && styles.dateSelected]}><AppText style={date === 24 && styles.dateSelectedText}>{date}</AppText></View>)}
      </AppCard>
      <SectionHeader title="Select Time" />
      <View style={styles.timeGrid}>{times.map((time) => <Badge key={time} label={time} tone={time === '02:00 PM' ? 'blue' : 'gray'} />)}</View>
      <AppCard style={styles.formCard}><AppText variant="caption" muted>PREVIEW SELECTION</AppText><FieldRow label="Closing Engagement" value="Tuesday, Apr 24 · 02:00 PM" /></AppCard>
      <AppButton title="Confirm Schedule" />
    </ScreenContainer>
  );
}

export function ChatScreen() {
  return (
    <ScreenContainer contentStyle={styles.chatScreen}>
      <View style={styles.chatHeader}><View style={styles.avatarDark}><AppText style={{ color: colors.white }}>A</AppText></View><View style={{ flex: 1 }}><AppText weight="bold">Closing Engage Admin</AppText><AppText variant="caption" style={{ color: colors.success }}>Online now</AppText></View><Phone color={colors.primary} size={20} /></View>
      {messages.map((message) => <ChatBubble key={message.id} message={message} />)}
      <AppText variant="caption" muted style={styles.center}>TODAY</AppText>
      <View style={styles.messageInput}><AppText muted style={{ flex: 1 }}>Type a message...</AppText><Send color={colors.white} size={16} /></View>
    </ScreenContainer>
  );
}

export function UploadDocumentsScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Upload Documents" onProfilePress={() => router.push('/notary/settings')} />
      <AppInput label="Selected Order" value="#CE-90210 - Jonathan Harker" editable={false} />
      <AppCard style={styles.formCard}><UploadBox title="Drag & Drop Scanbacks" subtitle="Upload high-resolution PDF scans only" /><AppButton title="Browse Files" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Uploaded Files (1)</AppText><FieldRow label="scanback_signed_final.pdf" value="4.2 MB" /><FieldRow label="Verification Complete" value="100%" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Submission Guide</AppText>{['Legibility (No blur or glare)', 'Order of Pages (Per instructions)', 'Full Stack (Include all 48 pages)'].map((item) => <View key={item} style={styles.checkRow}><CheckCircle2 color={colors.primary} size={18} /><AppText>{item}</AppText></View>)}</AppCard>
      <AppButton title="Upload & Submit" />
    </ScreenContainer>
  );
}

export function NotaryDocumentsScreen() {
  return <UploadDocumentsScreen />;
}

export function CredentialsScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Primary Commission" onProfilePress={() => router.push('/notary/settings')} />
      <AppCard style={styles.formCard}><View style={styles.topRow}><AppText variant="subtitle">California Secretary of State</AppText><Badge label="Verified" tone="green" /></View><FieldRow label="License Number" value="2348910-CA" /><FieldRow label="Expiry Date" value="Oct 24, 2026" /><FieldRow label="E&O Coverage" value="$100,000.00" /><AppButton title="Update information" /></AppCard>
      <AppCard><View style={styles.topRow}><AppText weight="bold">Background Screening</AppText><Badge label="Pending Review" tone="orange" /></View><AppText muted>Verification in progress. Estimated completion by May 12, 2024.</AppText></AppCard>
      <SectionHeader title="Credential History" action="Filter" />
      {credentials.map((credential) => <AppCard key={credential.id} style={styles.formCard}><View style={styles.topRow}><AppText weight="bold">{credential.title}</AppText><Badge label={credential.status} tone={credential.status === 'Archived' ? 'gray' : 'green'} /></View><FieldRow label={credential.issuer} value={credential.date} /></AppCard>)}
      <AppButton title="Upload new credential" variant="secondary" />
    </ScreenContainer>
  );
}

export function NotarySettingsScreen() {
  return <SettingsForm role="notary" />;
}



const styles = StyleSheet.create({
  onboardingScreen: { flex: 1, backgroundColor: colors.background },
  onboardingHeader: {
    height: 62,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8fbff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  skipText: { color: '#697386', fontSize: 16, fontWeight: '700' },
  onboardingBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingTop: 26,
    paddingBottom: 18,
  },
  onboardingBodyCompact: {
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 14,
  },
  onboardingBodySecurity: {
    paddingTop: 18,
  },
  onboardingContent: {
    width: '100%',
    alignItems: 'center',
    flexShrink: 1,
  },
  onboardingContentCompact: {
    paddingTop: 0,
  },
  onboardingContentSecurity: {
    paddingTop: 4,
  },
  onboardingImagePlain: {
    minHeight: 198,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardingImageFrame: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    ...shadows.card,
  },
  onboardingImageOne: { borderRadius: 7 },
  onboardingImageTwo: {},
  onboardingImageThree: {},
  onboardingCopy: { alignItems: 'center', gap: 12 },
  onboardingCopyWelcome: { marginTop: 28 },
  onboardingCopyWorkflow: { marginTop: 30 },
  onboardingCopyCompact: { marginTop: 22 },
  onboardingCopySmall: { gap: 10, marginTop: 20 },
  onboardingTitle: {
    color: '#1b202c',
    fontWeight: '800',
    textAlign: 'center',
    width: '100%',
  },
  onboardingDescription: {
    color: '#4b5565',
    fontWeight: '400',
    textAlign: 'center',
    width: '100%',
    maxWidth: 280,
  },
  onboardingFeatureRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 14,
    marginTop: 24,
  },
  onboardingFeatureRowCompact: {
    marginTop: 18,
  },
  onboardingFeatureCard: {
    flex: 1,
    height: 70,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.card,
  },
  onboardingFeatureText: { color: '#4b5565', fontSize: 12, fontWeight: '700' },
  onboardingFooter: {
    width: '100%',
    gap: 18,
  },
  onboardingFooterCompact: {
    gap: 14,
  },
  onboardingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  onboardingDot: { width: 7, height: 7, borderRadius: radius.full, backgroundColor: '#bfc8d8' },
  onboardingDotActive: { width: 22, backgroundColor: colors.primary },
  onboardingButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...shadows.button,
  },
  onboardingButtonText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  center: { textAlign: 'center' },
  authScreen: { justifyContent: 'center', minHeight: '100%' },
  centerBlock: { alignItems: 'center', gap: spacing.sm },
  loginTitle: { color: colors.text, fontSize: 30, lineHeight: 38, fontWeight: '800' },
  formCard: { gap: spacing.md },
  rightLink: { color: colors.primary, textAlign: 'right' },
  segment: { flexDirection: 'row', padding: spacing.xs, borderRadius: radius.md, backgroundColor: colors.graySoft },
  segmentItem: { flex: 1, alignItems: 'center', padding: spacing.sm, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.primary },
  segmentTextActive: { color: colors.white },
  homeContainer: {
    paddingTop: spacing.xs, // Minimal top gap
    paddingBottom: 40,
  },
  ordersStatsGrid: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  statCardLarge: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'none',
  },
  statIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValueLarge: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 8,
  },
  statRowSmall: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCardSmall: {
    flex: 1,
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statValueSmall: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 4,
  },
  pageHeader: {
    marginTop: spacing.md,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0a49a8', // Figma deep blue
  },
  pageSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  createBtn: {
    marginTop: spacing.lg,
    backgroundColor: '#1d63d2',
    height: 48,
    borderRadius: 8,
  },
  searchContainer: {
    marginTop: spacing.lg,
    position: 'relative',
  },
  searchBox: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    height: 44,
  },
  searchInput: {
    paddingLeft: 38,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 13,
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  pageArrow: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNumbers: {
    flexDirection: 'row',
    gap: 8,
  },
  pageNumber: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageActive: {
    backgroundColor: '#0a49a8',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  pageTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#1e293b',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  fieldRow: {
    gap: 2,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  datePicker: {
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  picker: {
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  subSection: {
    marginTop: spacing.md,
  },
  requirementLabel: {
    marginTop: 12,
    marginBottom: 10,
  },
  radioRow: {
    flexDirection: 'row',
    gap: 20,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
  },
  radioActive: {
    borderColor: '#0a49a8',
    borderWidth: 5,
  },
  priorityContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: 12,
  },
  priorityBtn: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  priorityNormalActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  priorityUrgentActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  priorityBtnText: {
    fontSize: 12,
    color: '#64748b',
  },
  figmaUploadBox: {
    height: 140,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#f8fafc',
  },
  uploadCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadMainText: {
    color: '#0a49a8',
    fontSize: 15,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginTop: spacing.sm,
  },
  fileIcon: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 13,
    color: '#1e293b',
  },
  detailsMainCard: {
    padding: spacing.md,
    gap: spacing.md,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailsOrderNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0a49a8',
  },
  detailField: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  detailValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIcon: {
    width: 20,
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 16,
    color: '#1e293b',
  },
  specialInstructionBox: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  instructionText: {
    fontSize: 13,
    color: '#1e3a8a',
    marginTop: 4,
    lineHeight: 18,
  },
  engagementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    backgroundColor: '#f8fbff',
  },
  engagementIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  engagementSub: {
    fontSize: 12,
    fontWeight: '600',
  },
  engagementTitle: {
    fontSize: 15,
    color: '#1e293b',
  },
  detailsSection: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  detailsSectionTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 12,
  },
  notaryProfileCard: {
    padding: spacing.md,
  },
  notaryInfoLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  notaryAvatarBox: {
    position: 'relative',
  },
  notaryAvatarLg: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  onlineDot: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  notaryNameLg: {
    fontSize: 16,
    color: '#1e293b',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#eab308',
  },
  viewProfileBtn: {
    marginTop: 14,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: {
    fontSize: 13,
    color: '#0a49a8',
  },
  sectionHeaderWithCount: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileCardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#fef2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    padding: spacing.md,
  },
  logCard: {
    padding: spacing.md,
  },
  logItem: {
    flexDirection: 'row',
    gap: 12,
  },
  logIconBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 14,
  },
  // Common Screen Elements
  pageHeader: {
    marginTop: 20,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 20,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },

  // Search & Filters
  searchContainer: {
    marginTop: 16,
    position: 'relative',
  },
  searchBox: {
    marginBottom: 0,
  },
  searchInput: {
    paddingLeft: 42,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    height: 46,
    borderRadius: 12,
    fontSize: 14,
  },
  searchIcon: {
    position: 'absolute',
    left: 14,
    top: 14,
    zIndex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 10,
    alignItems: 'center',
  },

  // Document & Team Lists
  documentList: {
    gap: 16,
    marginTop: 20,
  },
  memberList: {
    gap: 16,
    marginTop: 20,
  },
  listFooter: {
    marginTop: 32,
    alignItems: 'center',
    gap: 12,
    paddingBottom: 40,
  },

  // Card Margins
  formCard: {
    marginTop: 24,
  },
  infoCard: {
    marginTop: 16,
    padding: 16,
    gap: 16,
  },
  loadMoreBtn: {
    backgroundColor: '#f1f5f9',
    width: 140,
    height: 40,
    borderRadius: 8,
  },
  loadMoreText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '700',
  },
  filterBtnActive: {
    backgroundColor: '#0a49a8',
    borderColor: '#0a49a8',
  },
  filterBtnTextActive: {
    color: colors.white,
  },
  clearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  clearBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0a49a8',
  },

  // Document View specific
  previewContainer: {
    height: 320,
    backgroundColor: '#f8fafc',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  previewContent: {
    width: 200,
    height: 260,
    backgroundColor: colors.white,
    borderRadius: 4,
    ...shadows.card,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    position: 'relative',
  },
  mockDocLayer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    bottom: 20,
    gap: 8,
  },
  mockDocTitle: { height: 12, width: '40%', backgroundColor: '#f1f5f9', borderRadius: 2 },
  mockDocLine: { height: 6, width: '90%', backgroundColor: '#f8fafc', borderRadius: 2 },
  mockDocGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  mockDocBox: { flex: 1, height: 40, backgroundColor: '#f8fafc', borderRadius: 2 },
  
  previewControls: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  zoomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.9)', // Dark slate translucent
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  zoomBtn: { color: '#fff', fontSize: 20, fontWeight: '300' },
  zoomText: { color: '#fff', fontSize: 13, fontWeight: '600' },
  zoomDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.2)' },
  
  viewActionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  viewDownloadBtn: { flex: 1, backgroundColor: '#0a49a8' },
  viewPrintBtn: { flex: 1, backgroundColor: colors.white, borderColor: '#e2e8f0' },

  infoCard: {
    marginTop: 16,
    padding: 14,
    gap: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 16,
    color: '#0a49a8',
  },
  fieldGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  fieldFull: { width: '100%', gap: 4 },
  fieldHalf: { width: '45%', gap: 4 },
  fieldValue: { fontSize: 15, color: '#1e293b' },
  
  uploadedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  userAvatarSm: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  userAvatarText: { fontSize: 10, fontWeight: '700', color: '#0a49a8' },
  
  activityTimeline: {
    gap: 0,
    marginTop: 4,
  },
  activityItem: {
    flexDirection: 'row',
    minHeight: 80,
  },
  activityLeft: {
    width: 30,
    alignItems: 'center',
  },
  activityIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  activityLine: {
    position: 'absolute',
    top: 24,
    bottom: 0,
    width: 2,
    backgroundColor: '#f1f5f9',
    zIndex: 1,
  },
  activityRight: {
    flex: 1,
    paddingLeft: 10,
    paddingBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activityTitle: {
    fontSize: 14,
    color: '#1e293b',
  },
  activitySub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 6,
    textTransform: 'uppercase',
  },

  preview: { minHeight: 260, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  zoomBar: { position: 'absolute', bottom: spacing.lg, backgroundColor: colors.text, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  roleCards: { flexDirection: 'row', gap: spacing.md },
  roleCard: { flex: 1, gap: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  navRow: { minHeight: 54, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  calendar: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  dayCell: { width: '12%', textAlign: 'center' },
  dateCell: { width: '12%', aspectRatio: 1, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  dateSelected: { backgroundColor: colors.primary },
  dateSelectedText: { color: colors.white, fontWeight: '700' },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  chatScreen: { minHeight: '100%' },
  chatHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.md },
  avatarDark: { width: 38, height: 38, borderRadius: radius.full, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  messageInput: { marginTop: 'auto', minHeight: 48, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, gap: spacing.md },

  // Team Screen specific
  teamAddBtn: {
    marginTop: 20,
    backgroundColor: '#1d63d2',
    height: 50,
    borderRadius: 12,
  },
  dropdownBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  memberList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },

  // Add Member specific
  formSection: {
    marginTop: 20,
    gap: 12,
  },
  formSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  roleSelectionSection: {
    marginTop: 32,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 12,
  },
  roleSelectCard: {
    flex: 1,
    padding: 14,
    gap: 8,
    position: 'relative',
  },
  roleSelectCardActive: {
    borderColor: '#0a49a8',
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  roleIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  roleIconBoxActive: {
    backgroundColor: '#eff6ff',
  },
  roleCardTitle: {
    fontSize: 16,
    color: '#64748b',
  },
  roleCardTitleActive: {
    color: '#0a49a8',
  },
  roleCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  roleCheckCircle: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  permissionsCard: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#f8fafc',
    gap: 12,
  },
  permissionsTitle: {
    fontSize: 13,
    color: '#0a49a8',
    marginBottom: 4,
  },
  checkBox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  checkBoxActive: {
    backgroundColor: '#0a49a8',
    borderColor: '#0a49a8',
  },
  checkLabel: {
    fontSize: 15,
    color: '#1e293b',
  },
  inviteToggleCard: {
    marginTop: 16,
    padding: 14,
  },
  inviteToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  inviteIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  toggleSwitch: {
    width: 46,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0a49a8',
    padding: 2,
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
    alignSelf: 'flex-end',
  },
  formActions: {
    marginTop: 32,
    gap: 16,
  },
  addMemberBtn: {
    backgroundColor: '#0a49a8',
    height: 54,
    borderRadius: 12,
  },
  cancelLink: {
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelLinkText: {
    color: '#64748b',
    fontSize: 15,
  },
});
