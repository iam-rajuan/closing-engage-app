import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { useSegments } from 'expo-router';
import { colors, spacing } from '@/theme';

type Props = PropsWithChildren<{
  scroll?: boolean;
  contentStyle?: ViewStyle;
  refreshing?: boolean;
  onRefresh?: () => void;
  keyboardBehavior?: 'padding' | 'height' | 'position';
  keyboardVerticalOffset?: number;
  excludeBottomSafeArea?: boolean;
}>;

export function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  refreshing = false,
  onRefresh,
  keyboardBehavior,
  keyboardVerticalOffset,
  excludeBottomSafeArea,
}: Props) {
  const content = scroll ? (
    <ScrollView 
      contentContainerStyle={[styles.content, contentStyle]} 
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      refreshControl={
        onRefresh ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    children
  );

  const segments = useSegments();
  const isTabScreen = segments[0] === 'notary' || segments[0] === 'company';
  
  const shouldExcludeBottom = excludeBottomSafeArea !== undefined
    ? excludeBottomSafeArea
    : isTabScreen;

  const edges: Edge[] = shouldExcludeBottom
    ? ['top', 'left', 'right']
    : ['top', 'left', 'right', 'bottom'];

  return (
    <SafeAreaView edges={edges} style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={keyboardBehavior ?? (Platform.OS === 'ios' ? 'padding' : undefined)}
        keyboardVerticalOffset={keyboardVerticalOffset}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});

