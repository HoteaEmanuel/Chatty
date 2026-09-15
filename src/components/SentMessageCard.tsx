import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';

interface SentMessageCardProps {
  message: string;
}
const SentMessageCard = ({ message }: SentMessageCardProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
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
  });
