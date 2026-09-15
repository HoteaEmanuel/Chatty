export type MessageRole = 'user' | 'assistant';

export type MessageStatus = 'streaming' | 'complete' | 'error' | 'cancelled';

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  status: MessageStatus;
  error?: string | null;
  createdAt: string;
};
