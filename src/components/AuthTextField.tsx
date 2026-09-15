import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      gap: vs(4),
    },
    input: {
      width: '100%',
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.inputBackground,
      color: theme.colors.text,
      borderRadius: s(12),
      paddingHorizontal: s(16),
      paddingVertical: vs(12),
      fontSize: s(15),
    },
    inputInvalid: {
      borderColor: theme.colors.danger,
    },
    errorText: {
      fontSize: s(12),
      color: theme.colors.danger,
      paddingHorizontal: s(4),
    },
  });

type AuthTextFieldProps = TextInputProps & {
  errorMessage?: string;
};

const AuthTextField = ({
  errorMessage,
  style,
  ...props
}: AuthTextFieldProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <TextInput
        placeholderTextColor={theme.colors.placeholder}
        autoCapitalize="none"
        autoCorrect={false}
        {...props}
        style={[styles.input, errorMessage && styles.inputInvalid, style]}
      />
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
    </View>
  );
};

export default AuthTextField;
