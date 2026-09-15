import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React, { useEffect, useState } from 'react';

interface TypingEffectProps {
  text: string;
  style?: TextStyle;
}
const TypingEffect = ({ text, style }: TypingEffectProps) => {
  const words = text?.split(' ');

  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = -1;
    const interval = setInterval(() => {
      console.log('INDEX: ', index);
      if (index < words?.length - 1) {
        setDisplayedText(prev =>
          prev ? prev + ' ' + words[index] : words[index],
        );
        index++;
      } else clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, [text]);
  return <Text style={style}>{displayedText}</Text>;
};

export default TypingEffect;

const styles = StyleSheet.create({});
