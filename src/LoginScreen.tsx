import React, { useState } from 'react';
import { User } from './auth';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const user = users.find(u => u.login === login && u.password === password);
    
    if (user) {
      onLogin(user);
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const handleDemoLogin = (user: User) => {
    onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <svg className="w-12 h-12 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Платформа проектных офисов</h1>
          <p className="text-white/80">Управление портфелями и проектами</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Вход в систему</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Введите логин"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                placeholder="Введите пароль"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              Войти
            </button>
          </form>

          {/* Demo Users */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {showDemo ? 'Скрыть' : 'Показать'} демо-пользователей
            </button>

            {showDemo && (
              <div className="mt-4 space-y-2">
                {users.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleDemoLogin(user)}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.login} • {user.role}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${
                        user.role === 'admin' ? 'bg-red-100 text-red-700' :
                        user.role === 'office_director' ? 'bg-purple-100 text-purple-700' :
                        user.role === 'project_manager' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'team_member' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {user.role === 'admin' ? 'Админ' :
                         user.role === 'office_director' ? 'Директор' :
                         user.role === 'project_manager' ? 'РП' :
                         user.role === 'team_member' ? 'Участник' : 'Гость'}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-6">
          © 2025 Платформа проектных офисов
        </p>
      </div>
    </div>
  );
};
