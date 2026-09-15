import { StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
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
  });

const SettingsScreen = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Appearance</Text>
        <Text style={styles.rowValue}>
          {theme.dark ? 'Dark' : 'Light'} (system)
        </Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowLabel}>Version</Text>
        <Text style={styles.rowValue}>{version}</Text>
      </View>
    </View>
  );
};

export default SettingsScreen;
