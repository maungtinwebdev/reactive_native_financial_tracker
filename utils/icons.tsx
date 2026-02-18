import React from 'react';
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Home, Zap, Car, Utensils } from 'lucide-react-native';

export const getCategoryIcon = (category: string, color: string) => {
  switch (category.toLowerCase()) {
    case 'shopping': return <ShoppingBag size={24} color={color} />;
    case 'food': return <Coffee size={24} color={color} />;
    case 'housing': return <Home size={24} color={color} />;
    case 'utilities': return <Zap size={24} color={color} />;
    case 'transport': return <Car size={24} color={color} />;
    case 'dining': return <Utensils size={24} color={color} />;
    case 'salary': return <ArrowDownLeft size={24} color={color} />;
    case 'investment': return <ArrowUpRight size={24} color={color} />;
    default: return <ShoppingBag size={24} color={color} />;
  }
};
