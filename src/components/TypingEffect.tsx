import { StyleSheet, Text, TextStyle, View } from 'react-native';
import React, { useEffect, useState } from 'react';

interface TypingEffectProps {
  text: string;
  style?: TextStyle;
}
const TypingEffect = ({ text, style }: TypingEffectProps) => {
  const words = text.split(' ');
  console.log('SPLITED TEXT: ', words);
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      console.log('INDEX: ', index);
      if (index < words.length - 1) {
        setDisplayedText(prev => prev + ' ' + words[index]);
        index++;
      } else clearInterval(interval);
    }, 500);

    return () => clearInterval(interval);
  }, [text]);
  return <Text style={style}>{displayedText}</Text>;
};

export default TypingEffect;

const styles = StyleSheet.create({});
