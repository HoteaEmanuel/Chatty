import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useAttachmentUrl } from '../hooks/useAttachmentUrl';
import type { StoredAttachment } from '../types/attachments';
import AttachmentPreviewModal from './AttachmentPreviewModal';

interface SentMessageCardProps {
  message: string;
  attachment?: StoredAttachment | null;
}
const SentMessageCard = ({ message, attachment = null }: SentMessageCardProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const { data: attachmentUrl, isLoading: attachmentUrlLoading } =
    useAttachmentUrl(attachment);
  const [previewVisible, setPreviewVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        {attachment && (
          <TouchableOpacity
            style={styles.thumbnailWrap}
            onPress={() => setPreviewVisible(true)}
            disabled={!attachmentUrl}
            activeOpacity={0.8}
          >
            {attachmentUrl ? (
              <Image
                source={{ uri: attachmentUrl }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              attachmentUrlLoading && (
                <ActivityIndicator size="small" color={theme.colors.textMuted} />
              )
            )}
          </TouchableOpacity>
        )}
        <Text style={styles.textMessage}>{message}</Text>
      </View>

      <AttachmentPreviewModal
        visible={previewVisible}
        attachment={attachment}
        url={attachmentUrl}
        onClose={() => setPreviewVisible(false)}
      />
    </View>
  );
};

export default SentMessageCard;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginVertical: vs(5),
      marginHorizontal: s(8),
    },
    messageContainer: {
      backgroundColor: theme.colors.userBubble,
      borderRadius: s(20),
      maxWidth: '80%',
      padding: s(12),
    },
    textMessage: {
      fontSize: s(13),
      color: theme.colors.userBubbleText,
    },
    thumbnailWrap: {
      width: s(180),
      height: s(180),
      borderRadius: s(14),
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: vs(8),
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
  });
