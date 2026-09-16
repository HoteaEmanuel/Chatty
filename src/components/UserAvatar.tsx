import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { s, vs } from 'react-native-size-matters';
const makeStyles = (theme: Theme) =>
  StyleSheet.create({
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
    image: {
      flex: 1,
      resizeMode: 'cover',
      borderRadius: '50%',
    },
  });
const UserAvatar = () => {
  const { displayName, profile } = useProfile();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.avatar}>
      {profile?.avatarUrl ? (
        <Image style={styles.image} source={{ uri: profile.avatarUrl }} />
      ) : (
        <Text style={styles.avatarInitial}>{displayName.charAt(0)} </Text>
      )}
    </View>
  );
};

export default UserAvatar;
