import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import type { MenuAnchor } from './ConversationOptionsMenu';
import { useActionSheet } from '../hooks/useActionSheet';

const MENU_WIDTH = s(190);
// Rough height of the two-row menu, used only to decide whether it should
// drop above or below the anchor near the edges of the screen.
const MENU_HEIGHT_ESTIMATE = vs(96);
const SCREEN_MARGIN = s(8);

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
    },
    menu: {
      position: 'absolute',
      width: MENU_WIDTH,
      backgroundColor: theme.colors.surface,
      borderRadius: s(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      paddingVertical: vs(4),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: vs(10),
      paddingHorizontal: s(14),
    },
    optionText: {
      fontSize: s(14),
      color: theme.colors.text,
    },
    separator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
      marginHorizontal: s(8),
    },
  });

type AttachmentActionSheetProps = {
  visible: boolean;
  anchor: MenuAnchor | null;

  onClose: () => void;
  onTakePhoto: () => void;
  onGalleryPick: () => void;
};

const AttachmentActionSheet = ({
  visible,
  anchor,
  onClose,
  onGalleryPick,
  onTakePhoto,
}: AttachmentActionSheetProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  if (!visible || !anchor) return null;

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  let left = anchor.x + anchor.width - MENU_WIDTH;
  left = Math.max(
    SCREEN_MARGIN,
    Math.min(left, screenWidth - MENU_WIDTH - SCREEN_MARGIN),
  );

  let top = anchor.y + anchor.height + vs(4);
  if (top + MENU_HEIGHT_ESTIMATE > screenHeight - SCREEN_MARGIN) {
    top = anchor.y - MENU_HEIGHT_ESTIMATE - vs(4);
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={[styles.menu, { left, top }]}>
        <TouchableOpacity style={styles.option} onPress={onGalleryPick}>
          <Feather name="image" size={16} color={theme.colors.text} />
          <Text style={styles.optionText}>Choose from library</Text>
        </TouchableOpacity>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.option} onPress={onTakePhoto}>
          <Feather name="camera" size={16} color={theme.colors.text} />
          <Text style={styles.optionText}>Take photo</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default AttachmentActionSheet;
