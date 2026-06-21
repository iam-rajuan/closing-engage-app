import { ScrollView, TextInput, View, Pressable, Image, RefreshControl } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Paperclip, Send } from 'lucide-react-native';
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
import { colors } from '@/theme';

const initialsFrom = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase() || value.trim().slice(0, 2).toUpperCase();

export function ChatScreen() {
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = params.orderId ?? '';
  const [draft, setDraft] = useState('');
  const { data, loading, error, reload, setData } = useAsyncResource(
    () => getOrderMessages(orderId, 'notary'),
    [orderId],
    { cacheKey: `order-chat:notary:${orderId}` },
  );
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };
  const messages = data?.messages;
  const adminName = data?.thread.adminName || 'Closing Engage Admin';
  const adminAvatarUrl = data?.thread.adminAvatarUrl;
  const adminInitials = initialsFrom(adminName);

  const submitMessage = async () => {
    if (!draft.trim()) return;
    const message = await sendOrderMessage(orderId, draft.trim(), 'notary');
    setData((current) =>
      current
        ? {
            ...current,
            messages: [...current.messages, message],
          }
        : current,
    );
    setDraft('');
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={notaryStyles.chatHeader}>
        <Pressable onPress={() => router.back()}><ChevronLeft color="#64748b" size={24} /></Pressable>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginLeft: 8 }}>
          <View>
            {adminAvatarUrl ? (
              <Image
                source={{ uri: adminAvatarUrl }}
                style={{ width: 44, height: 44, borderRadius: 12 }}
              />
            ) : (
              <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: '#0a49a8', alignItems: 'center', justifyContent: 'center' }}>
                <AppText weight="bold" style={{ color: '#fff', fontSize: 14 }}>
                  {adminInitials}
                </AppText>
              </View>
            )}
            <View style={notaryStyles.onlineDot} />
          </View>
          <View>
            <AppText weight="bold" style={{ fontSize: 16, color: '#0f172a' }}>{adminName}</AppText>
            <AppText variant="caption" style={{ color: '#22c55e', fontWeight: '600' }}>Live thread</AppText>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1, paddingHorizontal: 20 }}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void handleRefresh()}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
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
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={() => void submitMessage()}
          />
          <Pressable style={notaryStyles.sendCircle} onPress={() => void submitMessage()}>
            <Send size={18} color="#fff" />
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}
