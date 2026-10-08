import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Settings {
  platform_name: string;
  platform_logo: string;
  primary_color: string;
  theme: string;
  session_timeout: number;
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  max_login_attempts: number;
  lockout_duration: number;
  enable_registration: boolean;
  enable_notifications: boolean;
  maintenance_mode: boolean;
}

export const AdminSettings: React.FC = () => {
  const { hasPermission } = useAuth();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      const settingsObj: any = {};
      Object.entries(data.settings).forEach(([key, value]: [string, any]) => {
        settingsObj[key] = value.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      if (response.ok) {
        setMessage('✅ Настройки сохранены');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Сбросить все настройки к значениям по умолчанию?')) return;
    try {
      await fetch('/api/settings/reset', { method: 'POST' });
      await loadSettings();
      setMessage('✅ Настройки сброшены');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка сброса');
    }
  };

  if (!hasPermission('manage_settings')) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-amber-800">У вас нет прав для просмотра настроек</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  if (!settings) {
    return <div className="text-center py-8">Ошибка загрузки настроек</div>;
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">⚙️ Настройки платформы</h2>
          <p className="text-sm text-gray-500 mt-1">Управление внешним видом и параметрами системы</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Сбросить
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg ${message.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Внешний вид */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🎨 Внешний вид</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Название платформы</label>
            <input
              type="text"
              value={settings.platform_name}
              onChange={e => setSettings({ ...settings, platform_name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Логотип (emoji)</label>
            <input
              type="text"
              value={settings.platform_logo}
              onChange={e => setSettings({ ...settings, platform_logo: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Основной цвет</label>
            <input
              type="color"
              value={settings.primary_color}
              onChange={e => setSettings({ ...settings, primary_color: e.target.value })}
              className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          <div>
            <label className={labelClass}>Тема оформления</label>
            <select
              value={settings.theme}
              onChange={e => setSettings({ ...settings, theme: e.target.value })}
              className={inputClass}
            >
              <option value="light">Светлая</option>
              <option value="dark">Тёмная</option>
            </select>
          </div>
        </div>
      </div>

      {/* Безопасность */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔐 Безопасность</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Таймаут сессии (секунды)</label>
            <input
              type="number"
              value={settings.session_timeout}
              onChange={e => setSettings({ ...settings, session_timeout: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Минимальная длина пароля</label>
            <input
              type="number"
              value={settings.password_min_length}
              onChange={e => setSettings({ ...settings, password_min_length: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Макс. попыток входа</label>
            <input
              type="number"
              value={settings.max_login_attempts}
              onChange={e => setSettings({ ...settings, max_login_attempts: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Время блокировки (секунды)</label>
            <input
              type="number"
              value={settings.lockout_duration}
              onChange={e => setSettings({ ...settings, lockout_duration: Number(e.target.value) })}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.password_require_uppercase}
                onChange={e => setSettings({ ...settings, password_require_uppercase: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Требовать заглавные буквы в пароле</span>
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.password_require_numbers}
                onChange={e => setSettings({ ...settings, password_require_numbers: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Требовать цифры в пароле</span>
            </label>
          </div>
          <div className="md:col-span-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.password_require_special}
                onChange={e => setSettings({ ...settings, password_require_special: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Требовать спецсимволы в пароле</span>
            </label>
          </div>
        </div>
      </div>

      {/* Функции */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Функции</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_registration}
              onChange={e => setSettings({ ...settings, enable_registration: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Разрешить регистрацию новых пользователей</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.enable_notifications}
              onChange={e => setSettings({ ...settings, enable_notifications: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Включить уведомления</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={e => setSettings({ ...settings, maintenance_mode: e.target.checked })}
              className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Режим обслуживания (только администраторы могут входить)</span>
          </label>
        </div>
      </div>
    </div>
  );
};
