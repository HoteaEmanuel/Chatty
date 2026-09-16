import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import Feather from 'react-native-vector-icons/Feather';
import { useTheme, useThemeMode, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import { version } from '../../package.json';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      paddingTop: vs(8),
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: s(20),
      paddingVertical: vs(14),
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    rowLabel: {
      fontSize: s(15),
      color: theme.colors.text,
    },
    rowValue: {
      fontSize: s(15),
      color: theme.colors.textMuted,
    },
    appearanceValue: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
    },
  });

const SettingsScreen = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const { setThemeMode } = useThemeMode();
  const { profile } = useProfile();
  const updateProfile = useUpdateProfile();

  const handleToggleTheme = () => {
    const nextMode = theme.dark ? 'light' : 'dark';
    setThemeMode(nextMode);

    if (profile) {
      updateProfile.mutate({
        id: profile.id,
        updates: { theme_preference: nextMode },
      });
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.row}
        onPress={handleToggleTheme}
        activeOpacity={0.7}
      >
        <Text style={styles.rowLabel}>Appearance</Text>
        <View style={styles.appearanceValue}>
          <Feather
            name={theme.dark ? 'moon' : 'sun'}
            size={16}
            color={theme.colors.textMuted}
          />
          <Text style={styles.rowValue}>{theme.dark ? 'Dark' : 'Light'}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Version</Text>
        <Text style={styles.rowValue}>{version}</Text>
      </View>
    </View>
  );
};

export default SettingsScreen;
