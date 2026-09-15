import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import Clipboard from '@react-native-clipboard/clipboard';
import Feather from 'react-native-vector-icons/Feather';
import { EnrichedMarkdownText } from 'react-native-enriched-markdown';
import type { MarkdownStyle } from 'react-native-enriched-markdown';
import { s, vs } from 'react-native-size-matters';
import { useTheme, useThemedStyles } from '../theme';
import type { Theme } from '../theme';

const monospaceFont = Platform.select({ ios: 'Menlo', default: 'monospace' });

interface ResponseMessageCardProps {
  message: string;
}
const ResponseMessageCard = ({ message }: ResponseMessageCardProps) => {
  const styles = useThemedStyles(makeStyles);
  const markdownStyle = useThemedStyles(makeMarkdownStyle);
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    Clipboard.setString(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.messageContainer}>
        <EnrichedMarkdownText
          markdown={message}
          flavor="github"
          markdownStyle={markdownStyle}
        />
      </View>
      <TouchableOpacity
        style={styles.copyButton}
        onPress={handleCopy}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityRole="button"
        accessibilityLabel={copied ? 'Copied' : 'Copy response'}
      >
        <Feather
          name={copied ? 'check' : 'copy'}
          size={13}
          color={theme.colors.textMuted}
        />
        <Text style={styles.copyText}>{copied ? 'Copied' : 'Copy'}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ResponseMessageCard;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      alignItems: 'flex-start',
      marginVertical: vs(4),
      marginHorizontal: s(8),
      marginBottom: vs(12),
    },
    messageContainer: {
      backgroundColor: theme.colors.assistantBubble,
      borderRadius: s(20),
      maxWidth: '88%',
      padding: s(12),
    },
    copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      marginTop: vs(4),
      paddingHorizontal: s(6),
      paddingVertical: vs(2),
    },
    copyText: {
      fontSize: s(11),
      color: theme.colors.textMuted,
    },
  });

const makeMarkdownStyle = (theme: Theme): MarkdownStyle => ({
  paragraph: {
    fontSize: s(14),
    lineHeight: s(20),
    color: theme.colors.assistantBubbleText,
  },
  h1: {
    fontSize: s(21),
    fontWeight: '700',
    color: theme.colors.assistantBubbleText,
    marginTop: vs(8),
    marginBottom: vs(6),
  },
  h2: {
    fontSize: s(19),
    fontWeight: '700',
    color: theme.colors.assistantBubbleText,
    marginTop: vs(8),
    marginBottom: vs(5),
  },
  h3: {
    fontSize: s(17),
    fontWeight: '600',
    color: theme.colors.assistantBubbleText,
    marginTop: vs(6),
    marginBottom: vs(4),
  },
  h4: {
    fontSize: s(15),
    fontWeight: '600',
    color: theme.colors.assistantBubbleText,
  },
  h5: {
    fontSize: s(14),
    fontWeight: '600',
    color: theme.colors.assistantBubbleText,
  },
  h6: {
    fontSize: s(13),
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  strong: {
    color: theme.colors.assistantBubbleText,
  },
  em: {
    color: theme.colors.assistantBubbleText,
  },
  link: {
    color: theme.colors.accent,
    underline: true,
  },
  code: {
    fontFamily: monospaceFont,
    fontSize: s(13),
    color: theme.colors.accent,
    backgroundColor: theme.dark ? '#FFFFFF1A' : '#0000000F',
  },
  codeBlock: {
    fontFamily: monospaceFont,
    fontSize: s(13),
    color: theme.colors.assistantBubbleText,
    backgroundColor: theme.dark ? '#00000066' : '#00000008',
    borderRadius: s(10),
    padding: s(10),
    marginTop: vs(6),
    marginBottom: vs(6),
  },
  blockquote: {
    borderColor: theme.colors.border,
    borderWidth: 3,
    backgroundColor: 'transparent',
    color: theme.colors.textMuted,
  },
  list: {
    color: theme.colors.assistantBubbleText,
    bulletColor: theme.colors.textMuted,
    markerColor: theme.colors.textMuted,
  },
  table: {
    borderColor: theme.colors.border,
    borderWidth: StyleSheet.hairlineWidth,
    headerBackgroundColor: theme.colors.surface,
    headerTextColor: theme.colors.text,
    rowOddBackgroundColor: theme.dark ? '#FFFFFF08' : '#00000004',
    rowEvenBackgroundColor: 'transparent',
  },
  thematicBreak: {
    color: theme.colors.border,
  },
});
