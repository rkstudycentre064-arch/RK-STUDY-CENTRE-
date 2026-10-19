import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AppTheme } from '../types';
import {
  getOwnerSettings,
  saveOwnerSettings,
  applyThemeToDOM,
  DEFAULT_SETTINGS,
  type OwnerSettingsData,
} from '../services/settingsService';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: OwnerSettingsData;
  isLoading: boolean;
  theme: AppTheme;
  setTheme: (theme: AppTheme) => Promise<void>;
  updateGlobalSettings: (partial: Partial<OwnerSettingsData>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, isOwner } = useAuth();
  const [settings, setSettings] = useState<OwnerSettingsData>(() => {
    let initialTheme: AppTheme = 'light';
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('rk_theme') as AppTheme | null;
        if (saved === 'dark' || saved === 'light' || saved === 'system') {
          initialTheme = saved;
          applyThemeToDOM(saved);
        }
      } catch {}
    }
    return {
      ...DEFAULT_SETTINGS,
      theme: initialTheme,
    };
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSettings = async () => {
    try {
      const data = await getOwnerSettings();
      let activeTheme = data.theme || 'light';
      if (typeof window !== 'undefined') {
        try {
          const localTheme = localStorage.getItem('rk_theme') as AppTheme | null;
          if (localTheme === 'dark' || localTheme === 'light' || localTheme === 'system') {
            activeTheme = localTheme;
          }
        } catch {}
      }
      setSettings({
        ...data,
        theme: activeTheme,
      });
      applyThemeToDOM(activeTheme);
    } catch (error) {
      console.warn('[SettingsProvider] Failed to load global settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // Listen for storage events (e.g. changes in another tab)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'rk_theme' && e.newValue) {
        const newTheme = e.newValue as AppTheme;
        setSettings((prev) => ({ ...prev, theme: newTheme }));
        applyThemeToDOM(newTheme);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Listen for system theme changes if theme is set to 'system'
  useEffect(() => {
    if (typeof window === 'undefined' || settings.theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      applyThemeToDOM('system');
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [settings.theme]);

  const setTheme = async (newTheme: AppTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rk_theme', newTheme);
      } catch {}
      applyThemeToDOM(newTheme);
    }
    if (isOwner) {
      try {
        await saveOwnerSettings({ theme: newTheme }, user?.email || undefined);
      } catch (err) {
        console.warn('[SettingsProvider] Failed to persist theme to Firestore:', err);
      }
    }
  };

  const updateGlobalSettings = async (partial: Partial<OwnerSettingsData>) => {
    const updated = { ...settings, ...partial };
    setSettings(updated);
    if (partial.theme) {
      applyThemeToDOM(partial.theme);
      if (typeof window !== 'undefined') {
        localStorage.setItem('rk_theme', partial.theme);
      }
    }
    await saveOwnerSettings(partial, user?.email || undefined);
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        isLoading,
        theme: settings.theme,
        setTheme,
        updateGlobalSettings,
        refreshSettings: loadSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    // Fallback safe dummy context if used outside provider
    return {
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      theme: 'light' as AppTheme,
      setTheme: async () => {},
      updateGlobalSettings: async () => {},
      refreshSettings: async () => {},
    };
  }
  return context;
}
