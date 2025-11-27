import { useState, useEffect } from 'react';
import {
  getPublicSettings,
  getActiveTheme,
  getFeatureFlags,
  isFeatureEnabled,
  subscribeToSettings,
  subscribeToTheme,
  type ThemeSetting
} from '../utils/remoteControlApi';

// =====================================================
// USE SETTINGS HOOK
// Access site settings throughout the app
// =====================================================

export function useSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToSettings(() => {
      loadSettings();
    });

    // Listen for custom update events
    const handleUpdate = (e: CustomEvent) => {
      setSettings(prev => ({
        ...prev,
        [e.detail.key]: e.detail.value
      }));
    };

    window.addEventListener('settings:updated' as any, handleUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('settings:updated' as any, handleUpdate);
    };
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    const data = await getPublicSettings();
    setSettings(data);
    setLoading(false);
  };

  const get = (key: string, defaultValue: any = null) => {
    return settings[key] ?? defaultValue;
  };

  return {
    settings,
    loading,
    get,
    refresh: loadSettings
  };
}

// =====================================================
// USE THEME HOOK
// Access active theme settings
// =====================================================

export function useTheme() {
  const [theme, setTheme] = useState<ThemeSetting | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTheme(() => {
      loadTheme();
    });

    // Listen for custom theme events
    const handleThemeUpdate = () => {
      loadTheme();
    };

    window.addEventListener('theme:updated', handleThemeUpdate);
    window.addEventListener('theme:changed', handleThemeUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener('theme:updated', handleThemeUpdate);
      window.removeEventListener('theme:changed', handleThemeUpdate);
    };
  }, []);

  const loadTheme = async () => {
    setLoading(true);
    const data = await getActiveTheme();
    setTheme(data);
    setLoading(false);

    // Apply theme to document
    if (data) {
      applyTheme(data);
    }
  };

  const applyTheme = (theme: ThemeSetting) => {
    const root = document.documentElement;

    // Apply colors as CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-heading', theme.typography.headingFont);
    root.style.setProperty('--font-body', theme.typography.bodyFont);
    if (theme.typography.codeFont) {
      root.style.setProperty('--font-code', theme.typography.codeFont);
    }

    // Apply spacing
    root.style.setProperty('--container-width', theme.spacing.container);
    root.style.setProperty('--section-padding', theme.spacing.sectionPadding);
  };

  return {
    theme,
    loading,
    refresh: loadTheme
  };
}

// =====================================================
// USE FEATURE FLAG HOOK
// Check if a feature is enabled
// =====================================================

export function useFeatureFlag(featureKey: string): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    checkFeature();

    // Listen for feature updates
    const handleUpdate = (e: CustomEvent) => {
      if (e.detail.featureKey === featureKey) {
        setEnabled(e.detail.enabled);
      }
    };

    window.addEventListener('features:updated' as any, handleUpdate);

    return () => {
      window.removeEventListener('features:updated' as any, handleUpdate);
    };
  }, [featureKey]);

  const checkFeature = async () => {
    const result = await isFeatureEnabled(featureKey);
    setEnabled(result);
  };

  return enabled;
}

// =====================================================
// USE ALL FEATURES HOOK
// Get all feature flags
// =====================================================

export function useFeatures() {
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeatures();

    // Listen for feature updates
    const handleUpdate = (e: CustomEvent) => {
      setFeatures(prev => ({
        ...prev,
        [e.detail.featureKey]: e.detail.enabled
      }));
    };

    window.addEventListener('features:updated' as any, handleUpdate);

    return () => {
      window.removeEventListener('features:updated' as any, handleUpdate);
    };
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    const data = await getFeatureFlags();
    const flagsMap = data.reduce((acc, flag) => ({
      ...acc,
      [flag.feature_key]: flag.is_enabled
    }), {});
    setFeatures(flagsMap);
    setLoading(false);
  };

  const isEnabled = (featureKey: string): boolean => {
    return features[featureKey] ?? false;
  };

  return {
    features,
    loading,
    isEnabled,
    refresh: loadFeatures
  };
}
