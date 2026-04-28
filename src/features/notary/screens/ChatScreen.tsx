import { Image, Pressable, ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ChevronLeft, Paperclip, Phone, Send } from 'lucide-react-native';
import { AppText } from '@/components/common/AppText';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { NotaryChatBubble } from '@/features/notary/components/NotaryChatBubble';
import { notaryStyles } from '@/features/notary/styles';

export function ChatScreen() {
  const messages = [
    { id: '1', sender: 'Admin', text: 'Hello Sarah, we just received the title update for #CE-90210. Please review the updated closing instructions before you head out.', time: '09:15 AM', isAdmin: true },
    { id: '2', sender: 'Me', text: "Thanks for the update! I see the changes. I'll make sure to double-check the signature blocks.", time: '09:22 AM', isAdmin: false },
    { id: '3', sender: 'Admin', text: 'Perfect. Let us know once the signing is complete.', time: '09:45 AM', isAdmin: true },
  ];

  return (
    <ScreenContainer scroll={false}>
      <View style={notaryStyles.chatHeader}>
        <Pressable onPress={() => router.back()}><ChevronLeft color="#64748b" size={24} /></Pressable>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 }}>
          <View>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop' }} 
              style={{ width: 44, height: 44, borderRadius: 12 }} 
            />
            <View style={notaryStyles.onlineDot} />
          </View>
          <View>
            <AppText weight="bold" style={{ fontSize: 16, color: '#0f172a' }}>Closing Engage Admin</AppText>
            <AppText variant="caption" style={{ color: '#22c55e', fontWeight: '600' }}>Online now</AppText>
          </View>
        </View>
        <Pressable style={notaryStyles.phoneCircle}>
          <Phone color="#64748b" size={20} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }}>
        <View style={{ paddingTop: 20 }}>
          {messages.map((msg) => (
            <NotaryChatBubble key={msg.id} msg={msg} />
          ))}
          
          <View style={notaryStyles.dateDivider}>
            <View style={notaryStyles.dividerLine} />
            <AppText variant="caption" muted weight="bold" style={{ paddingHorizontal: 12, letterSpacing: 1 }}>TODAY</AppText>
            <View style={notaryStyles.dividerLine} />
          </View>
        </View>
      </ScrollView>

      <View style={notaryStyles.chatInputArea}>
        <View style={notaryStyles.chatInputContainer}>
          <Pressable style={{ padding: 8 }}><Paperclip size={20} color="#94a3b8" /></Pressable>
          <TextInput 
            placeholder="Type a message..." 
            style={notaryStyles.chatTextInput}
            placeholderTextColor="#94a3b8"
          />
          <Pressable style={notaryStyles.sendCircle}>
            <Send size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
