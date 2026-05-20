import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { notaryStyles } from '@/features/notary/styles';
import { Message } from '@/types/message';

export function NotaryChatBubble({ msg }: { msg: Message }) {
  const isAdmin = msg.author === 'admin';
  return (
    <View style={[notaryStyles.chatMsgWrapper, isAdmin ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <AppText weight="bold" style={{ fontSize: 11, color: isAdmin ? '#475569' : '#0a49a8' }}>
          {msg.senderName || (isAdmin ? 'Admin' : 'You')}
        </AppText>
        <AppText variant="caption" muted style={{ fontSize: 10 }}>{msg.time}</AppText>
      </View>
      <View style={[notaryStyles.chatBubble, isAdmin ? notaryStyles.adminBubble : notaryStyles.userBubble]}>
        <AppText style={[notaryStyles.chatText, !isAdmin && { color: '#fff' }]}>{msg.body}</AppText>
      </View>
    </View>
  );
}
