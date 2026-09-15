import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';

interface ResponseMessageCardProps {
  message: string;
}
const ResponseMessageCard = ({ message }: ResponseMessageCardProps) => {
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.textMessage}>{message}</Text>
      </View>
    </View>
  );
};

export default ResponseMessageCard;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      marginVertical: vs(4),
      marginHorizontal: s(8),
      marginBottom: vs(12),
    },
    messageContainer: {
      backgroundColor: theme.colors.assistantBubble,
      borderRadius: s(20),
      maxWidth: '80%',
      padding: s(10),
    },
    textMessage: {
      color: theme.colors.assistantBubbleText,
      fontSize: s(14),
      fontWeight: '600',
    },
  });
