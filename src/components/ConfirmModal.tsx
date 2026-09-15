import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import React from 'react';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';

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
      gap: vs(8),
    },
    title: {
      fontSize: s(16),
      fontWeight: '700',
      color: theme.colors.text,
    },
    message: {
      fontSize: s(13),
      color: theme.colors.textMuted,
      lineHeight: s(18),
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: s(10),
      marginTop: vs(8),
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
    confirmButton: {
      backgroundColor: theme.colors.accent,
    },
    confirmButtonDestructive: {
      backgroundColor: theme.colors.danger,
    },
    confirmText: {
      fontSize: s(14),
      fontWeight: '600',
      color: theme.colors.background,
    },
  });

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmModal = ({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  const styles = useThemedStyles(makeStyles);
  const theme = useTheme();

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
              <Text style={styles.title}>{title}</Text>
              {message && <Text style={styles.message}>{message}</Text>}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={onCancel}
                  disabled={loading}
                >
                  <Text style={styles.cancelText}>{cancelLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.button,
                    destructive ? styles.confirmButtonDestructive : styles.confirmButton,
                  ]}
                  onPress={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={theme.colors.background} />
                  ) : (
                    <Text style={styles.confirmText}>{confirmLabel}</Text>
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

export default ConfirmModal;
