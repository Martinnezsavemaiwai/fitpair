import React from 'react';
import { Pressable, Text, ViewStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DS } from '@/constants/DS';

type BtnVariant = 'primary' | 'outline' | 'ghost' | 'gradient';

interface BtnProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: BtnVariant;
  color?: string;
  gradient?: [string, string];
  small?: boolean;
  full?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export const Btn = ({
  children,
  onPress,
  variant = 'primary',
  color = DS.colors.primary,
  gradient = DS.gradients.primary,
  small = false,
  full = false,
  style,
  disabled = false,
  loading = false,
}: BtnProps) => {
  const py = small ? 10 : 15;
  const px = small ? 18 : 24;
  const radius = small ? DS.radius.sm : DS.radius.md;
  const fontSize = small ? 13 : 15;

  const baseStyle: ViewStyle = {
    paddingVertical: py,
    paddingHorizontal: px,
    borderRadius: radius,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    width: full ? '100%' : undefined,
    overflow: 'hidden',
    ...style,
  };

  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [baseStyle, { opacity: pressed || disabled ? 0.75 : 1 }]}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            ...baseStyle,
            width: '100%',
            margin: 0,
            paddingVertical: py,
            paddingHorizontal: px,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={{ color: '#fff', fontSize, fontWeight: '700', letterSpacing: 0.2 }}>
              {children}
            </Text>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const bgMap: Record<string, string> = {
    primary: color,
    outline: 'transparent',
    ghost: color + '14',
  };

  const textColorMap: Record<string, string> = {
    primary: '#fff',
    outline: color,
    ghost: color,
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        baseStyle,
        {
          backgroundColor: bgMap[variant],
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? color + '60' : 'transparent',
          opacity: pressed || disabled ? 0.72 : 1,
          ...DS.shadow.sm,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColorMap[variant]} size="small" />
      ) : (
        <Text
          style={{
            color: textColorMap[variant],
            fontSize,
            fontWeight: '700',
            letterSpacing: 0.2,
          }}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
};
