import React from 'react';
import { Image, type ImageProps } from 'react-native';

export type AppIconProps = Omit<ImageProps, 'source'> & {
  size?: number;
};

const AppIcon = ({ size = 48, style, ...props }: AppIconProps) => {
  return (
    <Image
      accessibilityLabel="Chatty app icon"
      resizeMode="contain"
      {...props}
      source={require('../assets/splash.png')}
      style={[{ width: size, height: size }, style]}
    />
  );
};

export default AppIcon;
