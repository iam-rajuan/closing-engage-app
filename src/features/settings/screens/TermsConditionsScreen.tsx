import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Lock, Shield, Layout, Mail, MapPin } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { colors } from '@/theme';

export function TermsConditionsScreen() {
  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.primary} size={24} />
        </Pressable>
        <AppText weight="bold" style={styles.headerTitle}>Terms & Conditions</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.intro}>
        <AppText muted style={styles.effectiveDate}>Effective Date: October 24, 2023</AppText>
        <AppText style={styles.introText}>
          Please read these terms carefully before using Closing Engage. By accessing or using our platform, you acknowledge that you have read, understood, and agreed to be bound by these legal provisions.
        </AppText>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>1. Acceptance of Terms</AppText>
        </View>
        <AppCard style={styles.contentCard}>
          <AppText style={styles.contentText}>
            By accessing Closing Engage, you signify your irrevocable acceptance of these Terms and Conditions. If you are using the platform on behalf of a title agency or legal entity, you represent that you have the authority to bind such entity to these terms.
          </AppText>
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>2. Description of Services</AppText>
        </View>
        <AppText style={styles.sectionDesc}>
          {'Closing Engage provides a secure, cloud-based environment ("The Ethereal Vault") for managing real estate title transactions, document collaboration, and automated escrow reporting.'}
        </AppText>

        <View style={styles.serviceRow}>
          <AppCard style={styles.serviceCard}>
            <AppText weight="bold" style={styles.serviceTitle}>Secure Storage</AppText>
            <AppText variant="caption" muted>Encrypted document management for sensitive title records.</AppText>
          </AppCard>
          <AppCard style={styles.serviceCard}>
            <AppText weight="bold" style={styles.serviceTitle}>Transaction Tracking</AppText>
            <AppText variant="caption" muted>Real-time status updates for all parties in the closing process.</AppText>
          </AppCard>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>3. User Responsibilities</AppText>
        </View>
        
        <AppCard style={styles.responsibilitiesCard}>
          <View style={styles.respItem}>
            <Lock color="#0a49a8" size={18} />
            <AppText style={styles.respText}>
              You are responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account.
            </AppText>
          </View>
          <View style={styles.respItem}>
            <Shield color="#0a49a8" size={18} />
            <AppText style={styles.respText}>
              Unauthorized access or attempts to breach our security protocols will result in immediate permanent suspension.
            </AppText>
          </View>
          <View style={styles.respItem}>
            <Layout color="#0a49a8" size={18} />
            <AppText style={styles.respText}>
              Users must comply with all state and federal regulations regarding real estate transactions and privacy data.
            </AppText>
          </View>
        </AppCard>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>4. Account Termination</AppText>
        </View>
        <View style={styles.terminationNotice}>
          <AppText style={styles.terminationText}>
            We reserve the right to terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </AppText>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>5. Changes to Terms</AppText>
        </View>
        <AppCard style={styles.contentCard}>
          <AppText style={styles.contentText}>
            We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or through the platform interface 30 days prior to new terms taking effect.
          </AppText>
        </AppCard>
      </View>

      <View style={[styles.section, { marginBottom: 40 }]}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.accentBar} />
          <AppText weight="bold" style={styles.sectionTitle}>6. Contact Information</AppText>
        </View>
        <AppCard style={styles.contactInfoCard}>
          <View style={styles.contactInfoRow}>
            <Mail color="#0a49a8" size={18} />
            <AppText weight="bold" style={styles.contactInfoText}>legal@closingengage.com</AppText>
          </View>
          <View style={styles.contactInfoRow}>
            <MapPin color="#0a49a8" size={18} />
            <View>
              <AppText weight="bold" style={styles.contactInfoText}>1200 Digital Vault Way, Suite 400</AppText>
              <AppText variant="caption" muted>San Francisco, CA 94105</AppText>
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
    fontSize: 17,
    fontWeight: '700',
    color: '#0f172a',
  },
  intro: {
    marginTop: 16,
    marginBottom: 24,
  },
  effectiveDate: {
    fontSize: 13,
    marginBottom: 12,
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
  contentCard: {
    padding: 18,
  },
  contentText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 22,
  },
  sectionDesc: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 16,
  },
  serviceRow: {
    flexDirection: 'row',
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    padding: 14,
    backgroundColor: '#f8fafc',
    gap: 6,
  },
  serviceTitle: {
    fontSize: 14,
    color: '#0a49a8',
  },
  responsibilitiesCard: {
    padding: 18,
    gap: 20,
  },
  respItem: {
    flexDirection: 'row',
    gap: 14,
  },
  respText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  terminationNotice: {
    padding: 18,
    backgroundColor: '#fff1f2', // Light red
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ffe4e6',
  },
  terminationText: {
    fontSize: 14,
    color: '#9f1239', // Dark red
    lineHeight: 20,
  },
  contactInfoCard: {
    padding: 18,
    gap: 16,
    backgroundColor: '#f8fafc',
  },
  contactInfoRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  contactInfoText: {
    fontSize: 14,
    color: '#334155',
  },
});
