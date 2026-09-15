import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { s } from 'react-native-size-matters';
import ResponseMessageCard from '../components/ResponseMessageCard';
import SentMessageCard from '../components/SentMessageCard';
import { SENT } from '../constants/chat';
import ChatInput from '../components/ChatInput';
import { IS_IOS } from '../constants/platform';
import EmptyChat from './EmptyChat';
import { useKeyboardState } from '../hooks/useKeyboardState';
import { getOpenAIResponse } from '../api/http-request';
import { useChatSession } from '../navigation/ChatSessionContext';
import { useConversationMessages } from '../hooks/useConversationMessages';

type MESSAGE = {
  id: string;
  message: string;
  type: 'SENT' | 'RECEIVED';
};

const ChatScreen = () => {
  const { activeConversation } = useChatSession();
  const { messages: history, loading: loadingHistory } =
    useConversationMessages(activeConversation?.id ?? null);

  const [messages, setMessages] = useState<MESSAGE[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const { isKeyboardVisible } = useKeyboardState();

  useEffect(() => {
    setMessages(history);
  }, [history, activeConversation?.id]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  const onMessageSent = async () => {
    setMessages(prev => [
      ...prev,
      {
        id: `local-${Date.now()}-${Math.random()}`,
        type: 'SENT',
        message: messageInput,
      },
    ]);
    setIsLoading(true);
    const responseMsg = await getResFromAi(messageInput);
    setIsLoading(false);
    onGetRespose(responseMsg);

    setMessageInput('');
  };

  const getResFromAi = async (msg: string) => {
    const response = await getOpenAIResponse(msg);
    return response;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isKeyboardVisible]);

  const onGetRespose = (response: string) => {
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `local-${Date.now()}-${Math.random()}`,
          type: 'RECEIVED',
          message: response,
        },
      ]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={IS_IOS ? 'padding' : undefined}
      >
        {loadingHistory ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            style={styles.messageList}
            data={messages}
            keyExtractor={item => item.id}
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
            onLayout={scrollToBottom}
            onContentSizeChange={scrollToBottom}
            ListEmptyComponent={EmptyChat}
          />
        )}

        {isLoading && (
          <View style={{ padding: s(10) }}>
            <ResponseMessageCard message="Thinking... Thinking" />
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
