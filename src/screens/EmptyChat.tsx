import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppIcon from '../components/AppIcon';
import { s, vs } from 'react-native-size-matters';
import { colors } from '../styles/colors';

const EmptyChat = () => {
  return (
    <View style={styles.container}>
      <AppIcon size={60} tintColor={colors.black} />
      <View style={styles.textContainer}>
        <Text style={styles.title}>Hello, </Text>
        <Text style={styles.nameText}>Domitian</Text>
      </View>

      <Text style={styles.subTitle}>What should we do today?</Text>
    </View>
  );
};

export default EmptyChat;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: vs(20),
    paddingTop: vs(150),
    gap: s(5),
  },
  textContainer: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    marginTop: vs(20),
  },
  nameText:{
     fontSize: s(23),
    fontWeight: 'bold',
    color:colors.green

  },
  title: {
    fontSize: s(25),
    fontWeight: 'semibold'

  },
  subTitle: {
    fontSize: s(20),
    fontWeight: 'semibold',
  },
});
