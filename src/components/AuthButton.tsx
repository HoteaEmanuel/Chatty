import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  type TouchableOpacityProps,
} from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    button: {
      width: '100%',
      borderRadius: s(12),
      paddingVertical: vs(13),
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.text,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    label: {
      color: theme.colors.background,
      fontSize: s(15),
      fontWeight: '600',
    },
  });

type AuthButtonProps = TouchableOpacityProps & {
  label: string;
  loading?: boolean;
};

const AuthButton = ({
  label,
  loading = false,
  disabled,
  style,
  ...props
}: AuthButtonProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      {...props}
      style={[styles.button, isDisabled && styles.buttonDisabled, style]}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors.background} />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;
