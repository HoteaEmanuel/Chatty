import {
  ActivityIndicator,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useAttachmentUrl } from '../hooks/useAttachmentUrl';
import type { StoredAttachment } from '../types/attachments';

// A lightbox is dark in both themes, so these are deliberately not themed.
const OVERLAY = 'rgba(0,0,0,0.94)';
const FOREGROUND = '#FFFFFF';
const FOREGROUND_MUTED = 'rgba(255,255,255,0.6)';
const SURFACE = 'rgba(255,255,255,0.12)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OVERLAY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: s(12),
    paddingHorizontal: s(16),
    paddingVertical: vs(10),
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: s(14),
    fontWeight: '600',
    color: FOREGROUND,
  },
  subtitle: {
    fontSize: s(12),
    color: FOREGROUND_MUTED,
    marginTop: vs(2),
  },
  closeButton: {
    padding: s(6),
    borderRadius: s(20),
    backgroundColor: SURFACE,
  },
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(12),
  },
  image: {
    width: '100%',
    height: '100%',
  },
  fileCard: {
    alignItems: 'center',
    gap: vs(10),
    padding: s(24),
    borderRadius: s(16),
    backgroundColor: SURFACE,
  },
  fileName: {
    fontSize: s(14),
    color: FOREGROUND,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: s(16),
    paddingTop: vs(12),
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s(8),
    paddingVertical: vs(12),
    borderRadius: s(12),
    backgroundColor: SURFACE,
  },
  actionText: {
    fontSize: s(14),
    fontWeight: '600',
    color: FOREGROUND,
  },
});

type AttachmentPreviewModalProps = {
  visible: boolean;
  attachment: StoredAttachment | null;
  /** Pass an already-signed URL to skip the extra signing request. */
  url?: string | null;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: string;
  onAction?: () => void;
  onClose: () => void;
};

const AttachmentPreviewModal = ({
  visible,
  attachment,
  url = null,
  subtitle,
  actionLabel,
  actionIcon = 'message-circle',
  onAction,
  onClose,
}: AttachmentPreviewModalProps) => {
  const insets = useSafeAreaInsets();
  const { data: signedUrl, isLoading } = useAttachmentUrl(
    url ? null : attachment,
  );

  const uri = url ?? signedUrl ?? null;
  const isImage = attachment?.mimeType.startsWith('image/') ?? false;

  return (
    <Modal
      visible={visible && !!attachment}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          { paddingTop: insets.top, paddingBottom: insets.bottom + vs(12) },
        ]}
      >
        <View style={styles.header}>
          <View style={styles.headerInfo}>
            <Text numberOfLines={1} style={styles.title}>
              {attachment?.fileName ?? 'Attachment'}
            </Text>
            {subtitle && (
              <Text numberOfLines={1} style={styles.subtitle}>
                {subtitle}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close preview"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="x" size={18} color={FOREGROUND} />
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          {isImage && uri ? (
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="contain"
              accessibilityLabel={attachment?.fileName ?? 'Image preview'}
            />
          ) : isImage && isLoading ? (
            <ActivityIndicator color={FOREGROUND_MUTED} />
          ) : (
            <View style={styles.fileCard}>
              <Feather name="file-text" size={40} color={FOREGROUND_MUTED} />
              <Text style={styles.fileName}>
                {attachment?.fileName ?? 'File'}
              </Text>
            </View>
          )}
        </View>

        {actionLabel && onAction && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.actionButton} onPress={onAction}>
              <Feather name={actionIcon} size={16} color={FOREGROUND} />
              <Text style={styles.actionText}>{actionLabel}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
};

export default AttachmentPreviewModal;
