import React, { createContext, useContext, useMemo, useState } from 'react';

export type ActiveConversation = { id: string; title: string } | null;

type ChatSessionContextValue = {
  activeConversation: ActiveConversation;
  // Bumped on every startNewChat/selectConversation call, even when the
  // conversation id doesn't change (e.g. tapping "New chat" while already on
  // an empty, unsent chat) - a reliable signal for resetting draft state that
  // `activeConversation?.id` alone would miss in that case.
  sessionKey: number;
  startNewChat: () => void;
  selectConversation: (conversation: { id: string; title: string }) => void;
};

const ChatSessionContext = createContext<ChatSessionContextValue | null>(
  null,
);

export const ChatSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeConversation, setActiveConversation] =
    useState<ActiveConversation>(null);
  const [sessionKey, setSessionKey] = useState(0);

  const value = useMemo(
    () => ({
      activeConversation,
      sessionKey,
      startNewChat: () => {
        setActiveConversation(null);
        setSessionKey(k => k + 1);
      },
      selectConversation: (conversation: { id: string; title: string }) => {
        setActiveConversation(conversation);
        setSessionKey(k => k + 1);
      },
    }),
    [activeConversation, sessionKey],
  );

  return (
    <ChatSessionContext.Provider value={value}>
      {children}
    </ChatSessionContext.Provider>
  );
};

export const useChatSession = () => {
  const ctx = useContext(ChatSessionContext);
  if (!ctx) {
    throw new Error('useChatSession must be used within ChatSessionProvider');
  }
  return ctx;
};
