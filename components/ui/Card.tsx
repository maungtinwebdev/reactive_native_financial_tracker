import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const colorScheme = useColorScheme();
  const theme = colorScheme ?? 'light';
  
  return (
    <View style={[
      styles.card, 
      { 
        backgroundColor: Colors[theme].card,
        shadowColor: theme === 'dark' ? '#000' : '#000',
        shadowOpacity: theme === 'dark' ? 0.3 : 0.1,
      }, 
      style
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    marginVertical: 8,
  },
});
