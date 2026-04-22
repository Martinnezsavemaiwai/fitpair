import React from 'react';
import { Text, View } from 'react-native';

interface TagProps {
  label: string;
  color?: string;
  bg?: string;
}

export const Tag = ({ label, color = '#6366F1', bg }: TagProps) => (
  <View
    style={{
      backgroundColor: bg ?? color + '18',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    }}
  >
    <Text
      style={{
        fontSize: 11,
        color,
        fontWeight: '600',
        letterSpacing: 0.2,
      }}
    >
      {label}
    </Text>
  </View>
);
