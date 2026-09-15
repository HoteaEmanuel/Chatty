import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export type ChatMessage = {
  id: string;
  type: 'SENT' | 'RECEIVED';
  message: string;
};

// Stable identity so consumers that key a useEffect on `messages` (e.g.
// ChatScreen resetting local state) don't re-run every render — `data ?? []`
// would otherwise hand back a fresh array each time and loop forever.
const EMPTY_MESSAGES: ChatMessage[] = [];

export function useConversationMessages(conversationId: string | null) {
  const query = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, role, content')
        .eq('conversation_id', conversationId as string)
        .order('seq', { ascending: true });
      if (error) throw error;
      return data.map(m => ({
        id: m.id,
        type: m.role === 'user' ? 'SENT' : 'RECEIVED',
        message: m.content,
      })) as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  return { messages: query.data ?? EMPTY_MESSAGES, loading: query.isLoading };
}
