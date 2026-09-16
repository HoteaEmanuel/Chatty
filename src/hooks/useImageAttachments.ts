import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type { ImageAttachment } from '../types/attachments';

const BUCKET_ID = 'attachments';
const SIGNED_URL_TTL_SECONDS = 3600;

const EMPTY_IMAGES: ImageAttachment[] = [];

type AttachmentRow = {
  id: string;
  bucket_id: string;
  storage_path: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  file_name: string | null;
  size_bytes: number;
  created_at: string;
  conversation_id: string;
  conversations: { title: string } | null;
};

export function useImageAttachments() {
  const { session } = useAuth();

  const query = useQuery({
    queryKey: ['image-attachments', session?.user.id],
    queryFn: async () => {
      // RLS already scopes attachments to auth.uid(), so no user filter here.
      // A null message_id means the upload was staged but never sent.
      const { data, error } = await supabase
        .from('attachments')
        .select(
          'id, bucket_id, storage_path, mime_type, width, height, file_name, size_bytes, created_at, conversation_id, conversations(title)',
        )
        .eq('kind', 'image')
        .not('message_id', 'is', null)
        .order('created_at', { ascending: false });
      if (error) throw error;

      const rows = data as unknown as AttachmentRow[];
      if (rows.length === 0) return EMPTY_IMAGES;

      // One signing round trip for the whole grid instead of one per thumbnail.
      const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET_ID)
        .createSignedUrls(
          rows.map(row => row.storage_path),
          SIGNED_URL_TTL_SECONDS,
        );
      if (signError) throw signError;

      const urlByPath = new Map(
        signed
          .filter(entry => entry.path && entry.signedUrl)
          .map(entry => [entry.path as string, entry.signedUrl as string]),
      );

      return rows.flatMap(row => {
        const url = urlByPath.get(row.storage_path);
        if (!url) return [];
        return [
          {
            id: row.id,
            bucketId: row.bucket_id,
            storagePath: row.storage_path,
            mimeType: row.mime_type,
            width: row.width,
            height: row.height,
            fileName: row.file_name,
            conversationId: row.conversation_id,
            conversationTitle: row.conversations?.title ?? 'Untitled chat',
            sizeBytes: row.size_bytes,
            createdAt: row.created_at,
            url,
          },
        ];
      }) as ImageAttachment[];
    },
    enabled: !!session,
    // Signed URLs live for an hour; refetch before they lapse.
    staleTime: 50 * 60 * 1000,
  });

  return {
    images: query.data ?? EMPTY_IMAGES,
    loading: query.isLoading,
    refresh: query.refetch,
  };
}
