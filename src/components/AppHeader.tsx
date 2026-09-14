import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import AppIcon from './AppIcon';
import { s, vs } from 'react-native-size-matters';
import { colors } from '../styles/colors';
import { IS_ANDROID } from '../constants/platform';

const AppHeader = () => {
  return (
    <View style={styles.container}>
      <Text>Hello</Text>
      <AppIcon size={s(40)} />
    </View>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: vs(12),
    backgroundColor: colors.black,
    paddingTop: IS_ANDROID ? undefined : vs(50),
  },
});
