import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { s } from 'react-native-size-matters';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import ChatSkeleton from '../components/ChatSkeleton';
import ResponseMessageCard from '../components/ResponseMessageCard';
import SentMessageCard from '../components/SentMessageCard';
import TypingIndicator from '../components/TypingIndicator';
import { SENT } from '../constants/chat';
import ChatInput from '../components/ChatInput';
import { IS_IOS } from '../constants/platform';
import EmptyChat from './EmptyChat';
import { useChatSession } from '../navigation/ChatSessionContext';
import { useConversationMessages } from '../hooks/useConversationMessages';
import { useSendMessage, deriveConversationTitle } from '../hooks/useSendMessage';

type MESSAGE = {
  id: string;
  message: string;
  type: 'SENT' | 'RECEIVED';
};

const ChatScreen = () => {
  const { activeConversation, selectConversation } = useChatSession();
  const { messages: history, loading: loadingHistory } =
    useConversationMessages(activeConversation?.id ?? null);
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const styles = useThemedStyles(makeStyles);

  const [messages, setMessages] = useState<MESSAGE[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    setMessages(history);
  }, [history, activeConversation?.id]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const onMessageSent = async () => {
    const content = messageInput.trim();
    if (!content || sendMessage.isPending) return;

    setMessageInput('');
    const sentEntry: MESSAGE = {
      id: `local-${Date.now()}-sent`,
      type: 'SENT',
      message: content,
    };
    const chatHistory = messages.map(m => ({
      role: m.type === SENT ? ('user' as const) : ('assistant' as const),
      content: m.message,
    }));
    setMessages(prev => [...prev, sentEntry]);

    try {
      const { conversationId, reply } = await sendMessage.mutateAsync({
        conversationId: activeConversation?.id ?? null,
        content,
        history: chatHistory,
      });

      const nextMessages = [
        ...messages,
        sentEntry,
        {
          id: `local-${Date.now()}-reply`,
          type: 'RECEIVED' as const,
          message: reply,
        },
      ];
      setMessages(nextMessages);

      if (!activeConversation) {
        // Seed the cache so switching activeConversation doesn't briefly
        // flash empty while the invalidated query re-fetches in the
        // background.
        queryClient.setQueryData(['messages', conversationId], nextMessages);
        selectConversation({
          id: conversationId,
          title: deriveConversationTitle(content),
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `local-${Date.now()}-error`,
          type: 'RECEIVED',
          message: "Something went wrong sending that. Please try again.",
        },
      ]);
    }
  };

  const isEmpty = messages.length === 0 && !loadingHistory;

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={IS_IOS ? 'padding' : undefined}
      >
        {loadingHistory ? (
          <ChatSkeleton />
        ) : isEmpty ? (
          <View style={styles.emptyStateContainer}>
            <EmptyChat />
            <View style={styles.emptyStateInput}>
              <ChatInput
                messageValue={messageInput}
                setMessageValue={setMessageInput}
                onMessageSent={onMessageSent}
                sending={sendMessage.isPending}
                floating
              />
            </View>
          </View>
        ) : (
          <>
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
            />
            {sendMessage.isPending && (
              <View style={styles.typingRow}>
                <TypingIndicator />
              </View>
            )}
            <ChatInput
              messageValue={messageInput}
              setMessageValue={setMessageInput}
              onMessageSent={onMessageSent}
              sending={sendMessage.isPending}
            />
          </>
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChatScreen;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    messageList: {
      flex: 1,
    },
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: s(16),
      gap: s(24),
    },
    emptyStateInput: {
      width: '100%',
    },
    typingRow: {
      paddingHorizontal: s(4),
    },
  });
