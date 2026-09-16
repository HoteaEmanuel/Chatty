import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import AuthButton from '../components/AuthButton';
import { useAuth } from '../auth/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { signOut } from '../auth/session';
import { useNavigation } from '@react-navigation/native';
import { navigationRef } from '../navigation/navigationRef';
import UserAvatar from '../components/UserAvatar';

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
  });

const ProfileScreen = () => {
  const styles = useThemedStyles(makeStyles);
  const { session } = useAuth();
  const { profile, displayName } = useProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const navigation = useNavigation();
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      // No navigation call needed — AuthProvider's onAuthStateChange picks
      // up the cleared session and the app root swaps screens on its own.
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <View style={styles.container}>
      <UserAvatar />
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{profile?.email ?? session?.user.email}</Text>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={() => navigationRef.navigate('EditProfile')}
      >
        <Text>Edit Profile</Text>
      </TouchableOpacity>
      <AuthButton
        label="Sign out"
        loading={isSigningOut}
        onPress={handleSignOut}
        style={styles.signOutButton}
      />
    </View>
  );
};

export default ProfileScreen;
