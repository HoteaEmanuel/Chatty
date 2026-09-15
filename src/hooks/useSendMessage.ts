import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { getOpenAIResponse, type OpenAIChatMessage } from '../api/http-request';

type SendMessageInput = {
  conversationId: string | null;
  content: string;
  history: OpenAIChatMessage[];
};

type SendMessageResult = {
  conversationId: string;
  reply: string;
};

// Mirrors the `touch_conversation` trigger's title derivation so the header
// and sidebar can show the right title immediately, before the invalidated
// query round-trips back with the (identical) server-computed value.
export function deriveConversationTitle(content: string) {
  return content.replace(/\s+/g, ' ').trim().slice(0, 80);
}

export function useSendMessage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      history,
    }: SendMessageInput): Promise<SendMessageResult> => {
      const userId = session!.user.id;
      let targetConversationId = conversationId;

      if (!targetConversationId) {
        const { data, error } = await supabase
          .from('conversations')
          .insert({ user_id: userId })
          .select('id')
          .single();
        if (error) throw error;
        targetConversationId = data.id as string;
      }

      const { error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          user_id: userId,
          role: 'user',
          content,
        });
      if (userMessageError) throw userMessageError;

      const reply = await getOpenAIResponse([
        ...history,
        { role: 'user', content },
      ]);

      const { error: assistantMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          user_id: userId,
          role: 'assistant',
          content: reply,
        });
      if (assistantMessageError) throw assistantMessageError;

      return { conversationId: targetConversationId, reply };
    },
    onSuccess: ({ conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });
}
