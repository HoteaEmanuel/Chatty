import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useAttachmentUrl } from '../hooks/useAttachmentUrl';
import type { StoredAttachment } from '../types/attachments';

interface SentMessageCardProps {
  message: string;
  attachment?: StoredAttachment | null;
}
const SentMessageCard = ({ message, attachment = null }: SentMessageCardProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const { data: attachmentUrl, isLoading: attachmentUrlLoading } =
    useAttachmentUrl(attachment);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        {attachment && (
          <View style={styles.thumbnailWrap}>
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
          </View>
        )}
        <Text style={styles.textMessage}>{message}</Text>
      </View>
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
