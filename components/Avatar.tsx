import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { colors, typography, borderRadius } from '../constants/theme';

export type AvatarSize = 'small' | 'medium' | 'large' | 'xlarge';

interface AvatarProps {
  size?: AvatarSize;
  source?: ImageSourcePropType;
  name?: string;
  backgroundColor?: string;
  textColor?: string;
  style?: ViewStyle;
}

const sizeMap = {
  small: 32,
  medium: 48,
  large: 64,
  xlarge: 96,
};

const fontSizeMap = {
  small: typography.sizes.sm,
  medium: typography.sizes.base,
  large: typography.sizes.xl,
  xlarge: typography.sizes['3xl'],
};

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const Avatar: React.FC<AvatarProps> = ({
  size = 'medium',
  source,
  name,
  backgroundColor = colors.accent,
  textColor = colors.surface,
  style,
}) => {
  const dimension = sizeMap[size];
  const fontSize = fontSizeMap[size];

  const containerStyles = [
    styles.container,
    {
      width: dimension,
      height: dimension,
      borderRadius: dimension / 2,
      backgroundColor,
    },
    style,
  ];

  if (source) {
    return (
      <View style={containerStyles}>
        <Image
          source={source}
          style={[
            styles.image,
            {
              width: dimension,
              height: dimension,
              borderRadius: dimension / 2,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View style={containerStyles}>
      <Text style={[styles.text, { fontSize, color: textColor }]}>
        {name ? getInitials(name) : '?'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  text: {
    fontWeight: typography.weights.semibold,
  },
});
