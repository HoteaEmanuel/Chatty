import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { StoredAttachment } from '../types/attachments';

export type ChatMessage = {
  id: string;
  type: 'SENT' | 'RECEIVED';
  message: string;
  attachment: StoredAttachment | null;
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
        .select(
          'id, role, content, attachments(id, storage_path, bucket_id, mime_type, width, height, file_name)',
        )
        .eq('conversation_id', conversationId as string)
        .order('seq', { ascending: true });
      if (error) throw error;
      return data.map(m => {
        // Nothing at the DB level enforces one attachment per message - that's
        // purely a client convention - so this defensively takes the first.
        const raw = m.attachments?.[0] ?? null;
        return {
          id: m.id,
          type: m.role === 'user' ? 'SENT' : 'RECEIVED',
          message: m.content,
          attachment: raw
            ? ({
                id: raw.id,
                bucketId: raw.bucket_id,
                storagePath: raw.storage_path,
                mimeType: raw.mime_type,
                width: raw.width,
                height: raw.height,
                fileName: raw.file_name,
              } as StoredAttachment)
            : null,
        };
      }) as ChatMessage[];
    },
    enabled: !!conversationId,
  });

  return { messages: query.data ?? EMPTY_MESSAGES, loading: query.isLoading };
}
