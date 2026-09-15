import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useRef, useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useChatSession } from '../navigation/ChatSessionContext';
import {
  useDeleteConversation,
  useRenameConversation,
  type ConversationSummary,
} from '../hooks/useConversations';
import ConversationOptionsMenu, {
  type MenuAnchor,
} from './ConversationOptionsMenu';
import RenameConversationModal from './RenameConversationModal';
import ConfirmModal from './ConfirmModal';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: s(10),
    },
    rowActive: {
      backgroundColor: theme.colors.border,
    },
    touchable: {
      flex: 1,
      paddingVertical: vs(10),
      paddingHorizontal: s(12),
    },
    title: {
      fontSize: s(14),
      color: theme.colors.text,
    },
    moreButton: {
      paddingVertical: vs(10),
      paddingHorizontal: s(10),
    },
  });

type ConversationItemProps = {
  conversation: ConversationSummary;
  active: boolean;
  onPress: () => void;
};

const ConversationItem = ({ conversation, active, onPress }: ConversationItemProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const { activeConversation, selectConversation, startNewChat } = useChatSession();
  const renameConversation = useRenameConversation();
  const deleteConversation = useDeleteConversation();

  const moreButtonRef = useRef<React.ElementRef<typeof TouchableOpacity>>(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<MenuAnchor | null>(null);
  const [renameVisible, setRenameVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const openMenu = () => {
    moreButtonRef.current?.measureInWindow((x, y, width, height) => {
      setMenuAnchor({ x, y, width, height });
      setMenuVisible(true);
    });
  };

  const handleEditTitle = () => {
    setMenuVisible(false);
    setRenameVisible(true);
  };

  const handleDeletePress = () => {
    setMenuVisible(false);
    setDeleteVisible(true);
  };

  const handleRenameSubmit = (title: string) => {
    renameConversation.mutate(
      { id: conversation.id, title },
      {
        onSuccess: () => {
          setRenameVisible(false);
          if (activeConversation?.id === conversation.id) {
            selectConversation({ id: conversation.id, title });
          }
        },
      },
    );
  };

  const handleDeleteConfirm = () => {
    deleteConversation.mutate(conversation.id, {
      onSuccess: () => {
        setDeleteVisible(false);
        if (activeConversation?.id === conversation.id) {
          startNewChat();
        }
      },
    });
  };

  return (
    <View style={[styles.row, active && styles.rowActive]}>
      <TouchableOpacity style={styles.touchable} onPress={onPress}>
        <Text numberOfLines={1} style={styles.title}>
          {conversation.title}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        ref={moreButtonRef}
        style={styles.moreButton}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel="Conversation options"
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Feather name="more-vertical" size={16} color={theme.colors.textMuted} />
      </TouchableOpacity>

      <ConversationOptionsMenu
        visible={menuVisible}
        anchor={menuAnchor}
        onEditTitle={handleEditTitle}
        onDelete={handleDeletePress}
        onClose={() => setMenuVisible(false)}
      />

      <RenameConversationModal
        visible={renameVisible}
        initialTitle={conversation.title}
        loading={renameConversation.isPending}
        onCancel={() => setRenameVisible(false)}
        onSubmit={handleRenameSubmit}
      />

      <ConfirmModal
        visible={deleteVisible}
        title="Delete conversation?"
        message={`"${conversation.title}" will be removed from your history.`}
        confirmLabel="Delete"
        destructive
        loading={deleteConversation.isPending}
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDeleteConfirm}
      />
    </View>
  );
};

export default ConversationItem;
