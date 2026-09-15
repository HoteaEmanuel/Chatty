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
import { useAuth } from '../auth/AuthProvider';
import { useChatSession } from '../navigation/ChatSessionContext';
import { useConversationMessages } from '../hooks/useConversationMessages';
import {
  useSendMessage,
  deriveConversationTitle,
  resolveMessageContent,
} from '../hooks/useSendMessage';
import { useAttachmentUpload } from '../hooks/useAttachmentUpload';
import { createConversation } from '../lib/conversations';
import type { StoredAttachment } from '../types/attachments';

type MESSAGE = {
  id: string;
  message: string;
  type: 'SENT' | 'RECEIVED';
  attachment: StoredAttachment | null;
};

const ChatScreen = () => {
  const { session } = useAuth();
  const { activeConversation, selectConversation, sessionKey } = useChatSession();
  const { messages: history, loading: loadingHistory } =
    useConversationMessages(activeConversation?.id ?? null);
  const sendMessage = useSendMessage();
  const queryClient = useQueryClient();
  const styles = useThemedStyles(makeStyles);

  const [messages, setMessages] = useState<MESSAGE[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [pendingConversationId, setPendingConversationId] = useState<string | null>(
    null,
  );
  const flatListRef = useRef<FlatList>(null);

  const conversationId = activeConversation?.id ?? pendingConversationId;

  const ensureConversationId = useCallback(async () => {
    if (conversationId) return conversationId;
    const id = await createConversation(session!.user.id);
    setPendingConversationId(id);
    return id;
  }, [conversationId, session]);

  const attachmentUpload = useAttachmentUpload({ ensureConversationId });

  useEffect(() => {
    setMessages(history);
  }, [history, activeConversation?.id]);

  const removeAttachment = attachmentUpload.remove;
  useEffect(() => {
    setPendingConversationId(null);
    removeAttachment();
  }, [sessionKey, removeAttachment]);

  const scrollToBottom = useCallback(() => {
    if (flatListRef.current && messages.length) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const onMessageSent = async () => {
    const trimmedInput = messageInput.trim();
    const attachmentState = attachmentUpload.state;
    const hasReadyAttachment = attachmentState.status === 'ready';
    if ((!trimmedInput && !hasReadyAttachment) || sendMessage.isPending) return;

    const content = resolveMessageContent(trimmedInput, hasReadyAttachment);
    const attachment =
      attachmentState.status === 'ready' ? attachmentState.attachment : null;

    setMessageInput('');
    // Cleared optimistically, in step with `messageInput` above, rather than
    // waiting for the mutation to resolve - otherwise the thumbnail would
    // sit in the input for the whole round trip while `content` is already
    // showing as a sent bubble.
    attachmentUpload.clearAfterSend();
    const sentEntry: MESSAGE = {
      id: `local-${Date.now()}-sent`,
      type: 'SENT',
      message: content,
      attachment,
    };
    const chatHistory = messages.map(m => ({
      role: m.type === SENT ? ('user' as const) : ('assistant' as const),
      content: m.message,
    }));
    setMessages(prev => [...prev, sentEntry]);

    try {
      // Uses the local `conversationId` (which already accounts for a
      // conversation eagerly created for a staged attachment), not
      // `activeConversation?.id ?? null` - otherwise this would create a
      // second, orphaned conversation instead of reusing the first.
      const { conversationId: resultConversationId, reply } =
        await sendMessage.mutateAsync({
          conversationId,
          content,
          history: chatHistory,
          attachment,
        });

      const nextMessages = [
        ...messages,
        sentEntry,
        {
          id: `local-${Date.now()}-reply`,
          type: 'RECEIVED' as const,
          message: reply,
          attachment: null,
        },
      ];
      setMessages(nextMessages);

      if (!activeConversation) {
        // Seed the cache so switching activeConversation doesn't briefly
        // flash empty while the invalidated query re-fetches in the
        // background.
        queryClient.setQueryData(['messages', resultConversationId], nextMessages);
        selectConversation({
          id: resultConversationId,
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
          attachment: null,
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
                attachment={attachmentUpload.state}
                onPickFromLibrary={attachmentUpload.pickFromLibrary}
                onTakePhoto={attachmentUpload.takePhoto}
                onRemoveAttachment={attachmentUpload.remove}
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
                  <SentMessageCard
                    message={item.message}
                    attachment={item.attachment}
                  />
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
              attachment={attachmentUpload.state}
              onPickFromLibrary={attachmentUpload.pickFromLibrary}
              onTakePhoto={attachmentUpload.takePhoto}
              onRemoveAttachment={attachmentUpload.remove}
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
