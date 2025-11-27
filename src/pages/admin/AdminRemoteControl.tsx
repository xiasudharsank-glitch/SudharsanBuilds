import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Palette, Menu, Layout, ToggleLeft, Save, Download, Upload,
  RefreshCw, Check, X, Eye, Code, Globe, Zap
} from 'lucide-react';
import {
  getAllSettings, updateSetting, bulkUpdateSettings,
  getActiveTheme, updateTheme, activateTheme, getAllThemes,
  getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems,
  getFeatureFlags, toggleFeature, updateFeatureRollout,
  createSnapshot, downloadConfiguration,
  subscribeToSettings, subscribeToTheme, subscribeToMenu,
  type SiteSetting, type ThemeSetting, type MenuItem as MenuItemType, type FeatureFlag
} from '../../utils/remoteControlApi';

type TabType = 'site' | 'theme' | 'menu' | 'features' | 'backup';

export default function AdminRemoteControl() {
  const [activeTab, setActiveTab] = useState<TabType>('site');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Site Settings
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [settingsEdits, setSettingsEdits] = useState<Record<string, any>>({});

  // Theme Settings
  const [activeTheme, setActiveTheme] = useState<ThemeSetting | null>(null);
  const [allThemes, setAllThemes] = useState<ThemeSetting[]>([]);
  const [themeEdits, setThemeEdits] = useState<Partial<ThemeSetting>>({});

  // Menu Items
  const [menuItems, setMenuItems] = useState<MenuItemType[]>([]);
  const [menuLocation, setMenuLocation] = useState<string>('header');

  // Feature Flags
  const [features, setFeatures] = useState<FeatureFlag[]>([]);

  // Load data
  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubSettings = subscribeToSettings(() => loadSettings());
    const unsubTheme = subscribeToTheme(() => loadThemes());
    const unsubMenu = subscribeToMenu(() => loadMenuItems());

    return () => {
      unsubSettings();
      unsubTheme();
      unsubMenu();
    };
  }, []);

  useEffect(() => {
    if (menuLocation) {
      loadMenuItems();
    }
  }, [menuLocation]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadSettings(),
      loadThemes(),
      loadMenuItems(),
      loadFeatures()
    ]);
    setLoading(false);
  };

  const loadSettings = async () => {
    const data = await getAllSettings();
    setSettings(data);
  };

  const loadThemes = async () => {
    const [active, all] = await Promise.all([
      getActiveTheme(),
      getAllThemes()
    ]);
    setActiveTheme(active);
    setAllThemes(all);
  };

  const loadMenuItems = async () => {
    const data = await getMenuItems(menuLocation);
    setMenuItems(data);
  };

  const loadFeatures = async () => {
    const data = await getFeatureFlags();
    setFeatures(data);
  };

  // Save handlers
  const handleSaveSettings = async () => {
    setSaving(true);
    const updates = Object.entries(settingsEdits).map(([key, value]) => ({
      key,
      value
    }));

    const success = await bulkUpdateSettings(updates);

    if (success) {
      setSettingsEdits({});
      await loadSettings();
    }

    setSaving(false);
  };

  const handleSaveTheme = async () => {
    if (!activeTheme) return;

    setSaving(true);
    const success = await updateTheme(activeTheme.id, themeEdits);

    if (success) {
      setThemeEdits({});
      await loadThemes();
    }

    setSaving(false);
  };

  const handleToggleFeature = async (featureKey: string, enabled: boolean) => {
    await toggleFeature(featureKey, enabled);
    await loadFeatures();
  };

  const handleCreateSnapshot = async () => {
    const name = `Manual Backup ${new Date().toLocaleString()}`;
    await createSnapshot(name, 'Manual configuration backup');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Zap className="w-10 h-10 text-cyan-500" />
              Remote Control
            </h1>
            <p className="text-slate-600 mt-2">
              Manage your entire website from here - change anything instantly
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleCreateSnapshot}
              className="px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Backup
            </button>
            <button
              onClick={downloadConfiguration}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'site', label: 'Site Settings', icon: Settings },
            { id: 'theme', label: 'Theme', icon: Palette },
            { id: 'menu', label: 'Menus', icon: Menu },
            { id: 'features', label: 'Features', icon: ToggleLeft },
            { id: 'backup', label: 'Backup/Restore', icon: Upload }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                  : 'bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'site' && (
            <SiteSettingsPanel
              settings={settings}
              edits={settingsEdits}
              onEdit={setSettingsEdits}
              onSave={handleSaveSettings}
              saving={saving}
            />
          )}

          {activeTab === 'theme' && (
            <ThemePanel
              theme={activeTheme}
              allThemes={allThemes}
              edits={themeEdits}
              onEdit={setThemeEdits}
              onSave={handleSaveTheme}
              onActivate={async (id) => {
                await activateTheme(id);
                await loadThemes();
              }}
              saving={saving}
            />
          )}

          {activeTab === 'menu' && (
            <MenuPanel
              menuItems={menuItems}
              location={menuLocation}
              onLocationChange={setMenuLocation}
              onReload={loadMenuItems}
            />
          )}

          {activeTab === 'features' && (
            <FeaturesPanel
              features={features}
              onToggle={handleToggleFeature}
            />
          )}

          {activeTab === 'backup' && (
            <BackupPanel />
          )}
        </motion.div>
      </div>
    </div>
  );
}

// =====================================================
// SITE SETTINGS PANEL
// =====================================================

function SiteSettingsPanel({
  settings,
  edits,
  onEdit,
  onSave,
  saving
}: {
  settings: SiteSetting[];
  edits: Record<string, any>;
  onEdit: (edits: Record<string, any>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  const categories = Array.from(new Set(settings.map(s => s.category)));
  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {hasChanges && (
        <div className="mb-6 p-4 bg-cyan-50 border border-cyan-200 rounded-lg flex items-center justify-between">
          <p className="text-cyan-800">You have unsaved changes</p>
          <div className="flex gap-2">
            <button
              onClick={() => onEdit({})}
              className="px-4 py-2 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save Changes
            </button>
          </div>
        </div>
      )}

      {categories.map(category => (
        <div key={category} className="mb-8 last:mb-0">
          <h3 className="text-xl font-semibold text-slate-900 mb-4 capitalize">
            {category}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {settings
              .filter(s => s.category === category)
              .map(setting => (
                <div key={setting.id} className="p-4 border border-slate-200 rounded-lg">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    {setting.label}
                    {setting.description && (
                      <span className="block text-xs text-slate-500 mt-1">
                        {setting.description}
                      </span>
                    )}
                  </label>

                  {setting.data_type === 'boolean' ? (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={edits[setting.key] ?? setting.value}
                        onChange={(e) =>
                          onEdit({ ...edits, [setting.key]: e.target.checked })
                        }
                        className="w-4 h-4 text-cyan-600"
                      />
                      <span className="text-sm text-slate-600">Enabled</span>
                    </label>
                  ) : setting.data_type === 'color' ? (
                    <input
                      type="color"
                      value={edits[setting.key] ?? setting.value}
                      onChange={(e) =>
                        onEdit({ ...edits, [setting.key]: e.target.value })
                      }
                      className="w-20 h-10 rounded border border-slate-300"
                    />
                  ) : setting.data_type === 'number' ? (
                    <input
                      type="number"
                      value={edits[setting.key] ?? setting.value}
                      onChange={(e) =>
                        onEdit({ ...edits, [setting.key]: parseFloat(e.target.value) })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={edits[setting.key] ?? setting.value}
                      onChange={(e) =>
                        onEdit({ ...edits, [setting.key]: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500"
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// =====================================================
// THEME PANEL
// =====================================================

function ThemePanel({
  theme,
  allThemes,
  edits,
  onEdit,
  onSave,
  onActivate,
  saving
}: {
  theme: ThemeSetting | null;
  allThemes: ThemeSetting[];
  edits: Partial<ThemeSetting>;
  onEdit: (edits: Partial<ThemeSetting>) => void;
  onSave: () => void;
  onActivate: (id: string) => void;
  saving: boolean;
}) {
  if (!theme) return <div>No active theme</div>;

  const colors = edits.colors || theme.colors;
  const hasChanges = Object.keys(edits).length > 0;

  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      {/* Theme Selector */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Active Theme</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {allThemes.map(t => (
            <button
              key={t.id}
              onClick={() => onActivate(t.id)}
              className={`p-4 rounded-lg border-2 transition ${
                t.is_active
                  ? 'border-cyan-500 bg-cyan-50'
                  : 'border-slate-200 hover:border-cyan-300'
              }`}
            >
              <div className="font-medium text-slate-900">{t.name}</div>
              {t.is_active && (
                <div className="text-xs text-cyan-600 mt-1">Active</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Editor */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-slate-900 mb-4">Colors</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="p-4 border border-slate-200 rounded-lg">
              <label className="block text-sm font-medium text-slate-700 mb-2 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={value}
                  onChange={(e) =>
                    onEdit({
                      ...edits,
                      colors: { ...colors, [key]: e.target.value }
                    })
                  }
                  className="w-12 h-12 rounded border border-slate-300"
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) =>
                    onEdit({
                      ...edits,
                      colors: { ...colors, [key]: e.target.value }
                    })
                  }
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {hasChanges && (
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => onEdit({})}
            className="px-6 py-3 bg-white text-slate-600 rounded-lg hover:bg-slate-50 transition flex items-center gap-2 border border-slate-300"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4" />
            )}
            Save Theme
          </button>
        </div>
      )}
    </div>
  );
}

// =====================================================
// MENU PANEL
// =====================================================

function MenuPanel({
  menuItems,
  location,
  onLocationChange,
  onReload
}: {
  menuItems: MenuItemType[];
  location: string;
  onLocationChange: (location: string) => void;
  onReload: () => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <select
          value={location}
          onChange={(e) => onLocationChange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-lg"
        >
          <option value="header">Header Menu</option>
          <option value="footer">Footer Menu</option>
          <option value="mobile">Mobile Menu</option>
          <option value="admin">Admin Menu</option>
        </select>

        <button
          onClick={onReload}
          className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Reload
        </button>
      </div>

      <div className="space-y-2">
        {menuItems.map(item => (
          <div
            key={item.id}
            className="p-4 border border-slate-200 rounded-lg hover:border-cyan-300 transition flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-slate-900">{item.label}</div>
              <div className="text-sm text-slate-500">{item.url}</div>
            </div>
            <div className="flex items-center gap-2">
              {item.is_visible ? (
                <Eye className="w-4 h-4 text-green-600" />
              ) : (
                <X className="w-4 h-4 text-red-600" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// FEATURES PANEL
// =====================================================

function FeaturesPanel({
  features,
  onToggle
}: {
  features: FeatureFlag[];
  onToggle: (key: string, enabled: boolean) => void;
}) {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <div className="space-y-4">
        {features.map(feature => (
          <div
            key={feature.id}
            className="p-6 border border-slate-200 rounded-lg hover:border-cyan-300 transition"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900">
                  {feature.feature_name}
                </h3>
                {feature.description && (
                  <p className="text-sm text-slate-600 mt-1">
                    {feature.description}
                  </p>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={feature.is_enabled}
                  onChange={(e) => onToggle(feature.feature_key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// BACKUP PANEL
// =====================================================

function BackupPanel() {
  return (
    <div className="bg-white rounded-xl shadow-xl p-8">
      <h3 className="text-xl font-semibold text-slate-900 mb-6">
        Backup & Restore
      </h3>
      <div className="text-slate-600">
        Coming soon: View and restore from previous configuration snapshots
      </div>
    </div>
  );
}
