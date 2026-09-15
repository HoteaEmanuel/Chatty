import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppIcon from '../components/AppIcon';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useProfile } from '../hooks/useProfile';

const EmptyChat = () => {
  const { displayName } = useProfile();
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <AppIcon size={60} tintColor={theme.colors.text} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Hello, </Text>
        <Text style={styles.nameText}>{displayName}</Text>
      </View>

      <Text style={styles.subTitle}>What should we do today?</Text>
    </View>
  );
};

export default EmptyChat;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingHorizontal: vs(20),
      gap: s(5),
    },
    textContainer: {
      flexDirection: 'row',
      gap: 5,
      alignItems: 'center',
      marginTop: vs(20),
    },
    nameText: {
      fontSize: s(23),
      fontWeight: 'bold',
      color: theme.colors.accent,
    },
    title: {
      fontSize: s(25),
      fontWeight: '600',
      color: theme.colors.text,
    },
    subTitle: {
      fontSize: s(20),
      fontWeight: '600',
      color: theme.colors.textMuted,
    },
  });
