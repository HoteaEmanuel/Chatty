import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '../styles/colors';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useKeyboardState } from '../hooks/useKeyboardState';
interface ChatInputProps {
  messageValue: string;
  setMessageValue: (message: string) => void;
  onMessageSent: () => void;
}
const ChatInput = ({
  messageValue,
  setMessageValue,
  onMessageSent,
}: ChatInputProps) => {
  const { isKeyboardVisible } = useKeyboardState();
  const handleSendMessage = () => {
    if (!messageValue.trim().length) return;

    onMessageSent();
    setMessageValue('');
  };
  return (
    <View
      style={[
        styles.container,
        { paddingBottom: isKeyboardVisible ? vs(10) : vs(20) },
      ]}
    >
      <TextInput
        style={styles.input}
        placeholder="Sent a message..."
        placeholderTextColor={colors.black}
        value={messageValue}
        onChangeText={setMessageValue}
      />

      <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
        <Feather name="send" size={20} color={colors.white} />
      </TouchableOpacity>
    </View>
  );
};

export default ChatInput;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    padding:vs(5)
  },
  input: {
    flex: 1,
    backgroundColor: colors.gray,
    paddingHorizontal: s(15),
    paddingVertical: vs(10),
    marginRight: s(10),
    borderRadius: s(20),
  },
  sendButton: {
    width: s(35),
    height: s(35),
    borderRadius: s(20),
    backgroundColor: colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
