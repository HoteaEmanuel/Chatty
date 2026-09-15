import {
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useKeyboardState } from '../hooks/useKeyboardState';

interface ChatInputProps {
  messageValue: string;
  setMessageValue: (message: string) => void;
  onMessageSent: () => void;
  sending?: boolean;
  floating?: boolean;
}

const ChatInput = ({
  messageValue,
  setMessageValue,
  onMessageSent,
  sending = false,
  floating = false,
}: ChatInputProps) => {
  const { isKeyboardVisible } = useKeyboardState();
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  const canSend = messageValue.trim().length > 0 && !sending;

  const handleSendMessage = () => {
    if (!canSend) return;
    onMessageSent();
  };

  return (
    <View
      style={[
        styles.container,
        floating && styles.floatingContainer,
        { paddingBottom: floating || isKeyboardVisible ? vs(10) : vs(20) },
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder="Message..."
        placeholderTextColor={theme.colors.placeholder}
        value={messageValue}
        onChangeText={setMessageValue}
        multiline
        editable={!sending}
      />

      <TouchableOpacity
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={handleSendMessage}
        disabled={!canSend}
      >
        {sending ? (
          <ActivityIndicator size="small" color={theme.colors.background} />
        ) : (
          <Feather name="send" size={20} color={theme.colors.background} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: theme.colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      padding: vs(5),
    },
    floatingContainer: {
      borderTopWidth: 0,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: s(24),
      paddingHorizontal: s(6),
      shadowColor: '#000',
      shadowOpacity: theme.dark ? 0 : 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: theme.dark ? 0 : 2,
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
      paddingHorizontal: s(15),
      paddingVertical: vs(10),
      marginRight: s(10),
      borderRadius: s(20),
      maxHeight: vs(120),
    },
    sendButton: {
      width: s(35),
      height: s(35),
      borderRadius: s(20),
      backgroundColor: theme.colors.text,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
  });
