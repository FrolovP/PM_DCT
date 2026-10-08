import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface ApiKey {
  id: string;
  name: string;
  api_key: string;
  permissions: string[];
  rate_limit: number;
  expires_at: string | null;
  is_active: boolean;
  last_used: string | null;
  created_at: string;
  user_name: string;
}

export const ApiKeyManagement: React.FC = () => {
  const { hasPermission } = useAuth();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showApiDocs, setShowApiDocs] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/api-keys');
      const data = await response.json();
      setApiKeys(data.apiKeys || []);
    } catch (error) {
      console.error('Ошибка загрузки API ключей:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: { name: string; permissions: string[]; rateLimit: number; expiresInDays?: number }) => {
    try {
      const response = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        await loadApiKeys();
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Ошибка создания API ключа:', error);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}/deactivate`, { method: 'PUT' });
      await loadApiKeys();
    } catch (error) {
      console.error('Ошибка деактивации:', error);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await fetch(`/api/api-keys/${id}/activate`, { method: 'PUT' });
      await loadApiKeys();
    } catch (error) {
      console.error('Ошибка активации:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить API ключ?')) return;
    try {
      await fetch(`/api/api-keys/${id}`, { method: 'DELETE' });
      await loadApiKeys();
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('API ключ скопирован в буфер обмена');
  };

  if (!hasPermission('manage_api_keys')) {
    return <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-amber-800">У вас нет прав для управления API ключами</p></div>;
  }

  if (loading) return <div className="text-center py-8">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🔑 API ключи</h2>
          <p className="text-sm text-gray-500 mt-1">Управление ключами доступа к API платформы</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowApiDocs(true)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            📖 Документация API
          </button>
          <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">
            + Создать ключ
          </button>
        </div>
      </div>

      {apiKeys.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <span className="text-4xl">🔑</span>
          <h3 className="text-lg font-medium text-gray-900 mt-4">API ключи не созданы</h3>
          <p className="text-sm text-gray-500 mt-2">Создайте первый API ключ для внешних интеграций</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {apiKeys.map(key => (
            <div key={key.id} className={`bg-white rounded-xl border p-5 ${key.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'}`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900">{key.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${key.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {key.is_active ? 'Активен' : 'Деактивирован'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {key.api_key.substring(0, 20)}...
                    </code>
                    <button onClick={() => copyToClipboard(key.api_key)} className="text-xs text-indigo-600 hover:text-indigo-800">
                      📋 Копировать
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>👤 {key.user_name}</span>
                    <span>⚡ Лимит: {key.rate_limit} req/час</span>
                    {key.expires_at && <span>⏰ Истекает: {new Date(key.expires_at).toLocaleDateString('ru')}</span>}
                    {key.last_used && <span>🕐 Использован: {new Date(key.last_used).toLocaleString('ru')}</span>}
                  </div>
                  {key.permissions && (() => {
                    try {
                      const perms = typeof key.permissions === 'string' ? JSON.parse(key.permissions) : key.permissions;
                      return perms.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {perms.map((p: string) => (
                            <span key={p} className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded">{p}</span>
                          ))}
                        </div>
                      ) : null;
                    } catch { return null; }
                  })()}
                </div>
                <div className="flex gap-2">
                  {key.is_active ? (
                    <button onClick={() => handleDeactivate(key.id)} className="px-3 py-1.5 text-xs text-amber-600 border border-amber-200 rounded-lg hover:bg-amber-50">
                      Деактивировать
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(key.id)} className="px-3 py-1.5 text-xs text-green-600 border border-green-200 rounded-lg hover:bg-green-50">
                      Активировать
                    </button>
                  )}
                  <button onClick={() => handleDelete(key.id)} className="px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <ApiKeyForm onSubmit={handleCreate} onCancel={() => setShowCreateForm(false)} />
      )}

      {showApiDocs && (
        <ApiDocsModal onClose={() => setShowApiDocs(false)} />
      )}
    </div>
  );
};

const ApiKeyForm: React.FC<{
  onSubmit: (data: { name: string; permissions: string[]; rateLimit: number; expiresInDays?: number }) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [rateLimit, setRateLimit] = useState(1000);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>(undefined);

  const availablePermissions = [
    'read:offices', 'read:portfolios', 'read:projects', 'read:tasks',
    'read:documents', 'read:users', 'read:stats',
    'write:tasks'
  ];

  const togglePermission = (perm: string) => {
    setPermissions(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, permissions, rateLimit, expiresInDays });
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Создать API ключ</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Название *</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="Например: Интеграция с CRM" />
          </div>
          <div>
            <label className={labelClass}>Права доступа</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {availablePermissions.map(perm => (
                <label key={perm} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={permissions.includes(perm)} onChange={() => togglePermission(perm)} className="w-4 h-4 text-indigo-600 border-gray-300 rounded" />
                  <span className="text-xs">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className={labelClass}>Лимит запросов (в час)</label>
            <input type="number" min="1" value={rateLimit} onChange={e => setRateLimit(Number(e.target.value))} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Срок действия (дней, опционально)</label>
            <input type="number" min="1" value={expiresInDays || ''} onChange={e => setExpiresInDays(e.target.value ? Number(e.target.value) : undefined)} className={inputClass} placeholder="Без ограничения" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Создать</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ApiDocsModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">📖 Документация API</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Аутентификация</h4>
            <p className="text-sm text-gray-600 mb-2">Все запросы к API должны содержать заголовок <code className="bg-gray-100 px-1 rounded">X-API-Key</code> с вашим API ключом.</p>
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`curl -H "X-API-Key: pk_your_api_key_here" \\
  https://your-domain.com/api/v1/projects`}
            </pre>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Endpoints</h4>
            <div className="space-y-3">
              <Endpoint method="GET" path="/api/v1/health" description="Проверка работоспособности" />
              <Endpoint method="GET" path="/api/v1/offices" description="Список офисов" permission="read:offices" />
              <Endpoint method="GET" path="/api/v1/portfolios" description="Список портфелей" permission="read:portfolios" />
              <Endpoint method="GET" path="/api/v1/projects" description="Список проектов" permission="read:projects" />
              <Endpoint method="GET" path="/api/v1/projects/:id" description="Детали проекта" permission="read:projects" />
              <Endpoint method="GET" path="/api/v1/projects/:id/tasks" description="Задачи проекта" permission="read:tasks" />
              <Endpoint method="GET" path="/api/v1/tasks/:id" description="Детали задачи" permission="read:tasks" />
              <Endpoint method="PATCH" path="/api/v1/tasks/:id/status" description="Обновить статус задачи" permission="write:tasks" />
              <Endpoint method="GET" path="/api/v1/projects/:id/documents" description="Документы проекта" permission="read:documents" />
              <Endpoint method="GET" path="/api/v1/stats/summary" description="Общая статистика" permission="read:stats" />
              <Endpoint method="GET" path="/api/v1/users" description="Список пользователей" permission="read:users" />
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Параметры запросов</h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2"><strong>GET /api/v1/projects</strong></p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li><code>officeId</code> — фильтр по офису</li>
                <li><code>status</code> — фильтр по статусу (planning, active, paused, completed, cancelled)</li>
                <li><code>type</code> — фильтр по типу (infrastructure, support, development)</li>
                <li><code>limit</code> — количество записей (по умолчанию 100)</li>
                <li><code>offset</code> — смещение для пагинации</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Пример ответа</h4>
            <pre className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
{`{
  "projects": [
    {
      "id": "abc123",
      "office_id": "office-1",
      "name": "Миграция ЦОД",
      "type": "infrastructure",
      "status": "active",
      "priority": "critical",
      "progress": 45,
      "budget": 15000000,
      "spent": 6750000
    }
  ]
}`}
            </pre>
          </div>

          <div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Коды ответов</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>200</strong> — Успешный запрос</li>
              <li><strong>201</strong> — Ресурс создан</li>
              <li><strong>400</strong> — Ошибка валидации</li>
              <li><strong>401</strong> — Недействительный API ключ</li>
              <li><strong>403</strong> — Недостаточно прав</li>
              <li><strong>404</strong> — Ресурс не найден</li>
              <li><strong>429</strong> — Превышен лимит запросов</li>
              <li><strong>500</strong> — Ошибка сервера</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const Endpoint: React.FC<{ method: string; path: string; description: string; permission?: string }> = ({ method, path, description, permission }) => {
  const methodColors: Record<string, string> = {
    GET: 'bg-green-100 text-green-700',
    POST: 'bg-blue-100 text-blue-700',
    PUT: 'bg-amber-100 text-amber-700',
    PATCH: 'bg-purple-100 text-purple-700',
    DELETE: 'bg-red-100 text-red-700'
  };

  return (
    <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
      <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${methodColors[method]}`}>{method}</span>
      <code className="text-sm text-gray-900 flex-1">{path}</code>
      <span className="text-xs text-gray-500">{description}</span>
      {permission && <span className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">{permission}</span>}
    </div>
  );
};
