import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkTheme, lightTheme, type Theme } from './theme';

export type ThemeMode = 'light' | 'dark';

const THEME_MODE_STORAGE_KEY = 'theme-mode';

const ThemeContext = createContext<Theme>(lightTheme);

type ThemeModeContextValue = {
  // `null` means no explicit override is set yet - falls back to the OS
  // scheme until the user picks one (or AsyncStorage finishes loading).
  themeMode: ThemeMode | null;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue>({
  themeMode: null,
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const scheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(THEME_MODE_STORAGE_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark') setThemeModeState(stored);
    });
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_MODE_STORAGE_KEY, mode).catch(() => {});
  };

  const theme = useMemo(() => {
    const isDark = themeMode ? themeMode === 'dark' : scheme === 'dark';
    return isDark ? darkTheme : lightTheme;
  }, [themeMode, scheme]);

  const modeValue = useMemo(
    () => ({ themeMode, setThemeMode }),
    [themeMode],
  );

  return (
    <ThemeContext.Provider value={theme}>
      <ThemeModeContext.Provider value={modeValue}>
        {children}
      </ThemeModeContext.Provider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useThemeMode = () => useContext(ThemeModeContext);

// `factory` must be declared at module scope so its identity is stable.
export function useThemedStyles<T>(factory: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => factory(theme), [factory, theme]);
}
