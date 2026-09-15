export type StoredAttachment = {
  id: string;
  bucketId: string;
  storagePath: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  fileName: string | null;
};

export type StagedAttachmentState =
  | { status: 'idle' }
  | { status: 'uploading'; localUri: string }
  | { status: 'ready'; localUri: string; attachment: StoredAttachment }
  | { status: 'error'; localUri: string; message: string };
