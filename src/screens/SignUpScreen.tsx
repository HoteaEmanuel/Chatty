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
import AppTextInput from '../components/AppTextInput';
import AuthButton from '../components/AuthButton';
import { GoogleSignInCancelledError, signInWithGoogle } from '../auth/google';
import { signUpWithEmail } from '../auth/email';
import { signUpSchema, type SignUpInput } from '../auth/validation';
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

type Props = NativeStackScreenProps<AuthStackParamList, 'SignUp'>;

const SignUpScreen = ({ navigation }: Props) => {
  const styles = useThemedStyles(makeStyles);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  const [isSigningUpWithEmail, setIsSigningUpWithEmail] = useState(false);
  const [isSigningUpWithGoogle, setIsSigningUpWithGoogle] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
    null,
  );

  const isBusy = isSigningUpWithEmail || isSigningUpWithGoogle;

  const onEmailSignUp = async ({
    fullName,
    email,
    password,
  }: SignUpInput) => {
    setFormError(null);
    setIsSigningUpWithEmail(true);
    try {
      const session = await signUpWithEmail(email, password, fullName);
      // No session means the project requires email confirmation before a
      // session is issued — AuthProvider handles the case where one is
      // returned immediately, so nothing else to do here either way.
      if (!session) {
        setConfirmationEmail(email);
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sign-up failed');
    } finally {
      setIsSigningUpWithEmail(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setFormError(null);
    setIsSigningUpWithGoogle(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      if (!(err instanceof GoogleSignInCancelledError)) {
        setFormError(err instanceof Error ? err.message : 'Sign-up failed');
      }
    } finally {
      setIsSigningUpWithGoogle(false);
    }
  };

  if (confirmationEmail) {
    return (
      <View style={styles.container}>
        <AppIcon size={s(64)} />
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a confirmation link to {confirmationEmail}. Confirm it,
          then sign in.
        </Text>
        <AuthButton
          label="Back to sign in"
          onPress={() => navigation.navigate('SignIn')}
        />
      </View>
    );
  }

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
          <Text style={styles.title}>Create an account</Text>
          <Text style={styles.subtitle}>Sign up to start chatting</Text>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <AppTextInput
                placeholder="Full name"
                autoCapitalize="words"
                textContentType="name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isBusy}
                errorMessage={errors.fullName?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <AppTextInput
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
              <AppTextInput
                placeholder="Password"
                secureTextEntry
                textContentType="newPassword"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isBusy}
                errorMessage={errors.password?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <AppTextInput
                placeholder="Confirm password"
                secureTextEntry
                textContentType="newPassword"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isBusy}
                errorMessage={errors.confirmPassword?.message}
              />
            )}
          />
          <AuthButton
            label="Create account"
            loading={isSigningUpWithEmail}
            disabled={isBusy}
            onPress={() => handleSubmit(onEmailSignUp)()}
          />
        </View>

        {formError && <Text style={styles.error}>{formError}</Text>}

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        {isSigningUpWithGoogle ? (
          <AuthButton label="Signing in…" loading />
        ) : (
          <GoogleSigninButton
            size={GoogleSigninButton.Size.Wide}
            color={GoogleSigninButton.Color.Dark}
            onPress={handleGoogleSignUp}
            disabled={isBusy}
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity
            disabled={isBusy}
            onPress={() => navigation.navigate('SignIn')}
          >
            <Text style={styles.footerLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default SignUpScreen;
