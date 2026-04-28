import { Pressable, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ArrowRight, Building, Calendar, CheckCircle2, ChevronLeft, Download, FileText, Info, MapPin, MessageCircle, Send, UserRound, X } from 'lucide-react-native';
import { AppButton } from '@/components/common/AppButton';
import { AppCard } from '@/components/common/AppCard';
import { AppText } from '@/components/common/AppText';
import { Badge } from '@/components/common/Badge';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { UploadBox } from '@/components/documents/UploadBox';
import { notaryStyles } from '@/features/notary/styles';

export function NotaryOrderDetailsScreen() {
  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      >
        <View style={notaryStyles.detailsHeader}>
          <Pressable onPress={() => router.back()}><ChevronLeft color="#0a49a8" size={24} /></Pressable>
          <AppText weight="bold" style={{ fontSize: 15, color: '#0f172a' }}>Order Details</AppText>
          <Badge label="ASSIGNED" tone="blue" style={{ paddingHorizontal: 12 }} />
        </View>

        <View style={{ marginTop: 16 }}>
          <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>WORKFLOW PROGRESS</AppText>
          <AppCard style={{ padding: 16 }}>
            {[
              { label: 'Docs Ready to Print', sub: 'Completed Oct 23, 11:30 AM', status: 'done' },
              { label: 'Docs Printed by Notary', sub: 'Waiting for confirmation', status: 'active' },
              { label: 'Scanbacks Uploaded', sub: 'Final step', status: 'pending' },
            ].map((item, i) => (
              <View key={i} style={notaryStyles.timelineItem}>
                <View style={notaryStyles.timelineLeft}>
                  <View style={[notaryStyles.timelineDot, item.status === 'done' && { backgroundColor: '#1d4ed8' }, item.status === 'active' && { borderColor: '#1d4ed8', borderWidth: 2, backgroundColor: '#fff' }]}>
                    {item.status === 'done' && <CheckCircle2 color="#fff" size={14} />}
                    {item.status === 'active' && <View style={notaryStyles.timelineActiveInner} />}
                  </View>
                  {i < 2 && <View style={notaryStyles.timelineLine} />}
                </View>
                <View style={{ flex: 1, paddingBottom: 24 }}>
                  <AppText weight="bold" style={{ fontSize: 14, color: item.status === 'pending' ? '#94a3b8' : '#0f172a' }}>{item.label}</AppText>
                  <AppText variant="caption" muted style={{ fontSize: 12, marginTop: 2 }}>{item.sub}</AppText>
                </View>
              </View>
            ))}
          </AppCard>
        </View>

        <View style={{ marginTop: 16, gap: 10 }}>
          <AppCard style={notaryStyles.infoStrip}>
            <View style={[notaryStyles.iconCircle, { backgroundColor: '#eff6ff' }]}>
              <UserRound size={18} color="#2563eb" />
            </View>
            <View>
              <AppText variant="caption" muted weight="bold">CLIENT</AppText>
              <AppText weight="bold" style={{ fontSize: 14, color: '#0f172a' }}>Jonathan Aris</AppText>
            </View>
          </AppCard>
          <AppCard style={notaryStyles.infoStrip}>
            <View style={[notaryStyles.iconCircle, { backgroundColor: '#eff6ff' }]}>
              <Calendar size={18} color="#2563eb" />
            </View>
            <View>
              <AppText variant="caption" muted weight="bold">SIGNING SCHEDULE</AppText>
              <AppText weight="bold" style={{ fontSize: 14, color: '#0f172a' }}>Oct 24, 2023 at 2:00 PM</AppText>
            </View>
          </AppCard>
        </View>

        <View style={{ marginTop: 16 }}>
          <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>PROPERTY ADDRESSES</AppText>
          <AppCard style={{ padding: 14, gap: 12 }}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <MapPin size={18} color="#2563eb" />
              <AppText weight="bold" style={{ color: '#334155', fontSize: 14 }}>123 Oak St, Austin, TX 78701</AppText>
            </View>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Building size={18} color="#2563eb" />
              <AppText weight="bold" style={{ color: '#334155', fontSize: 14 }}>San Francisco, CA</AppText>
            </View>
          </AppCard>
        </View>

        <Pressable 
          style={notaryStyles.scheduleLink} 
          onPress={() => router.push('/notary/assigned/schedule')}
        >
          <AppText weight="bold" style={{ fontSize: 18, color: '#1e293b' }}>Schedule Closing</AppText>
          <ArrowRight size={20} color="#64748b" />
        </Pressable>

        <AppCard style={{ backgroundColor: '#f8fafc', padding: 16, marginTop: 12 }}>
          <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>SPECIAL INSTRUCTIONS</AppText>
          <AppText style={{ fontSize: 14, color: '#475569', lineHeight: 22 }}>
            Please ensure all signatures are in blue ink. Scan and upload the full package once completed.
          </AppText>
        </AppCard>

        <View style={{ marginTop: 16 }}>
          <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>PROVIDED DOCUMENTS</AppText>
          <AppCard style={{ padding: 0 }}>
            {[
              { name: 'Closing_Instructions.pdf', size: '1.2 MB' },
              { name: 'Signature_Package.pdf', size: '5.4 MB' },
            ].map((doc, i) => (
              <View key={i} style={[notaryStyles.docItem, i > 0 && { borderTopWidth: 1, borderTopColor: '#f1f5f9' }]}>
                <View style={[notaryStyles.iconCircle, { backgroundColor: '#fee2e2' }]}>
                  <FileText size={18} color="#ef4444" />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText weight="bold" style={{ fontSize: 14, color: '#1e293b' }}>{doc.name}</AppText>
                  <AppText variant="caption" muted>{doc.size}</AppText>
                </View>
                <View style={{ flexDirection: 'row', gap: 16 }}>
                  <Pressable><Info size={20} color="#94a3b8" /></Pressable>
                  <Pressable><Download size={20} color="#94a3b8" /></Pressable>
                </View>
              </View>
            ))}
          </AppCard>
        </View>

        <View style={{ marginTop: 16 }}>
          <AppText variant="caption" muted weight="bold" style={{ letterSpacing: 1, marginBottom: 12 }}>UPLOAD SCANBACKS</AppText>
          <UploadBox title="Tap to browse or drop here" subtitle="PDF, JPG up to 25MB" />
          <AppCard style={{ marginTop: 12, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: '#eff6ff', borderWidth: 1 }}>
            <FileText size={20} color="#ef4444" />
            <View style={{ flex: 1 }}>
              <AppText weight="bold" style={{ fontSize: 13, color: '#2563eb' }}>Scanback_Part1.pdf</AppText>
              <AppText variant="caption" muted>2.4 MB • Uploaded 2m ago</AppText>
            </View>
            <Pressable><X size={18} color="#ef4444" /></Pressable>
          </AppCard>
        </View>

        <AppButton 
          title="Submit Documents" 
          icon={<Send color="#fff" size={16} />}
          style={{ marginTop: 24, backgroundColor: '#0a49a8', height: 46 }}
        />
      </ScrollView>

      <Pressable 
        style={notaryStyles.floatingChat} 
        onPress={() => router.push('/notary/assigned/chat')}
      >
        <MessageCircle color="#fff" size={24} />
        <View style={notaryStyles.onlineDotSmall} />
      </Pressable>
    </ScreenContainer>
  );
}
