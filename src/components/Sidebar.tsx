import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useSidebar } from '../navigation/SidebarContext';
import { useChatSession } from '../navigation/ChatSessionContext';
import { useConversations } from '../hooks/useConversations';
import { useProfile } from '../hooks/useProfile';
import { navigationRef } from '../navigation/navigationRef';

const SIDEBAR_WIDTH = Math.min(320, Dimensions.get('window').width * 0.82);

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    panel: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: SIDEBAR_WIDTH,
      backgroundColor: theme.colors.surface,
      borderRightWidth: StyleSheet.hairlineWidth,
      borderRightColor: theme.colors.border,
      paddingHorizontal: s(12),
    },
    newChatButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: vs(12),
      paddingHorizontal: s(12),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: theme.colors.border,
      marginTop: vs(12),
      marginBottom: vs(16),
    },
    newChatText: {
      fontSize: s(15),
      fontWeight: '600',
      color: theme.colors.text,
    },
    sectionLabel: {
      fontSize: s(12),
      fontWeight: '600',
      color: theme.colors.textMuted,
      paddingHorizontal: s(12),
      marginBottom: vs(4),
    },
    conversationRow: {
      paddingVertical: vs(10),
      paddingHorizontal: s(12),
      borderRadius: s(10),
    },
    conversationRowActive: {
      backgroundColor: theme.colors.border,
    },
    conversationTitle: {
      fontSize: s(14),
      color: theme.colors.text,
    },
    emptyText: {
      fontSize: s(13),
      color: theme.colors.textMuted,
      paddingHorizontal: s(12),
      paddingTop: vs(8),
    },
    loadingContainer: {
      paddingTop: vs(16),
      alignItems: 'center',
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.colors.border,
      paddingTop: vs(10),
      paddingBottom: vs(12),
      gap: vs(4),
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: vs(8),
      paddingHorizontal: s(12),
      borderRadius: s(10),
    },
    avatar: {
      width: s(32),
      height: s(32),
      borderRadius: s(16),
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarInitial: {
      fontSize: s(14),
      fontWeight: '700',
      color: theme.colors.background,
    },
    footerName: {
      fontSize: s(14),
      fontWeight: '600',
      color: theme.colors.text,
    },
    footerEmail: {
      fontSize: s(12),
      color: theme.colors.textMuted,
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: vs(8),
      paddingHorizontal: s(12),
      borderRadius: s(10),
    },
    settingsText: {
      fontSize: s(14),
      color: theme.colors.textMuted,
    },
    footerInfo: {
      flex: 1,
    },
  });

const Sidebar = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isOpen, close } = useSidebar();
  const { activeConversation, startNewChat, selectConversation } =
    useChatSession();
  const { conversations, loading, refresh } = useConversations();
  const { displayName, profile } = useProfile();

  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  // Modal unmounts its content as soon as `visible` goes false, which would
  // cut the slide-out animation short — so this trails `isOpen` by the
  // animation's duration instead of mirroring it directly.
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalVisible(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [isOpen, translateX]);

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen, refresh]);

  const goToChat = () => {
    if (navigationRef.isReady()) navigationRef.navigate('Chat');
  };

  const handleNewChat = () => {
    startNewChat();
    close();
    goToChat();
  };

  const handleSelectConversation = (conversation: {
    id: string;
    title: string;
  }) => {
    selectConversation(conversation);
    close();
    goToChat();
  };

  const handleProfile = () => {
    close();
    if (navigationRef.isReady()) navigationRef.navigate('Profile');
  };

  const handleSettings = () => {
    close();
    if (navigationRef.isReady()) navigationRef.navigate('Settings');
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={close}
    >
      <TouchableWithoutFeedback onPress={close}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <Animated.View
        style={[
          styles.panel,
          { paddingTop: insets.top, transform: [{ translateX }] },
        ]}
      >
        <TouchableOpacity style={styles.newChatButton} onPress={handleNewChat}>
          <Feather name="edit" size={18} color={theme.colors.text} />
          <Text style={styles.newChatText}>New chat</Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>Recent</Text>
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.conversationRow,
                activeConversation?.id === item.id &&
                  styles.conversationRowActive,
              ]}
              onPress={() => handleSelectConversation(item)}
            >
              <Text numberOfLines={1} style={styles.conversationTitle}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color={theme.colors.textMuted} />
              </View>
            ) : (
              <Text style={styles.emptyText}>No conversations yet</Text>
            )
          }
        />

        <View style={[styles.footer, { paddingBottom: insets.bottom + vs(8) }]}>
          <TouchableOpacity style={styles.footerRow} onPress={handleProfile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.footerInfo}>
              <Text numberOfLines={1} style={styles.footerName}>
                {displayName}
              </Text>
              {profile?.email && (
                <Text numberOfLines={1} style={styles.footerEmail}>
                  {profile.email}
                </Text>
              )}
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingsRow} onPress={handleSettings}>
            <Feather name="settings" size={16} color={theme.colors.textMuted} />
            <Text style={styles.settingsText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

export default Sidebar;
