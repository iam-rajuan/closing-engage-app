import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, ShieldCheck, Mail } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { colors } from '@/theme';

export function PrivacyPolicyScreen() {
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
          At Closing Engage, we recognize that your personal information is the foundation of our trust. This Privacy Policy describes how we collect, use, and handle your data when you use our digital closing services and secure vaults. We are committed to maintaining the highest standards of data protection and transparency.
        </AppText>
      </AppCard>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>1. Information We Collect</AppText>
        </View>
        
        <AppCard style={styles.dataCard}>
          <AppText weight="bold" style={styles.dataTitle}>Personal Data</AppText>
          <AppText style={styles.dataText}>
            Name, email address, phone number, and professional credentials provided during account creation or transaction initiation.
          </AppText>
        </AppCard>

        <AppCard style={styles.dataCard}>
          <AppText variant="caption" muted weight="bold" style={styles.copyText}>© 2026 CLOSING ENGAGE INC. ALL RIGHTS RESERVED.</AppText>
          <View style={styles.bulletRow}>
            <View style={styles.dot} />
            <AppText style={styles.bulletText}>Time-stamped interaction logs for audit trails in title processing.</AppText>
          </View>
          <View style={styles.bulletRow}>
            <View style={styles.dot} />
            <AppText style={styles.bulletText}>Browser type and operating system metadata.</AppText>
          </View>
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

        <AppCard style={styles.infoRowCard}>
          <View style={styles.iconBox}><ShieldCheck color="#0a49a8" size={20} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={styles.infoRowTitle}>Identity Verification</AppText>
            <AppText variant="caption" muted>Ensuring all parties in a transaction are authorized and authenticated.</AppText>
          </View>
        </AppCard>

        <AppCard style={styles.infoRowCard}>
          <View style={[styles.iconBox, { backgroundColor: '#eff6ff' }]}><Mail color="#0a49a8" size={20} /></View>
          <View style={{ flex: 1 }}>
            <AppText weight="bold" style={styles.infoRowTitle}>Document Generation</AppText>
            <AppText variant="caption" muted>Automating the creation of legal and title-related documents.</AppText>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>3. Sharing of Information</AppText>
        </View>
        
        <AppCard style={styles.sharingCard}>
          <AppText style={styles.sharingIntro}>
            We do not sell your data. We only share information with:
          </AppText>
          
          <View style={styles.shareItem}>
            <AppText weight="bold" style={styles.shareNum}>01</AppText>
            <View style={{ flex: 1 }}>
              <AppText weight="bold">Underwriters & Lenders</AppText>
              <AppText variant="caption" muted>Strictly for the purpose of facilitating the real estate closing process.</AppText>
            </View>
          </View>

          <View style={styles.shareItem}>
            <AppText weight="bold" style={styles.shareNum}>02</AppText>
            <View style={{ flex: 1 }}>
              <AppText weight="bold">Service Providers</AppText>
              <AppText variant="caption" muted>Cloud infrastructure providers and security auditors under strict NDA.</AppText>
            </View>
          </View>
        </AppCard>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <AppCard style={styles.contactCard}>
          <AppText weight="bold" style={styles.contactTitle}>4. Policy Updates</AppText>
          <AppText style={styles.contactText}>
            We may update this policy occasionally. Major changes will be communicated via the app dashboard and through email notifications 30 days prior to implementation.
          </AppText>
          <View style={styles.divider} />
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}><Mail color="#0a49a8" size={16} /></View>
            <View>
              <AppText weight="bold">Contact Us</AppText>
              <AppText variant="caption">Closing Engage Privacy Team</AppText>
              <AppText variant="caption" muted>privacy@closingengage.com</AppText>
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
