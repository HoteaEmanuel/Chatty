import { useCallback, useRef, useState } from 'react';
import { Buffer } from 'buffer';
import {
  launchCamera,
  launchImageLibrary,
  type Asset,
} from 'react-native-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../auth/AuthProvider';
import type {
  StagedAttachmentState,
  StoredAttachment,
} from '../types/attachments';

const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  includeBase64: true,
  quality: 0.8 as const,
  maxWidth: 2000,
  maxHeight: 2000,
};

function buildAttachmentPath(
  userId: string,
  conversationId: string,
  mimeType: string,
) {
  const ext = mimeType.split('/')[1] ?? 'jpg';
  const token =
    Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  return `${userId}/${conversationId}/${token}.${ext}`;
}

type UseAttachmentUploadParams = {
  ensureConversationId: () => Promise<string>;
};

export function useAttachmentUpload({
  ensureConversationId,
}: UseAttachmentUploadParams) {
  const { session } = useAuth();
  const [state, setState] = useState<StagedAttachmentState>({ status: 'idle' });
  const stateRef = useRef(state);
  stateRef.current = state;

  const uploadAsset = useCallback(
    async (asset: Asset) => {
      if (!asset.uri || !asset.base64) {
        setState({
          status: 'error',
          localUri: asset.uri ?? '',
          message: "Couldn't read that image. Please try again.",
        });
        return;
      }

      const userId = session!.user.id;
      setState({ status: 'uploading', localUri: asset.uri });

      let path: string | null = null;
      try {
        const conversationId = await ensureConversationId();
        const mimeType = asset.type ?? 'image/jpeg';
        path = buildAttachmentPath(userId, conversationId, mimeType);
        const bytes = Buffer.from(asset.base64, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(path, bytes, { contentType: mimeType, upsert: false });
        if (uploadError) throw uploadError;

        const { data, error: insertError } = await supabase
          .from('attachments')
          .insert({
            conversation_id: conversationId,
            user_id: userId,
            bucket_id: 'attachments',
            storage_path: path,
            kind: 'image',
            mime_type: mimeType,
            size_bytes: asset.fileSize ?? bytes.byteLength,
            file_name: asset.fileName ?? null,
            width: asset.width ?? null,
            height: asset.height ?? null,
          })
          .select(
            'id, bucket_id, storage_path, mime_type, width, height, file_name',
          )
          .single();
        if (insertError) throw insertError;

        const attachment: StoredAttachment = {
          id: data.id,
          bucketId: data.bucket_id,
          storagePath: data.storage_path,
          mimeType: data.mime_type,
          width: data.width,
          height: data.height,
          fileName: data.file_name,
        };
        setState({ status: 'ready', localUri: asset.uri, attachment });
      } catch {
        if (path) {
          try {
            await supabase.storage.from('attachments').remove([path]);
          } catch {
            // Best-effort: the pg_cron purge job is the backstop.
          }
        }
        setState({
          status: 'error',
          localUri: asset.uri,
          message: 'Upload failed. Please try again.',
        });
      }
    },
    [session, ensureConversationId],
  );

  const pickFromLibrary = useCallback(async () => {
    const result = await launchImageLibrary(PICKER_OPTIONS);
    const asset = result.assets?.[0];
    if (result.didCancel || !asset) return;
    await uploadAsset(asset);
  }, [uploadAsset]);

  const takePhoto = useCallback(async () => {
    const result = await launchCamera({
      ...PICKER_OPTIONS,
      saveToPhotos: false,
    });
    const asset = result.assets?.[0];
    if (result.didCancel || !asset) return;
    await uploadAsset(asset);
  }, [uploadAsset]);

  const remove = useCallback(async () => {
    const current = stateRef.current;
    if (current.status === 'idle' || current.status === 'uploading') return;
    if (current.status === 'ready') {
      const { id, storagePath, bucketId } = current.attachment;
      try {
        await supabase.storage.from(bucketId).remove([storagePath]);

        const attachment = await supabase
          .from('attachments')
          .select('conversation_id')
          .eq('id', id);

        console.log('ADDED attachment: ', attachment);
        if (!attachment.data) return;
        const { conversation_id } = attachment.data[0];
        if (conversation_id) {
          const messages = await supabase
            .from('messages')
            .select('id, role, content')
            .eq('conversation_id', conversation_id);

          if (messages.data?.length === 0) {
            // Empty draft conv => Delete it
            await supabase
              .from('conversations')
              .delete()
              .eq('id', conversation_id);
          }
        }
        await supabase.from('attachments').delete().eq('id', id);
      } catch {
        // Best-effort: the pg_cron purge job is the backstop for anything
        // left behind here.
      }
    }
    setState({ status: 'idle' });
  }, []);

  const clearAfterSend = useCallback(() => setState({ status: 'idle' }), []);

  return { state, pickFromLibrary, takePhoto, remove, clearAfterSend };
}
