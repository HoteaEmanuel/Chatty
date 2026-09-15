import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { useNotifications } from './src/notifications/useNotifications';
import BootSplash from 'react-native-bootsplash';
import { AuthProvider } from './src/auth/AuthProvider';
import { ThemeProvider } from './src/theme';
import { queryClient } from './src/lib/queryClient';
import RootNavigator from './src/navigation/RootNavigator';

const App = () => {
  useNotifications();

  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log('BootSplash has been hidden successfully');
    });
  }, []);
  return (
    <SafeAreaProvider style={styles.container}>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RootNavigator />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});
