import { View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { notaryStyles } from '@/features/notary/styles';

export function NotaryChatBubble({ msg }: { msg: any }) {
  return (
    <View style={[notaryStyles.chatMsgWrapper, msg.isAdmin ? { alignItems: 'flex-start' } : { alignItems: 'flex-end' }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <AppText weight="bold" style={{ fontSize: 11, color: msg.isAdmin ? '#475569' : '#0a49a8' }}>{msg.sender}</AppText>
        <AppText variant="caption" muted style={{ fontSize: 10 }}>{msg.time}</AppText>
      </View>
      <View style={[notaryStyles.chatBubble, msg.isAdmin ? notaryStyles.adminBubble : notaryStyles.userBubble]}>
        <AppText style={[notaryStyles.chatText, !msg.isAdmin && { color: '#fff' }]}>{msg.text}</AppText>
      </View>
    </View>
  );
}
