import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { DS } from '@/constants/DS';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  shadow?: 'sm' | 'md' | 'lg' | 'none';
  padding?: number;
}

export const Card = ({ children, style, shadow = 'sm', padding = DS.spacing.lg }: CardProps) => {
  const shadowStyle = shadow !== 'none' ? DS.shadow[shadow] : {};
  return (
    <View
      style={[
        {
          backgroundColor: DS.colors.card,
          borderRadius: DS.radius.lg,
          padding,
          borderWidth: 1,
          borderColor: DS.colors.border,
          ...shadowStyle,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
