import { Alert, PermissionsAndroid } from 'react-native';
import {
  getMessaging,
  getToken as getMessagingToken,
  onMessage,
} from '@react-native-firebase/messaging';
import { useEffect } from 'react';
const requestUserPermission = async () => {
  const granted = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  );

  if (granted === PermissionsAndroid.RESULTS.GRANTED) {
    console.log('NOTIFICATIONS PERMISSION GRANTED');
  } else console.log('NOTIFICATIONS PERMISSION DENIED');
};

const getToken = async () => {
  try {
    const token = await getMessagingToken(getMessaging());
    console.log('FCM TOKEN: ', token);
  } catch (error) {
    console.error('Failed to get FCM token:', error);
  }
};

export const useNotifications = () => {
  useEffect(() => {
    requestUserPermission();
    getToken();
  }, []);

  useEffect(() => {
    const messaging = getMessaging();
    const unsubscribe = onMessage(messaging, async remoteMessage => {
      const messageBody = remoteMessage.notification?.body;
      const msgTitle = remoteMessage.notification?.title;

      Alert.alert(messageBody, msgTitle);
    });
    return unsubscribe;
  }, []);
};
