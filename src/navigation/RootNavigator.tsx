import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../auth/AuthProvider';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import { navigationRef } from './navigationRef';

// One NavigationContainer for the app's lifetime; only the tree beneath it
// swaps when auth state changes. Recreating the container itself on every
// sign-in/out would drop its navigation state and restart the mount animation.
const RootNavigator = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
});
