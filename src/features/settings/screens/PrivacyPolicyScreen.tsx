import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ShieldCheck, Mail } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { colors } from '@/theme';

export function PrivacyPolicyScreen() {
  const collectionItems = [
    'Name, email address, phone number, company details, and professional credentials.',
    'Order records, uploaded documents, transaction notes, and in-app communications.',
    'Technical metadata such as app version, device type, operating system, IP address, and security logs.',
  ];

  const useItems = [
    {
      title: 'Identity Verification',
      body: 'Authenticating users, securing accounts, and protecting access to transaction workspaces.',
    },
    {
      title: 'Service Delivery',
      body: 'Managing closing orders, document workflows, notifications, and support responses across iOS and Android.',
    },
  ];

  const sharingItems = [
    {
      title: 'Service Providers',
      body: 'Hosting, storage, messaging, authentication, and analytics vendors that support platform operations.',
    },
    {
      title: 'Legal Compliance',
      body: 'Courts, regulators, law enforcement, or counterparties when disclosure is legally required or necessary to protect rights and security.',
    },
  ];

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.primary} size={24} />
        </Pressable>
        <AppText weight="bold" style={styles.headerTitle}>Privacy Policy</AppText>
        <ShieldCheck color="#94a3b8" size={20} />
      </View>

      <View style={styles.hero}>
        <AppText style={styles.heroTitle}>Privacy Matters.</AppText>
      </View>

      <AppCard style={styles.introCard}>
        <AppText style={styles.introText}>
          Effective July 20, 2026. This policy applies to the Closing Engage mobile apps for iOS and Android, including the production app identifier com.closingengage.app, and explains how we collect, use, disclose, and protect personal information.
        </AppText>
      </AppCard>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>1. Information We Collect</AppText>
        </View>
        
        <AppCard style={styles.dataCard}>
          <AppText variant="caption" muted weight="bold" style={styles.copyText}>© 2026 CLOSING ENGAGE INC. ALL RIGHTS RESERVED.</AppText>
          {collectionItems.map((item) => (
            <View key={item} style={styles.bulletRow}>
              <View style={styles.dot} />
              <AppText style={styles.bulletText}>{item}</AppText>
            </View>
          ))}
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>2. How We Use Information</AppText>
        </View>
        <AppText style={styles.sectionDesc}>
          We process your information to fulfill our service obligations and ensure a seamless closing experience:
        </AppText>

        {useItems.map((item, index) => (
          <AppCard key={item.title} style={styles.infoRowCard}>
            <View style={[styles.iconBox, index === 1 ? { backgroundColor: '#eff6ff' } : null]}>
              {index === 0 ? <ShieldCheck color="#0a49a8" size={20} /> : <Mail color="#0a49a8" size={20} />}
            </View>
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={styles.infoRowTitle}>{item.title}</AppText>
              <AppText variant="caption" muted>{item.body}</AppText>
            </View>
          </AppCard>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>3. Sharing of Information</AppText>
        </View>
        
        <AppCard style={styles.sharingCard}>
          <AppText style={styles.sharingIntro}>
            We do not sell personal information. We only share information when needed to run the service or comply with legal obligations:
          </AppText>

          {sharingItems.map((item, index) => (
            <View key={item.title} style={styles.shareItem}>
              <AppText weight="bold" style={styles.shareNum}>{String(index + 1).padStart(2, '0')}</AppText>
              <View style={{ flex: 1 }}>
                <AppText weight="bold">{item.title}</AppText>
                <AppText variant="caption" muted>{item.body}</AppText>
              </View>
            </View>
          ))}
        </AppCard>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <AppCard style={styles.contactCard}>
          <AppText weight="bold" style={styles.contactTitle}>4. Retention, Updates, and Contact</AppText>
          <AppText style={styles.contactText}>
            We retain information for as long as needed to provide services, maintain security and audit records, and meet legal obligations. Closing Engage is not directed to children under 13. When this policy changes materially, we will post the revised effective date in the app and on the website privacy page.
          </AppText>
          <View style={styles.divider} />
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}><Mail color="#0a49a8" size={16} /></View>
            <View>
              <AppText weight="bold">Contact Us</AppText>
              <AppText variant="caption">Closing Engage Privacy & Support</AppText>
              <AppText variant="caption" muted>admin@closingengage.com</AppText>
            </View>
          </View>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  hero: {
    marginTop: 24,
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
  },
  introCard: {
    padding: 16,
    backgroundColor: colors.white,
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
  },
  section: {
    marginTop: 32,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  accentBar: {
    width: 4,
    height: 20,
    backgroundColor: '#3b82f6',
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  dataCard: {
    padding: 16,
    marginBottom: 12,
  },
  dataTitle: {
    fontSize: 15,
    color: '#0a49a8',
    marginBottom: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  copyText: {
    fontSize: 9,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  infoRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 16,
    marginBottom: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRowTitle: {
    fontSize: 14,
    color: '#1e293b',
  },
  sharingCard: {
    padding: 16,
  },
  sharingIntro: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 20,
  },
  shareItem: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  shareNum: {
    fontSize: 16,
    color: '#0a49a8',
  },
  contactCard: {
    padding: 20,
  },
  contactTitle: {
    fontSize: 16,
    color: '#0f172a',
    marginBottom: 12,
  },
  contactText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 16,
  },
  contactRow: {
    flexDirection: 'row',
    gap: 14,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
