import { StyleSheet, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ChevronLeft, ExternalLink, Globe } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { AppCard } from '@/components/common/AppCard';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { BrandLogo } from '@/components/common/BrandLogo';
import { colors } from '@/theme';

export function AboutScreen() {
  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft color={colors.primary} size={24} />
        </Pressable>
        <AppText weight="bold" style={styles.headerTitle}>About</AppText>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.hero}>
        <BrandLogo width={180} />
        <AppText style={styles.tagline}>Redefining Real Estate Closings.</AppText>
        <AppText muted style={styles.version}>Version 1.0.4 (Production)</AppText>
      </View>

      <AppCard style={styles.aboutCard}>
        <AppText style={styles.aboutText}>
          {'Closing Engage is the industry\'s most advanced digital closing platform, designed for title agencies who demand security, speed, and precision. Our mission is to eliminate the friction from real estate transactions through intelligent automation and a "security-first" architecture.'}
        </AppText>
      </AppCard>

      <View style={styles.section}>
        <AppText weight="bold" style={styles.sectionTitle}>OUR CORE VALUES</AppText>
        <View style={styles.valuesGrid}>
          <View style={styles.valueItem}>
            <View style={styles.valueIcon}><AppText style={styles.valueIconText}>🔒</AppText></View>
            <AppText weight="bold">Security</AppText>
            <AppText variant="caption" muted style={styles.valueCaption}>Military-grade encryption for all title records.</AppText>
          </View>
          <View style={styles.valueItem}>
            <View style={styles.valueIcon}><AppText style={styles.valueIconText}>⚡</AppText></View>
            <AppText weight="bold">Speed</AppText>
            <AppText variant="caption" muted style={styles.valueCaption}>Real-time collaboration across all parties.</AppText>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <AppText weight="bold" style={styles.sectionTitle}>THE TECHNOLOGY</AppText>
        <AppCard style={styles.techCard}>
          <View style={styles.techRow}>
            <View style={styles.techBadge}><AppText style={styles.techText}>256-bit AES</AppText></View>
            <View style={styles.techBadge}><AppText style={styles.techText}>SOC2 Type II</AppText></View>
            <View style={styles.techBadge}><AppText style={styles.techText}>SSL/TLS</AppText></View>
          </View>
          <AppText variant="caption" muted style={styles.techDesc}>
            Built on a distributed cloud architecture with zero-knowledge encryption protocols to ensure your title documents never touch the public internet unencrypted.
          </AppText>
        </AppCard>
      </View>

      <View style={styles.section}>
        <AppText weight="bold" style={styles.sectionTitle}>CONNECT WITH US</AppText>
        <AppCard style={styles.linksCard}>
          <Pressable style={styles.linkItem}>
            <Globe color="#0a49a8" size={20} />
            <AppText style={styles.linkText}>Official Website</AppText>
            <ExternalLink color="#cbd5e1" size={16} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.linkItem}>
            <FontAwesome name="linkedin-square" color="#0a49a8" size={20} />
            <AppText style={styles.linkText}>LinkedIn Community</AppText>
            <ExternalLink color="#cbd5e1" size={16} />
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.linkItem}>
            <FontAwesome name="twitter" color="#0a49a8" size={20} />
            <AppText style={styles.linkText}>Twitter / X</AppText>
            <ExternalLink color="#cbd5e1" size={16} />
          </Pressable>
        </AppCard>
      </View>

      <View style={styles.footer}>
        <AppText variant="caption" muted>© 2026 Closing Engage Inc.</AppText>
        <AppText variant="caption" muted>Made with ❤️ for Title Professionals</AppText>
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
  hero: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginTop: 16,
  },
  version: {
    fontSize: 12,
    marginTop: 8,
  },
  aboutCard: {
    padding: 20,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#475569',
    textAlign: 'center',
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 11,
    letterSpacing: 1,
    color: '#94a3b8',
    marginBottom: 16,
    textAlign: 'center',
  },
  valuesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  valueItem: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  valueIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueIconText: {
    fontSize: 20,
  },
  valueCaption: {
    textAlign: 'center',
  },
  techCard: {
    padding: 16,
    gap: 12,
  },
  techRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  techBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  techText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1d4ed8',
  },
  techDesc: {
    lineHeight: 16,
  },
  linksCard: {
    padding: 0,
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  linkText: {
    flex: 1,
    fontSize: 15,
    color: '#1e293b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 16,
  },
  footer: {
    marginTop: 48,
    marginBottom: 40,
    alignItems: 'center',
    gap: 4,
  },
});
