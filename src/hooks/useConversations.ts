import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

export type ConversationSummary = {
  id: string;
  title: string;
  last_message_at: string;
};

// Stable identity so `data ?? []` doesn't hand back a new array reference
// on every render while the query has no data yet.
const EMPTY_CONVERSATIONS: ConversationSummary[] = [];

export function useConversations() {
  const { session } = useAuth();
  const query = useQuery({
    queryKey: ['conversations', session?.user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, last_message_at')
        .is('archived_at', null)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      return data as ConversationSummary[];
    },
    enabled: !!session,
  });

  return {
    conversations: query.data ?? EMPTY_CONVERSATIONS,
    loading: query.isLoading,
    refresh: query.refetch,
  };
}
