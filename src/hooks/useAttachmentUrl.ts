import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { StoredAttachment } from '../types/attachments';

const SIGNED_URL_TTL_SECONDS = 3600;

export function useAttachmentUrl(attachment: StoredAttachment | null) {
  return useQuery({
    queryKey: ['attachment-url', attachment?.bucketId, attachment?.storagePath],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(attachment!.bucketId)
        .createSignedUrl(attachment!.storagePath, SIGNED_URL_TTL_SECONDS);
      if (error) throw error;
      return data.signedUrl;
    },
    enabled: !!attachment,
    staleTime: 50 * 60 * 1000,
  });
}
