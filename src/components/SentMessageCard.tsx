import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { colors } from '../styles/colors';

interface SentMessageCardProps {
  message: string;
}
const SentMessageCard = ({ message }: SentMessageCardProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <Text style={styles.textMessage}>{message}</Text>
      </View>
    </View>
  );
};

export default SentMessageCard;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: vs(5),
  },
  messageContainer: {
    backgroundColor: colors.black,
    borderRadius: s(20),
    maxWidth: '80%',
    padding: s(12),
  },
  textMessage: {
    fontSize: s(13),
    color: colors.white,
  },
});

