import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useRef, useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useKeyboardState } from '../hooks/useKeyboardState';
import type { StagedAttachmentState } from '../types/attachments';
import AttachmentActionSheet from './AttachmentActionSheet';
import type { MenuAnchor } from './ConversationOptionsMenu';
import { useActionSheet } from '../hooks/useActionSheet';

const IDLE_ATTACHMENT: StagedAttachmentState = { status: 'idle' };

interface ChatInputProps {
  messageValue: string;
  setMessageValue: (message: string) => void;
  onMessageSent: () => void;
  sending?: boolean;
  floating?: boolean;
  attachment?: StagedAttachmentState;
  onPickFromLibrary?: () => void;
  onTakePhoto?: () => void;
  onRemoveAttachment?: () => void;
}

const ChatInput = ({
  messageValue,
  setMessageValue,
  onMessageSent,
  sending = false,
  floating = false,
  attachment = IDLE_ATTACHMENT,
  onPickFromLibrary,
  onTakePhoto,
  onRemoveAttachment,
}: ChatInputProps) => {
  const { isKeyboardVisible } = useKeyboardState();
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  const attachButtonRef =
    useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetAnchor, setSheetAnchor] = useState<MenuAnchor | null>(null);

  const canAttach = !!(onPickFromLibrary || onTakePhoto);
  const isUploading = attachment.status === 'uploading';
  const canSend =
    (messageValue.trim().length > 0 || attachment.status === 'ready') &&
    !sending &&
    !isUploading;

  const handleSendMessage = () => {
    if (!canSend) return;
    onMessageSent();
  };

  const openSheet = () => {
    attachButtonRef.current?.measureInWindow((x, y, width, height) => {
      setSheetAnchor({ x, y, width, height });
      setSheetVisible(true);
    });
  };

  const handleChooseLibrary = onPickFromLibrary
    ? () => {
        setSheetVisible(false);
        onPickFromLibrary();
      }
    : undefined;

  const handleTakePhoto = onTakePhoto
    ? () => {
        setSheetVisible(false);
        onTakePhoto();
      }
    : undefined;

  return (
    <View
      style={[
        styles.wrapper,
        floating && styles.floatingContainer,
        { paddingBottom: floating || isKeyboardVisible ? vs(10) : vs(20) },
      ]}
    >
      {attachment.status !== 'idle' && (
        <View style={styles.previewRow}>
          <View
            style={[
              styles.thumbnailWrap,
              attachment.status === 'error' && styles.thumbnailWrapError,
            ]}
          >
            <Image
              source={{ uri: attachment.localUri }}
              style={styles.thumbnail}
            />
            {isUploading && (
              <View style={styles.thumbnailOverlay}>
                <ActivityIndicator size="small" color="#FFFFFF" />
              </View>
            )}
            {onRemoveAttachment && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={onRemoveAttachment}
                disabled={isUploading}
                accessibilityRole="button"
                accessibilityLabel="Remove attachment"
              >
                <Feather name="x" size={12} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>
          {attachment.status === 'error' && (
            <Text numberOfLines={2} style={styles.errorText}>
              {attachment.message}
            </Text>
          )}
        </View>
      )}

      <View style={styles.inputRow}>
        {canAttach && (
          <TouchableOpacity
            ref={attachButtonRef}
            style={styles.attachButton}
            onPress={openSheet}
            disabled={sending || isUploading}
            accessibilityRole="button"
            accessibilityLabel="Attach an image"
          >
            <Feather name="paperclip" size={18} color={theme.colors.text} />
          </TouchableOpacity>
        )}

        <TextInput
          style={styles.input}
          placeholder="Message..."
          placeholderTextColor={theme.colors.placeholder}
          value={messageValue}
          onChangeText={setMessageValue}
          multiline
          editable={!sending}
        />

        <TouchableOpacity
          style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!canSend}
        >
          {sending ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Feather name="send" size={20} color={theme.colors.background} />
          )}
        </TouchableOpacity>
      </View>

      {canAttach && (
        <AttachmentActionSheet
          visible={sheetVisible}
          anchor={sheetAnchor}
          onGalleryPick={handleChooseLibrary ?? (() => {})}
          onTakePhoto={handleTakePhoto ?? (() => {})}
          onClose={() => setSheetVisible(false)}
        />
      )}
    </View>
  );
};

export default ChatInput;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      backgroundColor: theme.colors.background,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      padding: vs(5),
    },
    floatingContainer: {
      borderTopWidth: 0,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      borderRadius: s(24),
      paddingHorizontal: s(6),
      shadowColor: '#000',
      shadowOpacity: theme.dark ? 0 : 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: theme.dark ? 0 : 2,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingHorizontal: s(6),
      paddingTop: vs(6),
      paddingBottom: vs(4),
    },
    thumbnailWrap: {
      width: s(60),
      height: s(60),
      borderRadius: s(12),
      overflow: 'hidden',
      backgroundColor: theme.colors.surface,
    },
    thumbnailWrapError: {
      borderWidth: 1.5,
      borderColor: theme.colors.danger,
    },
    thumbnail: {
      width: '100%',
      height: '100%',
    },
    thumbnailOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    removeButton: {
      position: 'absolute',
      top: -s(6),
      right: -s(6),
      width: s(20),
      height: s(20),
      borderRadius: s(10),
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    errorText: {
      flex: 1,
      fontSize: s(11),
      color: theme.colors.danger,
      marginLeft: s(8),
      marginTop: vs(4),
    },
    attachButton: {
      width: s(35),
      height: s(35),
      borderRadius: s(20),
      backgroundColor: theme.colors.inputBackground,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: s(8),
    },
    input: {
      flex: 1,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
      paddingHorizontal: s(15),
      paddingVertical: vs(10),
      marginRight: s(10),
      borderRadius: s(20),
      maxHeight: vs(120),
    },
    sendButton: {
      width: s(35),
      height: s(35),
      borderRadius: s(20),
      backgroundColor: theme.colors.text,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.4,
    },
  });
