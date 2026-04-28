import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, type Href } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { DevSettings, BackHandler, Image, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
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

function LogoMark() {
  return <BrandLogo width={156} />;
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fieldRow}>
      <AppText variant="caption" muted>{label}</AppText>
      <AppText weight="semibold">{value}</AppText>
    </View>
  );
}

function StatGrid({ stats }: { stats: { label: string; value: string }[] }) {
  const getIcon = (label: string) => {
    switch (label.toUpperCase()) {
      case 'TOTAL ORDERS': return <FileText color="#3b82f6" size={18} />;
      case 'ACTIVE ORDERS': return <Briefcase color="#3b82f6" size={18} />;
      case 'PENDING REVIEW': return <Hourglass color="#f59e0b" size={18} />;
      case 'COMPLETED': return <CheckCircle2 color="#10b981" size={18} />;
      default: return <FileText color="#3b82f6" size={18} />;
    }
  };

  return (
    <View style={styles.statGrid}>
      {stats.map((stat) => (
        <AppCard key={stat.label} style={styles.statCard}>
          <View style={styles.statIconContainer}>
            {getIcon(stat.label)}
          </View>
          <AppText variant="caption" muted style={styles.statLabel}>{stat.label.toUpperCase()}</AppText>
          <AppText style={styles.statValue}>{stat.value}</AppText>
        </AppCard>
      ))}
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
        <LogoMark />
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
    if (__DEV__) {
      DevSettings.reload();
    } else {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };

  return (
    <ScreenContainer 
      scroll 
      contentStyle={styles.homeContainer}
      refreshing={refreshing}
      onRefresh={handleRefresh}
    >
      <AppHeader />
      <View style={styles.homeGreeting}>
        <AppText variant="caption" muted style={styles.overviewLabel}>Overview</AppText>
        <AppText variant="subtitle" style={styles.greetingText}>Good morning, Alex.</AppText>
      </View>
      <StatGrid stats={companyStats} />
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
    if (__DEV__) {
      DevSettings.reload();
    } else {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };

  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader title="Orders" subtitle="Manage and track all your closing orders" />
      <AppButton title="Create New Order" icon={<Plus color={colors.white} size={18} />} onPress={() => router.push('/company/orders/create')} />
      <StatGrid stats={[{ label: 'Total Orders', value: '1,248' }, { label: 'Pending Review', value: '56' }, { label: 'Completed Today', value: '850' }]} />
      <AppInput placeholder="Search orders..." />
      <View style={styles.filterRow}><Badge label="Status" tone="gray" /><Badge label="Date Range" tone="gray" /><Badge label="Newest" tone="gray" /></View>
      {companyOrders.map((order) => <OrderCard key={order.id} order={order} href={`/company/orders/${order.id}` as Href} />)}
      <View style={styles.pagination}><Badge label="1" /><Badge label="2" tone="gray" /><Badge label="3" tone="gray" /></View>
    </ScreenContainer>
  );
}

export function CreateOrderScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<OrderForm>({
    resolver: zodResolver(orderSchema),
    defaultValues: { title: '', clientName: '', propertyAddress: '', city: '', state: 'TX', zip: '', signingDate: '', loanType: 'Refinance', requirements: '', preferredNotary: '', instructions: '' },
  });
  const submit = handleSubmit(() => router.replace('/company/orders'));
  const input = (name: keyof OrderForm, label: string, placeholder?: string) => (
    <Controller control={control} name={name} render={({ field }) => <AppInput label={label} value={String(field.value ?? '')} onChangeText={field.onChange} placeholder={placeholder} error={errors[name]?.message} />} />
  );
  return (
    <ScreenContainer>
      <AppHeader back title="Create New Order" />
      <AppCard style={styles.formCard}>
        <AppText weight="bold">Order Information</AppText>
        {input('title', 'Order Title', 'e.g. Smith Refinance')}
        {input('clientName', 'Client Name', 'Full legal name')}
        {input('propertyAddress', 'Property Address', 'Street address')}
        <View style={styles.threeCols}>{input('city', 'City')}{input('state', 'State')}{input('zip', 'Zip')}</View>
        {input('signingDate', 'Signing Date', 'mm/dd/yyyy')}
      </AppCard>
      <AppCard style={styles.formCard}>
        <AppText weight="bold">Loan Details</AppText>
        {input('loanType', 'Loan Type')}
        {input('requirements', 'Requirements')}
        <AppText variant="caption" muted>Scan Backs Required</AppText>
        <View style={styles.filterRow}><Badge label="Yes, required" /><Badge label="No" tone="gray" /></View>
      </AppCard>
      <AppCard style={styles.formCard}>
        <AppText weight="bold">Instructions</AppText>
        {input('preferredNotary', 'Preferred Notary', 'Select Notary (Optional)')}
        {input('instructions', 'Special Instructions', 'Additional notes for the notary...')}
        <AppText variant="caption" muted>Order Priority</AppText>
        <View style={styles.filterRow}><Badge label="Normal" /><Badge label="Urgent" tone="red" /></View>
      </AppCard>
      <AppCard style={styles.formCard}>
        <AppText weight="bold">Supporting Documents</AppText>
        <UploadBox />
        <FieldRow label="Closing_Statement_V1.pdf" value="1.2 MB" />
      </AppCard>
      <View style={styles.actionRow}><AppButton title="Cancel" variant="secondary" onPress={() => router.back()} /><AppButton title="Submit Order" onPress={submit} /></View>
    </ScreenContainer>
  );
}

export function CompanyOrderDetailsScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Order Details" />
      <AppCard style={styles.formCard}>
        <View style={styles.topRow}><AppText variant="subtitle">Order #CE-9421</AppText><Badge label="APPROVED" tone="green" /></View>
        <FieldRow label="Client" value="Mila Waters" />
        <FieldRow label="Signing Date & Time" value="Mar 18, 2026, 2:45 PM" />
        <FieldRow label="Property Address" value="442 Prospect St, Dallas TX 75201" />
      </AppCard>
      <AppCard><AppText weight="bold">Special Instructions</AppText><AppText muted>Client requested a bilingual notary if possible. Please ensure all documents are signed with blue ink as per lender requirements. Park in the visitor section near building B.</AppText></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Assigned Notary</AppText><FieldRow label="Sarah Jenkins" value="4.9 · Available" /><AppButton title="View Full Profile" variant="secondary" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Documents</AppText><FieldRow label="closing_statement.pdf" value="2.4 MB · 1 File" /></AppCard>
      <OrderStatusTimeline steps={orderTimeline} />
      <AppCard style={styles.formCard}><AppText weight="bold">Activity Log</AppText><FieldRow label="Documents Verified" value="1h ago" /><AppText variant="caption" muted>System automatically verified the uploaded PDF for integrity and signature fields.</AppText><FieldRow label="Notary Re-assigned" value="3h ago" /></AppCard>
    </ScreenContainer>
  );
}

export function DocumentsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    if (__DEV__) {
      DevSettings.reload();
    } else {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader title="Documents" subtitle="Access and download your approved files" />
      <AppInput placeholder="Filter by Order" />
      <View style={styles.filterRow}><Badge label="PDF Only" /><Badge label="Filter by Date" tone="gray" /><Badge label="Clear" tone="gray" /></View>
      {documents.map((doc) => <DocumentCard key={doc.id} doc={doc} onView={() => router.push(`/company/documents/${doc.id}`)} />)}
      <AppText style={styles.center} muted>Showing 3 of 12 documents</AppText>
      <AppButton title="Load More" variant="secondary" />
    </ScreenContainer>
  );
}

export function DocumentViewScreen() {
  return (
    <ScreenContainer>
      <AppHeader back title="Document View" />
      <View style={styles.preview}><FileText color={colors.border} size={120} /><View style={styles.zoomBar}><AppText variant="caption" style={{ color: colors.white }}>85%   ·   1/12</AppText></View></View>
      <View style={styles.actionRow}><AppButton title="Download" icon={<Download color={colors.white} size={16} />} /><AppButton title="Print" variant="secondary" icon={<Printer color={colors.primary} size={16} />} /></View>
      <AppCard style={styles.formCard}><View style={styles.topRow}><AppText weight="bold">File Details</AppText><Badge label="Approved" tone="green" /></View><FieldRow label="Name" value="Closing_Disclosure_Final.pdf" /><FieldRow label="Size" value="2.4 MB" /><FieldRow label="Date" value="Apr 15, 2026" /><FieldRow label="Uploaded By" value="Janet Doe (Notary)" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Order Information</AppText><FieldRow label="Client Name" value="Robert & Sarah Montgomery" /><FieldRow label="Property Address" value="8421 Whispering Pines Dr, Austin, TX 78729" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Recent Activity</AppText><FieldRow label="Approved by Admin" value="Today, 2:45 PM" /><FieldRow label="Uploaded by Notary" value="Apr 14, 11:20 AM" /></AppCard>
    </ScreenContainer>
  );
}

export function TeamScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    if (__DEV__) {
      DevSettings.reload();
    } else {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader title="Team Management" subtitle="Manage your company team members and roles" />
      <AppButton title="Add Member" icon={<UserPlus color={colors.white} size={18} />} onPress={() => router.push('/company/team/add')} />
      <AppInput placeholder="Search members..." />
      <View style={styles.filterRow}><Badge label="Role: All" tone="gray" /><Badge label="Status: Active" tone="gray" /></View>
      {teamMembers.map((member) => <TeamMemberCard key={member.id} member={member} />)}
    </ScreenContainer>
  );
}

export function AddMemberScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<MemberForm>({ resolver: zodResolver(memberSchema), defaultValues: { fullName: '', phone: '', email: '' } });
  const submit = handleSubmit(() => router.replace('/company/team'));
  return (
    <ScreenContainer>
      <AppHeader back title="Add New Member" />
      <AppCard style={styles.formCard}>
        <Controller control={control} name="fullName" render={({ field }) => <AppInput label="FULL NAME" placeholder="e.g. Alexander Pierce" value={field.value} onChangeText={field.onChange} error={errors.fullName?.message} />} />
        <Controller control={control} name="phone" render={({ field }) => <AppInput label="PHONE" placeholder="+1 (555) 000-0000" value={field.value} onChangeText={field.onChange} />} />
        <Controller control={control} name="email" render={({ field }) => <AppInput label="EMAIL ADDRESS" placeholder="alexander@company.com" value={field.value} onChangeText={field.onChange} error={errors.email?.message} />} />
        <AppText variant="label" muted>SELECT ROLE</AppText>
        <View style={styles.roleCards}><AppCard style={styles.roleCard}><Badge label="Admin" /><AppText variant="caption" muted>Full system access and member management</AppText></AppCard><AppCard style={styles.roleCard}><Badge label="Member" /><AppText variant="caption" muted>Limited access to projects and files</AppText></AppCard></View>
        <AppText variant="label" muted>MEMBER PERMISSIONS</AppText>
        {['Create Orders', 'View Orders', 'Download Documents'].map((item) => <View key={item} style={styles.checkRow}><CheckCircle2 color={colors.primary} size={18} /><AppText>{item}</AppText></View>)}
        <ToggleRow label="Send invitation email" />
        <AppButton title="Add Member" onPress={submit} />
        <AppButton title="Cancel" variant="ghost" onPress={() => router.back()} />
      </AppCard>
    </ScreenContainer>
  );
}

export function CompanySettingsScreen() {
  return <SettingsForm role="company" />;
}

export function NotaryHomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = () => {
    setRefreshing(true);
    if (__DEV__) {
      DevSettings.reload();
    } else {
      setTimeout(() => setRefreshing(false), 1500);
    }
  };
  return (
    <ScreenContainer refreshing={refreshing} onRefresh={handleRefresh}>
      <AppHeader avatar="SM" />
      <AppText variant="subtitle">Assigned Workload</AppText>
      <AppText muted>Manage your active signing appointments and document verifications from a central atrium.</AppText>
      <AppButton title="Upload Documents" icon={<Upload color={colors.white} size={18} />} onPress={() => router.push('/notary/documents/upload')} />
      <StatGrid stats={[{ label: 'Total Assigned', value: '24' }, { label: 'In Progress', value: '08' }, { label: 'Completed', value: '13' }]} />
      <SectionHeader title="Assigned Orders" action="LIVE UPDATES" />
      {notaryOrders.map((order) => <OrderCard key={order.id} order={order} href={`/notary/assigned/${order.id}` as Href} />)}
    </ScreenContainer>
  );
}

export function NotaryAssignedScreen() {
  return (
    <ScreenContainer>
      <AppHeader title="Assigned" />
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
      <AppHeader back title="Order Details" />
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
      <AppHeader back title="Schedule Closing" />
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
      <AppHeader title="Upload Documents" />
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
      <AppHeader title="Primary Commission" avatar="SM" />
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

function SettingsForm({ role }: { role: 'company' | 'notary' }) {
  const logout = useAuthStore((state) => state.logout);
  const isCompany = role === 'company';
  const signOut = async () => {
    await logout();
    router.replace('/onboarding');
  };

  return (
    <ScreenContainer>
      <AppHeader title={isCompany ? 'Alex Thompson' : 'Sarah Miller'} subtitle={isCompany ? 'Estate Flux Title' : 'sarah.miller@realtygroup.com'} avatar={isCompany ? 'AT' : 'SM'} />
      <AppButton title="Edit Profile" variant="secondary" />
      <AppCard style={styles.formCard}>
        <AppText weight="bold">Personal Information</AppText>
        <AppInput label="Full Name" value={isCompany ? 'Alex Thompson' : 'Sarah Miller'} />
        <AppInput label="Email Address" value={isCompany ? 'alex.t@estateflux.com' : 'sarah.miller@realtygroup.com'} />
        <AppInput label="Phone Number" value={isCompany ? '+1 (555) 902-4412' : '(512) 555-0198'} />
      </AppCard>
      <AppCard style={styles.formCard}>
        <AppText weight="bold">{isCompany ? 'Company Information' : 'Professional Details'}</AppText>
        {isCompany ? (
          <>
            <AppInput label="Company Name" value="Estate Flux Title" />
            <AppInput label="Company Email" value="ops@estateflux.com" />
            <AppInput label="Business Address" value="782 Commerce Blvd, Austin TX" />
          </>
        ) : (
          <>
            <AppInput label="License Number" value="TX-987654321" />
            <AppInput label="Commission Expiry" value="08/24/2026" />
            <AppInput label="Service Area" value="Austin, TX & surrounding Travis County" />
          </>
        )}
      </AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Security Settings</AppText><AppInput label="Current Password" value="********" secureTextEntry /><AppInput label="New Password" placeholder="Enter new password" /><AppInput label="Confirm New Password" placeholder="Confirm new password" /><AppButton title="Update Password" variant="secondary" /></AppCard>
      <AppCard style={styles.formCard}><AppText weight="bold">Notification Preferences</AppText><ToggleRow label="Email Notifications" /><ToggleRow label="Order Updates" /><ToggleRow label="Document Updates" /></AppCard>
      {isCompany ? <View style={styles.actionRow}><AppButton title="Cancel" variant="secondary" /><AppButton title="Save Changes" /></View> : null}
      <AppButton title="Sign Out" variant="danger" onPress={() => void signOut()} />
    </ScreenContainer>
  );
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
  statGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  statCard: { 
    width: '47.5%', 
    padding: spacing.sm,
    gap: 4,
  },
  statIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  homeGreeting: {
    marginTop: spacing.sm,
    gap: 0,
  },
  overviewLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  greetingText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  homeSection: {
    marginTop: spacing.md,
  },
  orderList: {
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  orderDate: {
    fontSize: 11,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  pagination: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm },
  threeCols: { flexDirection: 'row', gap: spacing.sm },
  actionRow: { flexDirection: 'row', gap: spacing.md },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  fieldRow: { gap: spacing.xs },
  card: { padding: spacing.md, gap: spacing.xs },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontWeight: '700' },
  clientName: { fontSize: 16, fontWeight: '700', marginTop: spacing.xs },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
  notaryInfo: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  notaryText: { color: colors.textMuted },
  detailsButton: { marginTop: spacing.sm, paddingVertical: spacing.xs, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.sm },
  buttonText: { color: colors.primary },
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
});
