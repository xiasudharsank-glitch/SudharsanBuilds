// =====================================================
// REMOTE CONTROL API
// Live settings, theme, menus, content blocks, feature flags
// =====================================================

import { supabase } from './supabase';

// =====================================================
// TYPES
// =====================================================

export interface SiteSetting {
  id: string;
  key: string;
  value: any;
  category: 'general' | 'branding' | 'contact' | 'social' | 'seo' | 'advanced';
  label: string;
  description?: string;
  data_type: 'string' | 'number' | 'boolean' | 'json' | 'color' | 'image' | 'url';
  is_public: boolean;
  updated_at: string;
  updated_by?: string;
}

export interface ThemeSetting {
  id: string;
  name: string;
  is_active: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundAlt: string;
    text: string;
    textLight: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    info: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    codeFont: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, string>;
  };
  spacing: {
    container: string;
    sectionPadding: string;
    sectionPaddingMobile: string;
    cardPadding: string;
    gap: Record<string, string>;
  };
  borders?: {
    radius: string;
    width: string;
  };
  effects?: {
    shadow: string;
    transition: string;
  };
}

export interface MenuItem {
  id: string;
  menu_location: 'header' | 'footer' | 'mobile' | 'admin';
  label: string;
  url: string;
  icon?: string;
  parent_id?: string;
  order_index: number;
  is_visible: boolean;
  is_external: boolean;
  open_in_new_tab: boolean;
  required_permission?: string;
  metadata?: Record<string, any>;
}

export interface ContentBlock {
  id: string;
  page_id: string;
  section_id: string;
  block_type: 'text' | 'image' | 'video' | 'gallery' | 'form' | 'custom';
  content: Record<string, any>;
  settings: {
    visible: boolean;
    backgroundColor?: string;
    padding?: string;
    animation?: string;
  };
  order_index: number;
  is_published: boolean;
  version: number;
}

export interface FeatureFlag {
  id: string;
  feature_key: string;
  feature_name: string;
  description?: string;
  is_enabled: boolean;
  rollout_percentage: number;
  conditions?: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface ConfigSnapshot {
  id: string;
  name: string;
  description?: string;
  snapshot_data: Record<string, any>;
  includes: string[];
  created_by: string;
  created_at: string;
  is_auto_backup: boolean;
}

// =====================================================
// SITE SETTINGS API
// =====================================================

/**
 * Get all public site settings as key-value pairs
 */
export async function getPublicSettings(): Promise<Record<string, any>> {
  const { data, error } = await supabase.rpc('get_public_settings');

  if (error) {
    console.error('Error fetching public settings:', error);
    return {};
  }

  return data || {};
}

/**
 * Get all site settings (admin only)
 */
export async function getAllSettings(): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('category, key');

  if (error) {
    console.error('Error fetching settings:', error);
    return [];
  }

  return data || [];
}

/**
 * Get settings by category
 */
export async function getSettingsByCategory(category: string): Promise<SiteSetting[]> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('category', category)
    .order('key');

  if (error) {
    console.error('Error fetching settings by category:', error);
    return [];
  }

  return data || [];
}

/**
 * Get single setting by key
 */
export async function getSetting(key: string): Promise<any> {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single();

  if (error) {
    console.error('Error fetching setting:', error);
    return null;
  }

  return data?.value;
}

/**
 * Update site setting
 */
export async function updateSetting(
  key: string,
  value: any,
  updatedBy: string = 'admin'
): Promise<boolean> {
  const { error } = await supabase
    .from('site_settings')
    .update({
      value,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    })
    .eq('key', key);

  if (error) {
    console.error('Error updating setting:', error);
    return false;
  }

  // Trigger settings refresh event
  window.dispatchEvent(new CustomEvent('settings:updated', { detail: { key, value } }));

  return true;
}

/**
 * Bulk update settings
 */
export async function bulkUpdateSettings(
  updates: Array<{ key: string; value: any }>,
  updatedBy: string = 'admin'
): Promise<boolean> {
  const promises = updates.map(({ key, value }) =>
    updateSetting(key, value, updatedBy)
  );

  const results = await Promise.all(promises);
  return results.every(r => r === true);
}

// =====================================================
// THEME SETTINGS API
// =====================================================

/**
 * Get active theme
 */
export async function getActiveTheme(): Promise<ThemeSetting | null> {
  const { data, error } = await supabase.rpc('get_active_theme');

  if (error) {
    console.error('Error fetching active theme:', error);
    return null;
  }

  return data;
}

/**
 * Get all themes
 */
export async function getAllThemes(): Promise<ThemeSetting[]> {
  const { data, error } = await supabase
    .from('theme_settings')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching themes:', error);
    return [];
  }

  return data || [];
}

/**
 * Update theme
 */
export async function updateTheme(
  themeId: string,
  updates: Partial<ThemeSetting>
): Promise<boolean> {
  const { error } = await supabase
    .from('theme_settings')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', themeId);

  if (error) {
    console.error('Error updating theme:', error);
    return false;
  }

  // Trigger theme refresh event
  window.dispatchEvent(new CustomEvent('theme:updated'));

  return true;
}

/**
 * Activate theme
 */
export async function activateTheme(themeId: string): Promise<boolean> {
  // Deactivate all themes first
  await supabase
    .from('theme_settings')
    .update({ is_active: false });

  // Activate selected theme
  const { error } = await supabase
    .from('theme_settings')
    .update({ is_active: true })
    .eq('id', themeId);

  if (error) {
    console.error('Error activating theme:', error);
    return false;
  }

  // Trigger theme change event
  window.dispatchEvent(new CustomEvent('theme:changed', { detail: { themeId } }));

  return true;
}

/**
 * Create new theme
 */
export async function createTheme(theme: Partial<ThemeSetting>): Promise<string | null> {
  const { data, error } = await supabase
    .from('theme_settings')
    .insert([theme])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating theme:', error);
    return null;
  }

  return data?.id || null;
}

// =====================================================
// MENU MANAGEMENT API
// =====================================================

/**
 * Get menu items by location
 */
export async function getMenuItems(location: string): Promise<MenuItem[]> {
  const { data, error } = await supabase.rpc('get_menu_items', {
    menu_loc: location
  });

  if (error) {
    console.error('Error fetching menu items:', error);
    return [];
  }

  return data || [];
}

/**
 * Create menu item
 */
export async function createMenuItem(menuItem: Partial<MenuItem>): Promise<string | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([menuItem])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating menu item:', error);
    return null;
  }

  // Trigger menu refresh
  window.dispatchEvent(new CustomEvent('menu:updated', { detail: { location: menuItem.menu_location } }));

  return data?.id || null;
}

/**
 * Update menu item
 */
export async function updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<boolean> {
  const { error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Error updating menu item:', error);
    return false;
  }

  // Trigger menu refresh
  window.dispatchEvent(new CustomEvent('menu:updated'));

  return true;
}

/**
 * Delete menu item
 */
export async function deleteMenuItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    return false;
  }

  // Trigger menu refresh
  window.dispatchEvent(new CustomEvent('menu:updated'));

  return true;
}

/**
 * Reorder menu items
 */
export async function reorderMenuItems(
  location: string,
  itemIds: string[]
): Promise<boolean> {
  const updates = itemIds.map((id, index) => ({
    id,
    order_index: index + 1
  }));

  const promises = updates.map(({ id, order_index }) =>
    supabase
      .from('menu_items')
      .update({ order_index })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const hasError = results.some(r => r.error);

  if (hasError) {
    console.error('Error reordering menu items');
    return false;
  }

  // Trigger menu refresh
  window.dispatchEvent(new CustomEvent('menu:updated', { detail: { location } }));

  return true;
}

// =====================================================
// CONTENT BLOCKS API
// =====================================================

/**
 * Get content blocks for a page/section
 */
export async function getContentBlocks(
  pageId: string,
  sectionId?: string
): Promise<ContentBlock[]> {
  let query = supabase
    .from('content_blocks')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_published', true)
    .order('order_index');

  if (sectionId) {
    query = query.eq('section_id', sectionId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching content blocks:', error);
    return [];
  }

  return data || [];
}

/**
 * Create content block
 */
export async function createContentBlock(block: Partial<ContentBlock>): Promise<string | null> {
  const { data, error } = await supabase
    .from('content_blocks')
    .insert([block])
    .select('id')
    .single();

  if (error) {
    console.error('Error creating content block:', error);
    return null;
  }

  // Trigger content refresh
  window.dispatchEvent(new CustomEvent('content:updated', {
    detail: { pageId: block.page_id, sectionId: block.section_id }
  }));

  return data?.id || null;
}

/**
 * Update content block
 */
export async function updateContentBlock(
  id: string,
  updates: Partial<ContentBlock>,
  updatedBy: string = 'admin'
): Promise<boolean> {
  const { error } = await supabase
    .from('content_blocks')
    .update({
      ...updates,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating content block:', error);
    return false;
  }

  // Trigger content refresh
  window.dispatchEvent(new CustomEvent('content:updated'));

  return true;
}

/**
 * Delete content block
 */
export async function deleteContentBlock(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('content_blocks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting content block:', error);
    return false;
  }

  // Trigger content refresh
  window.dispatchEvent(new CustomEvent('content:updated'));

  return true;
}

/**
 * Reorder content blocks
 */
export async function reorderContentBlocks(blockIds: string[]): Promise<boolean> {
  const updates = blockIds.map((id, index) => ({
    id,
    order_index: index + 1
  }));

  const promises = updates.map(({ id, order_index }) =>
    supabase
      .from('content_blocks')
      .update({ order_index })
      .eq('id', id)
  );

  const results = await Promise.all(promises);
  const hasError = results.some(r => r.error);

  if (hasError) {
    console.error('Error reordering content blocks');
    return false;
  }

  // Trigger content refresh
  window.dispatchEvent(new CustomEvent('content:updated'));

  return true;
}

// =====================================================
// FEATURE FLAGS API
// =====================================================

/**
 * Get all feature flags
 */
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  const { data, error } = await supabase
    .from('feature_flags')
    .select('*')
    .order('feature_name');

  if (error) {
    console.error('Error fetching feature flags:', error);
    return [];
  }

  return data || [];
}

/**
 * Check if feature is enabled
 */
export async function isFeatureEnabled(featureKey: string): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_feature_enabled', {
    feature: featureKey
  });

  if (error) {
    console.error('Error checking feature flag:', error);
    return false;
  }

  return data || false;
}

/**
 * Toggle feature flag
 */
export async function toggleFeature(
  featureKey: string,
  enabled: boolean,
  updatedBy: string = 'admin'
): Promise<boolean> {
  const { error } = await supabase
    .from('feature_flags')
    .update({
      is_enabled: enabled,
      updated_by: updatedBy,
      updated_at: new Date().toISOString()
    })
    .eq('feature_key', featureKey);

  if (error) {
    console.error('Error toggling feature:', error);
    return false;
  }

  // Trigger feature flag refresh
  window.dispatchEvent(new CustomEvent('features:updated', { detail: { featureKey, enabled } }));

  return true;
}

/**
 * Update feature rollout percentage
 */
export async function updateFeatureRollout(
  featureKey: string,
  percentage: number
): Promise<boolean> {
  const { error } = await supabase
    .from('feature_flags')
    .update({
      rollout_percentage: Math.max(0, Math.min(100, percentage)),
      updated_at: new Date().toISOString()
    })
    .eq('feature_key', featureKey);

  if (error) {
    console.error('Error updating feature rollout:', error);
    return false;
  }

  return true;
}

// =====================================================
// CONFIG SNAPSHOTS API
// =====================================================

/**
 * Create configuration snapshot
 */
export async function createSnapshot(
  name: string,
  description: string = '',
  createdBy: string = 'admin'
): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_config_snapshot', {
    snapshot_name: name,
    snapshot_description: description,
    created_by_user: createdBy
  });

  if (error) {
    console.error('Error creating snapshot:', error);
    return null;
  }

  return data;
}

/**
 * Get all snapshots
 */
export async function getSnapshots(): Promise<ConfigSnapshot[]> {
  const { data, error } = await supabase
    .from('config_snapshots')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching snapshots:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete snapshot
 */
export async function deleteSnapshot(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('config_snapshots')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting snapshot:', error);
    return false;
  }

  return true;
}

/**
 * Export configuration as JSON
 */
export async function exportConfiguration(): Promise<string> {
  const [settings, themes, menus, flags] = await Promise.all([
    getAllSettings(),
    getAllThemes(),
    getMenuItems('header'),
    getFeatureFlags()
  ]);

  const config = {
    version: '1.0.0',
    exported_at: new Date().toISOString(),
    data: {
      site_settings: settings,
      theme_settings: themes,
      menu_items: menus,
      feature_flags: flags
    }
  };

  return JSON.stringify(config, null, 2);
}

/**
 * Download configuration as file
 */
export function downloadConfiguration() {
  exportConfiguration().then(json => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

// =====================================================
// REAL-TIME UPDATES
// =====================================================

/**
 * Subscribe to settings changes
 */
export function subscribeToSettings(callback: (payload: any) => void) {
  const channel = supabase
    .channel('settings-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'site_settings'
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to theme changes
 */
export function subscribeToTheme(callback: (payload: any) => void) {
  const channel = supabase
    .channel('theme-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'theme_settings'
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to menu changes
 */
export function subscribeToMenu(callback: (payload: any) => void) {
  const channel = supabase
    .channel('menu-changes')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'menu_items'
    }, callback)
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
