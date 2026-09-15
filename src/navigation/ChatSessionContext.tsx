import React, { createContext, useContext, useMemo, useState } from 'react';

export type ActiveConversation = { id: string; title: string } | null;

type ChatSessionContextValue = {
  activeConversation: ActiveConversation;
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

  const value = useMemo(
    () => ({
      activeConversation,
      startNewChat: () => setActiveConversation(null),
      selectConversation: (conversation: { id: string; title: string }) =>
        setActiveConversation(conversation),
    }),
    [activeConversation],
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
