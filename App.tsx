import { FlatList, StatusBar, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useNotifications } from './src/notifications/useNotifications';
import CameraGallery from './src/learn/CameraGallery';
import BootSplash from 'react-native-bootsplash';
import GoogleMap from './src/learn/GoogleMap';
import AppHeader from './src/components/AppHeader';
import SentMessageCard from './src/components/SentMessageCard';
import ResponseMessageCard from './src/components/ResponseMessageCard';
import { s } from 'react-native-size-matters';
import ChatScreen from './src/screens/ChatScreen';
const App = () => {
  useNotifications();

  useEffect(() => {
    const init = async () => {
      // …do multiple sync or async tasks
    };

    init().finally(async () => {
      await BootSplash.hide({ fade: true });
      console.log('BootSplash has been hidd en successfully');
    });
  }, []);
  return (
    <SafeAreaProvider style={styles.container}>
      <AppHeader />
      <ChatScreen />
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
