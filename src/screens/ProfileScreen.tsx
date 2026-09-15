import { StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import AuthButton from '../components/AuthButton';
import { useAuth } from '../auth/AuthProvider';
import { useProfile } from '../hooks/useProfile';
import { signOut } from '../auth/session';

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
  });

const ProfileScreen = () => {
  const styles = useThemedStyles(makeStyles);
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
      <View style={styles.avatar}>
        <Text style={styles.avatarInitial}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <Text style={styles.name}>{displayName}</Text>
      <Text style={styles.email}>{profile?.email ?? session?.user.email}</Text>

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
