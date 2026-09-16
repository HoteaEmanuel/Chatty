import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
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
    editProfileRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      paddingVertical: vs(14),
      paddingHorizontal: s(16),
      borderRadius: s(12),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    editProfileLabel: {
      fontSize: s(15),
      fontWeight: '600',
      color: theme.colors.text,
    },
    signOutButton: {
      width: '100%',
      backgroundColor: theme.colors.danger,
    },
  });

const ProfileScreen = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const { session } = useAuth();
  const { profile, displayName } = useProfile();
  const [isSigningOut, setIsSigningOut] = useState(false);
 
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
      <UserAvatar size={100}/>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{profile?.email ?? session?.user.email}</Text>

      <TouchableOpacity
        style={styles.editProfileRow}
        onPress={() => navigationRef.navigate('EditProfile')}
        activeOpacity={0.7}
      >
        <Text style={styles.editProfileLabel}>Edit Profile</Text>
        <Feather name="chevron-right" size={18} color={theme.colors.textMuted} />
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
