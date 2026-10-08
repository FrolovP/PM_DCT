import React, { useState } from 'react';
import { KBEntry, KBAccess, Project } from './types';
import { generateId } from './utils';

interface GlobalKnowledgeBaseProps {
  entries: KBEntry[];
  projects: Project[];
  onUpdate: (entries: KBEntry[]) => void;
}

export const GlobalKnowledgeBase: React.FC<GlobalKnowledgeBaseProps> = ({ entries, projects, onUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterAccess, setFilterAccess] = useState<KBAccess | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<KBEntry | null>(null);

  const categories = Array.from(new Set(entries.map(e => e.category)));

  const filteredEntries = entries.filter(entry => {
    const matchSearch = searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchCategory = filterCategory === 'all' || entry.category === filterCategory;
    const matchAccess = filterAccess === 'all' || entry.access === filterAccess;
    return matchSearch && matchCategory && matchAccess;
  });

  const addEntry = (entry: KBEntry) => {
    onUpdate([...entries, entry]);
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    onUpdate(entries.filter(e => e.id !== id));
    setSelectedEntry(null);
  };

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || 'Неизвестный проект';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📖 Глобальная база знаний</h2>
          <p className="text-sm text-gray-500 mt-1">Единое хранилище знаний по всем проектам и активностям проектного офиса</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + Новая запись
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-indigo-600">{entries.length}</p>
          <p className="text-xs text-gray-500">Всего записей</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-green-600">{entries.filter(e => e.access === 'public').length}</p>
          <p className="text-xs text-gray-500">Публичных</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-amber-600">{categories.length}</p>
          <p className="text-xs text-gray-500">Категорий</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-2xl font-bold text-purple-600">{Array.from(new Set(entries.map(e => e.author))).length}</p>
          <p className="text-xs text-gray-500">Авторов</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Поиск по базе знаний..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="all">Все категории</option>
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <select
            value={filterAccess}
            onChange={e => setFilterAccess(e.target.value as KBAccess | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          >
            <option value="all">Все уровни доступа</option>
            <option value="public">🌐 Публичные</option>
            <option value="restricted">🔒 Ограниченные</option>
            <option value="private">🔐 Приватные</option>
          </select>
        </div>
      </div>

      {/* Entries */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📖</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Записи не найдены</h3>
          <p className="text-sm text-gray-500">Попробуйте изменить параметры поиска или добавьте новую запись</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredEntries.map(entry => (
            <div
              key={entry.id}
              className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedEntry(entry)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">{entry.title}</h4>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${
                      entry.access === 'public' ? 'bg-green-100 text-green-700' :
                      entry.access === 'restricted' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {entry.access === 'public' ? '🌐' : entry.access === 'restricted' ? '🔒' : '🔐'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-medium">{entry.category}</span> • {entry.author} • {entry.updatedAt}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-3 whitespace-pre-line">{entry.content}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    {entry.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">#{tag}</span>
                    ))}
                    {entry.relatedProjects.length > 0 && (
                      <span className="text-xs text-gray-400 ml-auto">
                        📁 {entry.relatedProjects.length} проект(ов)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{selectedEntry.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedEntry.category} • {selectedEntry.author} • {selectedEntry.updatedAt}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-lg ${
                    selectedEntry.access === 'public' ? 'bg-green-100 text-green-700' :
                    selectedEntry.access === 'restricted' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedEntry.access === 'public' ? '🌐 Публичная' : selectedEntry.access === 'restricted' ? '🔒 Ограниченная' : '🔐 Приватная'}
                  </span>
                  <button onClick={() => setSelectedEntry(null)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-line">{selectedEntry.content}</p>
              </div>
              
              {selectedEntry.tags.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Теги:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedEntry.tags.map(tag => (
                      <span key={tag} className="text-xs px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md">#{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEntry.relatedProjects.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Связанные проекты:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.relatedProjects.map(pid => (
                      <span key={pid} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                        📁 {getProjectName(pid)}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => deleteEntry(selectedEntry.id)}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Удалить запись
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Entry Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Новая запись в глобальную базу знаний</h3>
            </div>
            <GlobalKBForm
              onSubmit={(data) => {
                addEntry({
                  id: generateId(),
                  title: data.title,
                  content: data.content,
                  category: data.category || 'Общее',
                  tags: (data.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean),
                  author: data.author || '',
                  createdAt: new Date().toISOString().split('T')[0],
                  updatedAt: new Date().toISOString().split('T')[0],
                  access: (data.access || 'public') as KBAccess,
                  relatedProjects: data.relatedProjects ? data.relatedProjects.split(',').map((p: string) => p.trim()).filter(Boolean) : [],
                });
              }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const GlobalKBForm: React.FC<{
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [data, setData] = useState<Record<string, string>>({});
  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="p-6 space-y-4">
      <div>
        <label className={labelClass}>Заголовок *</label>
        <input type="text" required value={data.title || ''} onChange={e => setData({ ...data, title: e.target.value })} className={inputClass} placeholder="Заголовок записи" />
      </div>
      <div>
        <label className={labelClass}>Содержание *</label>
        <textarea rows={6} required value={data.content || ''} onChange={e => setData({ ...data, content: e.target.value })} className={inputClass} placeholder="Содержание записи..." />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Категория</label>
          <input type="text" value={data.category || ''} onChange={e => setData({ ...data, category: e.target.value })} className={inputClass} placeholder="Например: Стандарты, Процессы, Опыт" />
        </div>
        <div>
          <label className={labelClass}>Автор</label>
          <input type="text" value={data.author || ''} onChange={e => setData({ ...data, author: e.target.value })} className={inputClass} placeholder="ФИО автора" />
        </div>
        <div>
          <label className={labelClass}>Теги (через запятую)</label>
          <input type="text" value={data.tags || ''} onChange={e => setData({ ...data, tags: e.target.value })} className={inputClass} placeholder="тег1, тег2, тег3" />
        </div>
        <div>
          <label className={labelClass}>Уровень доступа</label>
          <select value={data.access || 'public'} onChange={e => setData({ ...data, access: e.target.value })} className={inputClass}>
            <option value="public">🌐 Публичная</option>
            <option value="restricted">🔒 Ограниченная</option>
            <option value="private">🔐 Приватная</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Связанные проекты (ID через запятую, опционально)</label>
          <input type="text" value={data.relatedProjects || ''} onChange={e => setData({ ...data, relatedProjects: e.target.value })} className={inputClass} placeholder="1, 2, 3" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Добавить</button>
      </div>
    </form>
  );
};
