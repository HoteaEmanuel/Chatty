import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';

export type ConversationSummary = {
  id: string;
  title: string;
  last_message_at: string;
};

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

export function useRenameConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { error } = await supabase
        .from('conversations')
        .update({ title })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

// Soft delete: flips `archived_at`, which the list query already filters on,
// rather than removing the row outright.
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('conversations')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
