import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import Sidebar from '../components/Sidebar';
import ChatScreen from '../screens/ChatScreen';
import ImagesScreen from '../screens/ImagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { useTheme } from '../theme';
import { ChatSessionProvider } from './ChatSessionContext';
import { SidebarProvider } from './SidebarContext';
import type { AppStackParamList } from './types';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

// Keeps AppHeader as a fixed banner above the screen, matching the
// pre-navigation layout, rather than switching to the navigator's own header.
const ChatHome = () => (
  <View style={styles.container}>
    <AppHeader />
    <ChatScreen />
  </View>
);

const AppNavigator = () => {
  const theme = useTheme();

  return (
    <ChatSessionProvider>
      <SidebarProvider>
        <View style={styles.root}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Chat" component={ChatHome} />
            <Stack.Screen
              name="Images"
              component={ImagesScreen}
              options={{
                headerShown: true,
                title: 'Images',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerShown: true,
                title: 'Profile',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
              }}
            />

            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Edit Profile',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
              }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.text,
              }}
            />
          </Stack.Navigator>
          <Sidebar />
        </View>
      </SidebarProvider>
    </ChatSessionProvider>
  );
};

export default AppNavigator;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
  },
});
