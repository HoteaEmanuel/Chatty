import { Animated, StyleSheet, View } from 'react-native';
import React, { useEffect, useRef } from 'react';
import { s, vs } from 'react-native-size-matters';
import { useThemedStyles } from '../theme';
import type { Theme } from '../theme';

// Alternating left/right placeholder bubbles at varying widths, just enough
// to read as "a conversation is about to appear" rather than mimicking any
// real message shape.
const ROWS: { align: 'flex-start' | 'flex-end'; width: `${number}%` }[] = [
  { align: 'flex-end', width: '55%' },
  { align: 'flex-start', width: '72%' },
  { align: 'flex-start', width: '40%' },
  { align: 'flex-end', width: '45%' },
  { align: 'flex-start', width: '65%' },
];

const ChatSkeleton = () => {
  const styles = useThemedStyles(makeStyles);
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, index) => (
        <View
          key={index}
          style={[
            styles.row,
            { justifyContent: row.align === 'flex-end' ? 'flex-end' : 'flex-start' },
          ]}
        >
          <Animated.View
            style={[styles.bubble, { width: row.width, opacity }]}
          />
        </View>
      ))}
    </View>
  );
};

export default ChatSkeleton;

const makeStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: s(10),
      gap: vs(14),
    },
    row: {
      flexDirection: 'row',
    },
    bubble: {
      height: vs(38),
      borderRadius: s(20),
      backgroundColor: theme.colors.border,
    },
  });
