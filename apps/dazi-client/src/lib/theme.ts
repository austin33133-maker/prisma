import { useColorScheme } from 'react-native'

export interface ThemeColors {
  background: string
  card: string
  text: string
  textSecondary: string
  border: string
  primary: string
  onPrimary: string
  chip: string
  chipSelected: string
  bubbleMine: string
  bubbleOther: string
}

export const Colors: { light: ThemeColors; dark: ThemeColors } = {
  light: {
    background: '#FFFFFF',
    card: '#F5F5F7',
    text: '#111114',
    textSecondary: '#65676E',
    border: '#E6E6EA',
    primary: '#FF4F5E',
    onPrimary: '#FFFFFF',
    chip: '#F0F0F3',
    chipSelected: '#FF4F5E',
    bubbleMine: '#FF4F5E',
    bubbleOther: '#F0F0F3',
  },
  dark: {
    background: '#0E0E11',
    card: '#1B1B20',
    text: '#F4F4F6',
    textSecondary: '#9B9CA3',
    border: '#2A2A31',
    primary: '#FF5F6D',
    onPrimary: '#FFFFFF',
    chip: '#232329',
    chipSelected: '#FF5F6D',
    bubbleMine: '#FF5F6D',
    bubbleOther: '#232329',
  },
}

export function useTheme(): ThemeColors {
  return useColorScheme() === 'dark' ? Colors.dark : Colors.light
}
