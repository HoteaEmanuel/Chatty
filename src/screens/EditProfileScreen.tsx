import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import { useProfile, useUpdateProfile } from '../hooks/useProfile';
import UserAvatar from '../components/UserAvatar';
import AppTextInput from '../components/AppTextInput';
import AuthButton from '../components/AuthButton';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AttachmentActionSheet from '../components/AttachmentActionSheet';
import { useActionSheet } from '../hooks/useActionSheet';
import { MenuAnchor } from '../components/ConversationOptionsMenu';
import {
  ImagePickerResponse,
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import { supabase } from '../lib/supabase';
import { updatePassword } from '../auth/email';
import { editProfileSchema, type EditProfileInput } from '../auth/validation';
import { Buffer } from 'buffer';

const PICKER_OPTIONS = {
  mediaType: 'photo' as const,
  includeBase64: true,
  quality: 0.8 as const,
  maxWidth: 2000,
  maxHeight: 2000,
};
const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      alignItems: 'center',
      paddingHorizontal: s(24),
      paddingTop: vs(40),
      paddingBottom: vs(32),
      gap: vs(12),
      backgroundColor: theme.colors.background,
    },
    avatarWrapper: {
      width: s(84),
      height: s(84),
      marginBottom: vs(8),
    },
    editBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: s(30),
      height: s(30),
      borderRadius: s(15),
      backgroundColor: theme.colors.accent,
      borderWidth: 2,
      borderColor: theme.colors.background,
      alignItems: 'center',
      justifyContent: 'center',
    },
    section: {
      width: '100%',
      gap: vs(12),
      marginTop: vs(12),
    },
    sectionLabel: {
      fontSize: s(13),
      fontWeight: '700',
      color: theme.colors.textMuted,
      textTransform: 'uppercase',
      alignSelf: 'flex-start',
    },
    error: {
      fontSize: s(13),
      color: theme.colors.danger,
      textAlign: 'center',
    },
    saveButton: {
      width: '100%',
      marginTop: vs(20),
    },
  });

const EditProfileScreen = () => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const attachButtonRef =
    useRef<React.ElementRef<typeof TouchableOpacity>>(null);

  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [sheetAnchor, setSheetAnchor] = useState<MenuAnchor | null>(null);
  const { openSheet } = useActionSheet({
    setSheetVisible: setActionSheetVisible,
    setSheetAnchor: setSheetAnchor,
    ref: attachButtonRef,
    onPickFromLibrary: () => {},
    onTakePhoto: () => {},
  });

  const { profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    resetField,
    formState: { errors },
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: { fullName: '', newPassword: '', confirmPassword: '' },
  });

  // The form mounts before `useProfile` resolves, so seed it once the row
  // actually arrives rather than relying on defaultValues (which only apply
  // at mount).
  useEffect(() => {
    if (profile)
      reset({
        fullName: profile.fullName ?? '',
        newPassword: '',
        confirmPassword: '',
      });
  }, [profile, reset]);

  const updateProfileImage = async (result: ImagePickerResponse) => {
    if (!result || !result.assets || result.didCancel) return;
    const asset = result?.assets[0];
    if (!asset || !asset.base64) return;
    if (!profile) return;

    const bytes = Buffer.from(asset.base64, 'base64');
    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(profile.id, bytes, {
        contentType: asset.type ?? 'application/octet-stream',
        upsert: true,
      });
    if (uploadError) return;

    const { data } = supabase.storage.from('profiles').getPublicUrl(profile.id);
    const avatarUrl = `${data.publicUrl}?updated=${Date.now()}`;

    updateProfile.mutate({
      id: profile.id,
      updates: { avatar_url: avatarUrl },
    });
  };

  const handleGalleryImagePick = async () => {
    const result = await launchImageLibrary(PICKER_OPTIONS);
    updateProfileImage(result);
  };

  const handleImageTake = async () => {
    const result = await launchCamera({
      ...PICKER_OPTIONS,
      saveToPhotos: false,
    });
    updateProfileImage(result);
  };

  const onSubmit = async ({ fullName, newPassword }: EditProfileInput) => {
    if (!profile) return;
    setFormError(null);
    setIsSaving(true);
    try {
      const trimmedName = fullName.trim();
      if (trimmedName !== (profile.fullName ?? '')) {
        await updateProfile.mutateAsync({
          id: profile.id,
          updates: { full_name: trimmedName },
        });
      }
      if (newPassword) {
        await updatePassword(newPassword);
        resetField('newPassword');
        resetField('confirmPassword');
      }
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Could not save changes',
      );
    } finally {
      setIsSaving(false);
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
        <View style={styles.avatarWrapper}>
          <UserAvatar size={90} />
          <TouchableOpacity
            style={styles.editBadge}
            onPress={openSheet}
            ref={attachButtonRef}
            activeOpacity={0.8}
          >
            <AntDesign name="camera" size={s(14)} color={theme.colors.background} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Profile</Text>
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <AppTextInput
                label="Name"
                placeholder="Full name"
                autoCapitalize="words"
                textContentType="name"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isSaving}
                errorMessage={errors.fullName?.message}
              />
            )}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Change password</Text>
          <Controller
            control={control}
            name="newPassword"
            render={({ field }) => (
              <AppTextInput
                label="New password"
                placeholder="Leave blank to keep current password"
                secureTextEntry
                textContentType="newPassword"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isSaving}
                errorMessage={errors.newPassword?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <AppTextInput
                label="Confirm new password"
                placeholder="Repeat new password"
                secureTextEntry
                textContentType="newPassword"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                editable={!isSaving}
                errorMessage={errors.confirmPassword?.message}
              />
            )}
          />
        </View>

        {formError && <Text style={styles.error}>{formError}</Text>}

        <AuthButton
          label="Save changes"
          loading={isSaving}
          disabled={isSaving}
          onPress={() => handleSubmit(onSubmit)()}
          style={styles.saveButton}
        />

        <AttachmentActionSheet
          visible={actionSheetVisible}
          onClose={() => setActionSheetVisible(false)}
          anchor={sheetAnchor}
          onGalleryPick={handleGalleryImagePick}
          onTakePhoto={handleImageTake}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfileScreen;
