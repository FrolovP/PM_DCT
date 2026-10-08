import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface Integration {
  id: string;
  name: string;
  type: 'max' | 'telegram' | 'slack' | 'teams';
  config: any;
  is_active: boolean;
  created_at: string;
}

export const MessengerIntegrations: React.FC = () => {
  const { hasPermission } = useAuth();
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showBotHelp, setShowBotHelp] = useState(false);

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const response = await fetch('/api/messenger');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Ошибка загрузки интеграций:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMax = async (data: { name: string; botToken: string; webhookUrl?: string }) => {
    try {
      const response = await fetch('/api/messenger/max', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        await loadIntegrations();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Ошибка создания интеграции:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить интеграцию?')) return;
    try {
      await fetch(`/api/messenger/${id}`, { method: 'DELETE' });
      await loadIntegrations();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  if (!hasPermission('manage_integrations')) {
    return <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-amber-800">У вас нет прав для управления интеграциями</p></div>;
  }

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🤖 Интеграции с мессенджерами</h2>
          <p className="text-sm text-gray-500 mt-1">Управление чат-ботами для мессенджеров</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBotHelp(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            📖 Команды бота
          </button>
          <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            + Подключить MAX
          </button>
        </div>
      </div>

      {/* MAX Integration Info */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white text-2xl">
            💬
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">MAX — Российский мессенджер</h3>
            <p className="text-sm text-gray-600 mt-1">
              Интеграция с мессенджером MAX позволяет создать чат-бота для работы с платформой.
              Пользователи смогут получать список проектов, статусы задач и статистику прямо в мессенджере.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-white rounded border border-blue-200">📋 Список проектов</span>
              <span className="text-xs px-2 py-1 bg-white rounded border border-blue-200">✅ Статусы задач</span>
              <span className="text-xs px-2 py-1 bg-white rounded border border-blue-200">📊 Статистика</span>
              <span className="text-xs px-2 py-1 bg-white rounded border border-blue-200">🔔 Уведомления</span>
            </div>
          </div>
        </div>
      </div>

      {integrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <span className="text-4xl">🤖</span>
          <h3 className="text-lg font-medium text-gray-900 mt-4">Интеграции не настроены</h3>
          <p className="text-sm text-gray-500 mt-2">Подключите MAX для создания чат-бота</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {integrations.map(integration => (
            <div key={integration.id} className={`bg-white rounded-xl border p-5 ${integration.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                    {integration.type === 'max' ? '💬' : integration.type === 'telegram' ? '✈️' : integration.type === 'slack' ? '💼' : '👥'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-gray-900">{integration.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${integration.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {integration.is_active ? 'Активен' : 'Деактивирован'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Тип: {integration.type.toUpperCase()}</p>
                    {integration.config?.webhookUrl && (
                      <p className="text-xs text-gray-400 mt-1">Webhook: {integration.config.webhookUrl}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => handleDelete(integration.id)} className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <MaxIntegrationForm onSubmit={handleCreateMax} onCancel={() => setShowCreateForm(false)} />
      )}

      {showBotHelp && (
        <BotCommandsModal onClose={() => setShowBotHelp(false)} />
      )}
    </div>
  );
};

const MaxIntegrationForm: React.FC<{
  onSubmit: (data: { name: string; botToken: string; webhookUrl?: string }) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [botToken, setBotToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, botToken, webhookUrl: webhookUrl || undefined });
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Подключить MAX бота</h3>
          <p className="text-sm text-gray-500 mt-1">Настройте интеграцию с мессенджером MAX</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Название интеграции *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Например: Бот проектного офиса" />
          </div>
          <div>
            <label className={labelClass}>Токен бота MAX *</label>
            <input type="text" required value={botToken} onChange={e => setBotToken(e.target.value)} className={inputClass} placeholder="Получите токен в @MasterBot" />
            <p className="text-xs text-gray-500 mt-1">
              Создайте бота через @MasterBot в MAX и получите токен
            </p>
          </div>
          <div>
            <label className={labelClass}>Webhook URL (опционально)</label>
            <input type="url" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} className={inputClass} placeholder="https://your-domain.com/api/messenger/max/webhook" />
            <p className="text-xs text-gray-500 mt-1">
              Если не указано, будет использован URL по умолчанию
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>📌 Важно:</strong> После создания интеграции настройте webhook в @MasterBot, указав URL: 
              <code className="bg-blue-100 px-1 rounded ml-1">/api/messenger/max/webhook</code>
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Подключить</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BotCommandsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">🤖 Команды чат-бота MAX</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">Доступные команды</h4>
            <div className="space-y-3">
              <Command command="/help" alt="/помощь" description="Список всех доступных команд" />
              <Command command="/projects [status] [type]" alt="/проекты" description="Список проектов с фильтрами" example="/projects active infrastructure" />
              <Command command="/project <id>" alt="/проект" description="Детальная информация о проекте" example="/project abc123" />
              <Command command="/tasks <project_id>" alt="/задачи" description="Список задач проекта" example="/tasks abc123" />
              <Command command="/task <task_id>" alt="/задача" description="Детальная информация о задаче" example="/task xyz789" />
              <Command command="/stats" alt="/статистика" description="Общая статистика платформы" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">Фильтры для /projects</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Статусы:</p>
                <div className="space-y-1">
                  <FilterItem value="planning" label="Планирование" />
                  <FilterItem value="active" label="В работе" />
                  <FilterItem value="paused" label="Приостановлен" />
                  <FilterItem value="completed" label="Завершён" />
                  <FilterItem value="cancelled" label="Отменён" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Типы:</p>
                <div className="space-y-1">
                  <FilterItem value="infrastructure" label="Инфраструктурные" />
                  <FilterItem value="support" label="Сопровождение" />
                  <FilterItem value="development" label="Проекты развития" />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-3">Примеры использования</h4>
            <div className="bg-gray-900 rounded-lg p-4 space-y-3">
              <Example text="/projects active" description="Показать все активные проекты" />
              <Example text="/projects completed" description="Показать все завершённые проекты" />
              <Example text="/projects active infrastructure" description="Активные инфраструктурные проекты" />
              <Example text="/project 123" description="Детали проекта с ID 123" />
              <Example text="/tasks 123" description="Все задачи проекта 123" />
              <Example text="/stats" description="Общая статистика" />
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-indigo-900 mb-2">💡 Подсказка</h4>
            <p className="text-sm text-indigo-800">
              Бот поддерживает как английские, так и русские команды. ID проекта или задачи можно найти в веб-интерфейсе платформы.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Command: React.FC<{ command: string; alt: string; description: string; example?: string }> = ({ command, alt, description, example }) => (
  <div className="bg-gray-50 rounded-lg p-3">
    <div className="flex items-center gap-2">
      <code className="text-sm font-mono text-indigo-600">{command}</code>
      <span className="text-xs text-gray-400">или</span>
      <code className="text-sm font-mono text-gray-600">{alt}</code>
    </div>
    <p className="text-sm text-gray-700 mt-1">{description}</p>
    {example && <p className="text-xs text-gray-500 mt-1">Пример: <code className="bg-gray-200 px-1 rounded">{example}</code></p>}
  </div>
);

const FilterItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="flex items-center gap-2 text-sm">
    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{value}</code>
    <span className="text-gray-600">— {label}</span>
  </div>
);

const Example: React.FC<{ text: string; description: string }> = ({ text, description }) => (
  <div>
    <code className="text-green-400 text-sm">{text}</code>
    <p className="text-xs text-gray-400 mt-0.5">{description}</p>
  </div>
);
