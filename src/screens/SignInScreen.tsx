import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { s, vs } from 'react-native-size-matters';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import AppIcon from '../components/AppIcon';
import AuthTextField from '../components/AuthTextField';
import AuthButton from '../components/AuthButton';
import { GoogleSignInCancelledError, signInWithGoogle } from '../auth/google';
import { signInWithEmail } from '../auth/email';
import { signInSchema, type SignInInput } from '../auth/validation';
import type { AuthStackParamList } from '../navigation/types';

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24),
      paddingVertical: vs(32),
      gap: vs(16),
      backgroundColor: theme.colors.background,
    },
    header: {
      alignItems: 'center',
      gap: vs(8),
      marginBottom: vs(8),
    },
    title: {
      fontSize: s(22),
      fontWeight: '700',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: s(14),
      color: theme.colors.textMuted,
      textAlign: 'center',
    },
    form: {
      width: '100%',
      gap: vs(12),
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: s(10),
      marginVertical: vs(4),
    },
    dividerLine: {
      flex: 1,
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      fontSize: s(12),
      color: theme.colors.textMuted,
    },
    error: {
      fontSize: s(13),
      color: theme.colors.danger,
      textAlign: 'center',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: vs(8),
    },
    footerText: {
      fontSize: s(13),
      color: theme.colors.textMuted,
    },
    footerLink: {
      fontSize: s(13),
      color: theme.colors.text,
      fontWeight: '600',
    },
  });

type Props = NativeStackScreenProps<AuthStackParamList, 'SignIn'>;

const SignInScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(makeStyles);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  });
  const [isSigningInWithEmail, setIsSigningInWithEmail] = useState(false);
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isBusy = isSigningInWithEmail || isSigningInWithGoogle;

  const onEmailSignIn = async ({ email, password }: SignInInput) => {
    setFormError(null);
    setIsSigningInWithEmail(true);
    try {
      await signInWithEmail(email, password);
      // No navigation call needed — AuthProvider's onAuthStateChange picks
      // up the new session and the app root swaps screens on its own.
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign-in failed');
    } finally {
      setIsSigningInWithEmail(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsSigningInWithGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (!(err instanceof GoogleSignInCancelledError)) {
        setFormError(err instanceof Error ? err.message : 'Sign-in failed');
      }
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <AppIcon size={s(64)} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue chatting</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <AuthTextField
                placeholder="Email"
                keyboardType="email-address"
                textContentType="emailAddress"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isBusy}
                errorMessage={errors.email?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <AuthTextField
                placeholder="Password"
                secureTextEntry
                textContentType="password"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isBusy}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <AuthButton
            label="Sign in"
            loading={isSigningInWithEmail}
            disabled={isBusy}
            onPress={() => handleSubmit(onEmailSignIn)()}
          />
        </View>

        {formError && <Text style={styles.error}>{formError}</Text>}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {isSigningInWithGoogle ? (
          <AuthButton label="Signing in…" loading />
        ) : (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignIn}
            disabled={isBusy}
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity
            disabled={isBusy}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.footerLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignInScreen;
