import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { colors } from '../styles/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSidebar } from '../navigation/SidebarContext';
import { useChatSession } from '../navigation/ChatSessionContext';

const AppHeader = () => {
  const insets = useSafeAreaInsets();
  const { open } = useSidebar();
  const { activeConversation } = useChatSession();

  return (
    <View style={[styles.container, { paddingTop: insets.top + vs(12) }]}>
      <TouchableOpacity
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel="Open sidebar"
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="menu" size={22} color={colors.white} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {activeConversation?.title ?? 'Chatty'}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: s(16),
    paddingVertical: vs(12),
    backgroundColor: colors.black,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.white,
    fontSize: s(16),
    fontWeight: '600',
    marginHorizontal: s(8),
  },
  spacer: {
    width: s(22),
  },
});
