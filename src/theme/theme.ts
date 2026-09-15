export type ThemeColors = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textMuted: string;
  userBubble: string;
  userBubbleText: string;
  assistantBubble: string;
  assistantBubbleText: string;
  accent: string;
  danger: string;
  headerBackground: string;
  headerText: string;
  inputBackground: string;
  placeholder: string;
};

export type Theme = {
  dark: boolean;
  colors: ThemeColors;
};

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    border: '#E2E2E5',
    text: '#0B0B0C',
    textMuted: '#6B6B70',
    userBubble: '#000000',
    userBubbleText: '#FFFFFF',
    assistantBubble: '#E8E8E8',
    assistantBubbleText: '#0B0B0C',
    accent: '#47CB00',
    danger: '#D93025',
    headerBackground: '#000000',
    headerText: '#FFFFFF',
    inputBackground: '#F5F5F5',
    placeholder: '#9A9AA0',
  },
};

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: '#0F0F11',
    surface: '#1A1A1D',
    border: '#2A2A2E',
    text: '#ECECEE',
    textMuted: '#9A9AA0',
    userBubble: '#EDEDED',
    userBubbleText: '#0B0B0C',
    assistantBubble: '#1E1E22',
    assistantBubbleText: '#ECECEE',
    accent: '#5CE600',
    danger: '#FF6B5E',
    headerBackground: '#000000',
    headerText: '#FFFFFF',
    inputBackground: '#1A1A1D',
    placeholder: '#7A7A80',
  },
};
