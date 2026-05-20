import { ScrollView, TextInput, View, Pressable, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Paperclip, Phone, Send } from 'lucide-react-native';
import { useState } from 'react';
import { AppText } from '@/components/common/AppText';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { LoadingState } from '@/components/common/LoadingState';
import { ScreenContainer } from '@/components/common/ScreenContainer';
import { NotaryChatBubble } from '@/features/notary/components/NotaryChatBubble';
import { notaryStyles } from '@/features/notary/styles';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getOrderMessages, sendOrderMessage } from '@/services/communications.service';

export function ChatScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? '';
  const [draft, setDraft] = useState('');
  const { data: messages, loading, error, reload, setData } = useAsyncResource(
    () => getOrderMessages(orderId, 'notary'),
    [orderId],
  );

  const submitMessage = async () => {
    if (!draft.trim()) return;
    const message = await sendOrderMessage(orderId, draft.trim(), 'notary');
    setData([...(messages ?? []), message]);
    setDraft('');
  };

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
            <AppText variant="caption" style={{ color: '#22c55e', fontWeight: '600' }}>Live thread</AppText>
          </View>
        </View>
        <Pressable style={notaryStyles.phoneCircle}>
          <Phone color="#64748b" size={20} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}>
        {loading && !messages ? <LoadingState /> : null}
        {error ? <ErrorState message={error} /> : null}
        {messages?.length ? messages.map((msg) => <NotaryChatBubble key={msg.id} msg={msg} />) : !loading ? <EmptyState title="No messages yet" /> : null}
      </ScrollView>

      <View style={notaryStyles.chatInputArea}>
        <View style={notaryStyles.chatInputContainer}>
          <Pressable style={{ padding: 8 }} onPress={() => void reload()}><Paperclip size={20} color="#94a3b8" /></Pressable>
          <TextInput
            placeholder="Type a message..."
            style={notaryStyles.chatTextInput}
            placeholderTextColor="#94a3b8"
            value={draft}
            onChangeText={setDraft}
          />
          <Pressable style={notaryStyles.sendCircle} onPress={() => void submitMessage()}>
            <Send size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
