import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: s(8),
      marginHorizontal: s(8),
      marginBottom: vs(12),
      backgroundColor: theme.colors.assistantBubble,
      borderRadius: s(20),
      paddingVertical: vs(10),
      paddingHorizontal: s(14),
    },
    text: {
      fontSize: s(13),
      color: theme.colors.assistantBubbleText,
    },
  });

const TypingIndicator = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" color={theme.colors.textMuted} />
      <Text style={styles.text}>Thinking…</Text>
    </View>
  );
};

export default TypingIndicator;
