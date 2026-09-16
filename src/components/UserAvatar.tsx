import { Image, ImageProps, StyleSheet, Text, View } from 'react-native';
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
      height: '100',
      width: '100%',
      resizeMode: 'cover',
      borderRadius: s(42),
    },
  });

type UserAvatarProps = {
  style?: ImageProps;
  size?: number;
};
const UserAvatar = ({ style, size = 50 }: UserAvatarProps) => {
  const { displayName, profile } = useProfile();

  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.avatar, { height: s(size), width: vs(size) }]}>
      {profile?.avatarUrl ? (
        <Image
          style={[styles.image, { height: size, width: size }, style]}
          source={{ uri: profile.avatarUrl }}
        />
      ) : (
        <Text style={styles.avatarInitial}>{displayName.charAt(0)} </Text>
      )}
    </View>
  );
};

export default UserAvatar;
