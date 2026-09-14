import { Button, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import {
  GoogleSignin,
  GoogleSigninButton,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from '@react-native-google-signin/google-signin';
const GoogleSignInLesson = () => {
  GoogleSignin.configure({
    webClientId:
      '991714156421-0skdc61biqlhb1fnokvs999crcfkj54p.apps.googleusercontent.com',
  });

  const [userInfo, setUserInfo] = useState(null);
  const googleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (isSuccessResponse(response)) {
        setUserInfo(response.data);
      } else {
        // sign in was cancelled by user
      }
    } catch (error) {
      if (isErrorWithCode(error)) {
        switch (error.code) {
          case statusCodes.IN_PROGRESS:
            // operation (eg. sign in) already in progress
            break;
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            // Android only, play services not available or outdated
            break;
          default:
          // some other error happened
        }
      } else {
        // an error that's not related to google sign in occurred
      }
    }
  };
  return (
    <View>
      <Text>GoogleSignIn</Text>

      <Button title="Sign in with google" onPress={googleSignIn} />
    </View>
  );
};

export default GoogleSignInLesson;

const styles = StyleSheet.create({});
