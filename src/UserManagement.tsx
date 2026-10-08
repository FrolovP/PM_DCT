import React, { useState } from 'react';
import { User, UserRole, ROLE_LABELS, ROLE_COLORS } from './auth';
import { loadUsers, saveUsers } from './AuthContext';
import { generateId } from './utils';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>(loadUsers());
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleCreate = (data: Record<string, string>) => {
    const newUser: User = {
      id: generateId(),
      login: data.login,
      password: data.password,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      officeId: data.officeId || undefined,
      projectIds: data.projectIds ? data.projectIds.split(',').map(id => id.trim()) : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };
    const updated = [...users, newUser];
    setUsers(updated);
    saveUsers(updated);
    setShowForm(false);
  };

  const handleUpdate = (data: Record<string, string>) => {
    if (!editingUser) return;
    const updated = users.map(u => u.id === editingUser.id ? {
      ...u,
      login: data.login,
      password: data.password,
      name: data.name,
      email: data.email,
      role: data.role as UserRole,
      officeId: data.officeId || undefined,
      projectIds: data.projectIds ? data.projectIds.split(',').map(id => id.trim()) : undefined,
    } : u);
    setUsers(updated);
    saveUsers(updated);
    setEditingUser(null);
  };

  const handleDelete = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    setUsers(updated);
    saveUsers(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Управление пользователями</h2>
          <p className="text-sm text-gray-500 mt-1">Создание и управление учётными записями</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          + Новый пользователь
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Пользователь</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Логин</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Роль</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.login}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded ${ROLE_COLORS[user.role]}`}>
                    {ROLE_LABELS[user.role]}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(showForm || editingUser) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingUser ? 'Редактировать пользователя' : 'Новый пользователь'}
              </h3>
            </div>
            <UserForm
              initialData={editingUser ? {
                login: editingUser.login,
                password: editingUser.password,
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                officeId: editingUser.officeId || '',
                projectIds: editingUser.projectIds?.join(', ') || '',
              } : undefined}
              onSubmit={editingUser ? handleUpdate : handleCreate}
              onCancel={() => { setShowForm(false); setEditingUser(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const UserForm: React.FC<{
  initialData?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
  const [data, setData] = useState<Record<string, string>>(initialData || {
    login: '', password: '', name: '', email: '', role: 'viewer', officeId: '', projectIds: ''
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="p-6 space-y-4">
      <div>
        <label className={labelClass}>ФИО *</label>
        <input type="text" required value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} className={inputClass} placeholder="Иванов Иван Иванович" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Логин *</label>
          <input type="text" required value={data.login || ''} onChange={e => setData({ ...data, login: e.target.value })} className={inputClass} placeholder="ivanov" />
        </div>
        <div>
          <label className={labelClass}>Пароль *</label>
          <input type="text" required value={data.password || ''} onChange={e => setData({ ...data, password: e.target.value })} className={inputClass} placeholder="password123" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email *</label>
        <input type="email" required value={data.email || ''} onChange={e => setData({ ...data, email: e.target.value })} className={inputClass} placeholder="ivanov@company.ru" />
      </div>
      <div>
        <label className={labelClass}>Роль *</label>
        <select required value={data.role || 'viewer'} onChange={e => setData({ ...data, role: e.target.value })} className={inputClass}>
          {Object.entries(ROLE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>ID офиса (для директора/РП)</label>
        <input type="text" value={data.officeId || ''} onChange={e => setData({ ...data, officeId: e.target.value })} className={inputClass} placeholder="office-1" />
      </div>
      <div>
        <label className={labelClass}>ID проектов через запятую (для РП/участника)</label>
        <input type="text" value={data.projectIds || ''} onChange={e => setData({ ...data, projectIds: e.target.value })} className={inputClass} placeholder="1, 2, 3" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Сохранить</button>
      </div>
    </form>
  );
};
