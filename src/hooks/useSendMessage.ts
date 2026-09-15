import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import { createConversation } from '../lib/conversations';
import {
  getOpenAIResponse,
  type OpenAIChatMessage,
  type OpenAIContentPart,
} from '../api/http-request';
import type { StoredAttachment } from '../types/attachments';

// Covers OpenAI's fetch of the image after the request is sent; short-lived
// since it only needs to be valid for that one round trip.
const SEND_TIME_SIGNED_URL_TTL_SECONDS = 300;

type SendMessageInput = {
  conversationId: string | null;
  content: string;
  history: OpenAIChatMessage[];
  attachment?: StoredAttachment | null;
};

type SendMessageResult = {
  conversationId: string;
  reply: string;
};


export function deriveConversationTitle(content: string) {
  return content.replace(/\s+/g, ' ').trim().slice(0, 80);
}

export const IMAGE_ONLY_PLACEHOLDER = 'Image';

// An image-only send has empty text content, which would otherwise title the
// conversation blank (the `touch_conversation` trigger has no fallback of its
// own) and leave the message bubble showing nothing.
export function resolveMessageContent(content: string, hasAttachment: boolean) {
  const trimmed = content.trim();
  if (trimmed) return content;
  return hasAttachment ? IMAGE_ONLY_PLACEHOLDER : content;
}

export function useSendMessage() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
      history,
      attachment,
    }: SendMessageInput): Promise<SendMessageResult> => {
      const userId = session!.user.id;
      const targetConversationId =
        conversationId ?? (await createConversation(userId));

      const { data: userMessage, error: userMessageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: targetConversationId,
          user_id: userId,
          role: 'user',
          content,
        })
        .select('id')
        .single();
      if (userMessageError) throw userMessageError;

      let outgoingContent: string | OpenAIContentPart[] = content;

      if (attachment) {
        const { error: linkError } = await supabase
          .from('attachments')
          .update({ message_id: userMessage.id })
          .eq('id', attachment.id);
        if (linkError) throw linkError;

        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from(attachment.bucketId)
            .createSignedUrl(
              attachment.storagePath,
              SEND_TIME_SIGNED_URL_TTL_SECONDS,
            );
        if (signedUrlError) throw signedUrlError;

        outgoingContent = [
          { type: 'text', text: content },
          { type: 'image_url', image_url: { url: signedUrlData.signedUrl } },
        ];
      }

      const reply = await getOpenAIResponse([
        ...history,
        { role: 'user', content: outgoingContent },
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
