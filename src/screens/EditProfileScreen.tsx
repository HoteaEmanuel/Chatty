import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useProfile } from '../hooks/useProfile';
import UserAvatar from '../components/UserAvatar';
import AntDesign from "react-native-vector-icons/AntDesign"
const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      paddingHorizontal: s(24),
      paddingTop: vs(40),
      gap: vs(12),
      backgroundColor: theme.colors.background,
    },
    avatar: {
      width: s(84),
      height: s(84),
      borderRadius: s(42),
      backgroundColor: theme.colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: vs(8),
    },
    avatarInitial: {
      fontSize: s(32),
      fontWeight: '700',
      color: theme.colors.background,
    },
    name: {
      fontSize: s(20),
      fontWeight: '700',
      color: theme.colors.text,
    },
    email: {
      fontSize: s(14),
      color: theme.colors.textMuted,
      marginBottom: vs(24),
    },
    signOutButton: {
      width: '100%',
      backgroundColor: theme.colors.danger,
    },
    chooseImageButton: {
      position: 'absolute',
      height:'100%',
      width:'100%',
      borderRadius:100,
      top:-3,
      justifyContent:'center',
      alignItems:'center',
      opacity:0.4,
      backgroundColor:'gray'

    },
  });

const EditProfileScreen = () => {
  const { displayName } = useProfile();
  const styles = useThemedStyles(makeStyles);
  const theme=useTheme();
  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <UserAvatar />
        <TouchableOpacity style={styles.chooseImageButton}>
          <AntDesign name='camera' size={theme.sizes} />
        </TouchableOpacity>
      </View>

      <Text>EditProfile</Text>
    </View>
  );
};

export default EditProfileScreen;

// const styles = StyleSheet.create({});
