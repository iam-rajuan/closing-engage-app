import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors, radius, spacing } from '@/theme';
import { Message } from '@/types/message';

export function ChatBubble({ message }: { message: Message }) {
  const isMe = message.author === 'me';
  return (
    <View style={[styles.wrap, isMe && styles.mineWrap]}>
      <AppText variant="caption" muted>{isMe ? 'Me' : 'Admin'}  {message.time}</AppText>
      <View style={[styles.bubble, isMe && styles.mine]}>
        <AppText style={isMe && styles.mineText}>{message.body}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { maxWidth: '82%', gap: spacing.xs },
  mineWrap: { alignSelf: 'flex-end' },
  bubble: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  mine: { backgroundColor: colors.primary, borderColor: colors.primary },
  mineText: { color: colors.white },
});
