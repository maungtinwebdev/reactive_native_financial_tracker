import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  loading?: boolean;
}

export function Button({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  textStyle,
  disabled = false,
  loading = false
}: ButtonProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';

  const getBackgroundColor = () => {
    if (disabled) return theme === 'dark' ? '#374151' : '#e5e7eb';
    switch (variant) {
      case 'primary': return Colors[theme].tint;
      case 'secondary': return Colors[theme].tabIconDefault;
      case 'danger': return Colors[theme].danger;
      case 'outline': return 'transparent';
      default: return Colors[theme].tint;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme === 'dark' ? '#9ca3af' : '#9ca3af';
    if (variant === 'outline') return Colors[theme].text;
    if (variant === 'primary' && theme === 'dark') return Colors.light.tint;
    return '#fff';
  };

  return (
    <TouchableOpacity 
      style={[
        styles.button, 
        { backgroundColor: getBackgroundColor() },
        variant === 'outline' && { borderWidth: 1, borderColor: Colors[theme].border },
        style
      ]} 
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});
