import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { s } from 'react-native-size-matters';
import ResponseMessageCard from '../components/ResponseMessageCard';
import SentMessageCard from '../components/SentMessageCard';
import { RECEIVED, SENT } from '../constants/chat';
import ChatInput from '../components/ChatInput';
import { IS_IOS } from '../constants/platform';
type MESSAGE = {
  id: number;
  message: string;
  type: 'SENT' | 'RECEIVED';
};
const ChatScreen = () => {
  const messageList: MESSAGE[] = [
    {
      message: 'Hello Claude',
      type: SENT,
      id: 1,
    },
    {
      message: 'Hi, how can i help you today?',
      type: RECEIVED,
      id: 2,
    },
    {
      message: 'Today i want to do whatever you want <3',
      type: SENT,
      id: 3,
    },
    {
      message: 'Soo sweet! Kill yourself',
      type: RECEIVED,
      id: 4,
    },
  ];

  const [messages, setMessages] = useState<MESSAGE[]>(messageList);
  const [messageInput, setMessageInput] = useState('');

  const onMessageSent = () => {
    setMessages(prev => [
      ...prev,
      {
        id: Math.random() * 100000,
        type: 'SENT',
        message: messageInput,
      },
    ]);

    onGetRespose("Fck off boys");
  };

  const onGetRespose = (response: string) => {
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: prev.length + 1,
          type: 'RECEIVED',
          message: response,
        },
      ]);
    }, 2000);
  };
  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={IS_IOS ? 'padding' : undefined}
      >
        <FlatList
          style={styles.messageList}
          data={messages}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) =>
            item.type === SENT ? (
              <SentMessageCard message={item.message} />
            ) : (
              <ResponseMessageCard message={item.message} />
            )
          }
          contentContainerStyle={{
            padding: s(10),
          }}
        />

        <ChatInput
          messageValue={messageInput}
          setMessageValue={setMessageInput}
          onMessageSent={onMessageSent}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  messageList: {
    flex: 1,
  },
});
