import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { colors } from '../styles/colors';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
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
  const handleSendMessage = () => {
    if (!messageValue.trim().length) return;

    onMessageSent();
    setMessageValue('');
  };
  return (
    <View style={styles.container}>
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
    padding: s(10),
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.mediumGray,
    paddingBottom: vs(20),
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
