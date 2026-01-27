import { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, Database, Mail, Save } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    // General Settings
    companyName: 'My Company',
    language: 'en',
    timezone: 'UTC+5:30',
    currency: 'USD',
    
    // Notification Settings
    emailNotifications: true,
    assetAlerts: true,
    maintenanceReminders: true,
    systemUpdates: false,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // Data Settings
    autoBackup: true,
    backupFrequency: 'daily',
    dataRetention: '365'
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
    setIsSaved(false);
  };

  const handleSave = () => {
    // Save settings logic here
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage your system settings and preferences</p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <SettingsIcon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg text-gray-900">General Settings</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={settings.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Language
              </label>
              <select
                name="language"
                value={settings.language}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Timezone
              </label>
              <select
                name="timezone"
                value={settings.timezone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UTC+5:30">Sri Lanka (UTC+5:30)</option>
                <option value="UTC+0">UTC</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC-8">Pacific Time (UTC-8)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD ($)</option>
                <option value="LKR">LKR (Rs.)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings.emailNotifications}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-900">Email Notifications</p>
                <p className="text-xs text-gray-500">Receive email updates about system activities</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="assetAlerts"
                checked={settings.assetAlerts}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-900">Asset Alerts</p>
                <p className="text-xs text-gray-500">Get notified about asset status changes</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="maintenanceReminders"
                checked={settings.maintenanceReminders}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-900">Maintenance Reminders</p>
                <p className="text-xs text-gray-500">Receive reminders for scheduled maintenance</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="systemUpdates"
                checked={settings.systemUpdates}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-900">System Updates</p>
                <p className="text-xs text-gray-500">Get notified about system updates and new features</p>
              </div>
            </label>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg text-gray-900">Security</h3>
          </div>
          
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="twoFactorAuth"
                checked={settings.twoFactorAuth}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-900">Two-Factor Authentication</p>
                <p className="text-xs text-gray-500">Add an extra layer of security to your account</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  min="5"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Password Expiry (days)
                </label>
                <input
                  type="number"
                  name="passwordExpiry"
                  value={settings.passwordExpiry}
                  onChange={handleChange}
                  min="30"
                  max="365"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Database className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-lg text-gray-900">Data Management</h3>
          </div>
          
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="autoBackup"
                checked={settings.autoBackup}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div>
                <p className="text-sm text-gray-900">Automatic Backup</p>
                <p className="text-xs text-gray-500">Enable automatic data backups</p>
              </div>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Backup Frequency
                </label>
                <select
                  name="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  Data Retention (days)
                </label>
                <input
                  type="number"
                  name="dataRetention"
                  value={settings.dataRetention}
                  onChange={handleChange}
                  min="30"
                  max="3650"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
          
          {isSaved && (
            <div className="flex items-center gap-2 text-green-600">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">Settings saved successfully!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
