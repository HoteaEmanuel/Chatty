import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';
import AuthTextField from './AuthTextField';

const MAX_TITLE_LENGTH = 100;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.4)',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(24),
    },
    card: {
      width: '100%',
      maxWidth: s(320),
      backgroundColor: theme.colors.surface,
      borderRadius: s(14),
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.colors.border,
      padding: s(18),
      gap: vs(12),
    },
    title: {
      fontSize: s(16),
      fontWeight: '700',
      color: theme.colors.text,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: s(10),
    },
    button: {
      paddingVertical: vs(9),
      paddingHorizontal: s(14),
      borderRadius: s(10),
    },
    cancelButton: {
      backgroundColor: theme.colors.border,
    },
    cancelText: {
      fontSize: s(14),
      fontWeight: '600',
      color: theme.colors.text,
    },
    saveButton: {
      backgroundColor: theme.colors.accent,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveText: {
      fontSize: s(14),
      fontWeight: '600',
      color: theme.colors.background,
    },
    counter: {
      alignSelf: 'flex-end',
      fontSize: s(11),
      color: theme.colors.textMuted,
    },
  });

type RenameConversationModalProps = {
  visible: boolean;
  initialTitle: string;
  loading?: boolean;
  onCancel: () => void;
  onSubmit: (title: string) => void;
};

const RenameConversationModal = ({
  visible,
  initialTitle,
  loading = false,
  onCancel,
  onSubmit,
}: RenameConversationModalProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();
  const [title, setTitle] = useState(initialTitle);

  // Re-seed the input from the current title each time the modal opens,
  // rather than mirroring `initialTitle` on every render.
  useEffect(() => {
    if (visible) setTitle(initialTitle);
  }, [visible, initialTitle]);

  const trimmed = title.trim().slice(0, MAX_TITLE_LENGTH);
  const canSave = trimmed.length > 0 && !loading;

  const handleSave = () => {
    if (!canSave) return;
    onSubmit(trimmed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.card}>
              <Text style={styles.title}>Rename conversation</Text>
              <AuthTextField
                value={title}
                onChangeText={setTitle}
                placeholder="Conversation title"
                autoCapitalize="sentences"
                autoCorrect
                autoFocus
                maxLength={MAX_TITLE_LENGTH}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <Text style={styles.counter}>
                {title.length}/{MAX_TITLE_LENGTH}
              </Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    styles.saveButton,
                    !canSave && styles.saveButtonDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={!canSave}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.background} />
                  ) : (
                    <Text style={styles.saveText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default RenameConversationModal;
