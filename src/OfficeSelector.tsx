import React, { useState } from 'react';
import { ProjectOffice, Portfolio, PortfolioType } from './types';
import { generateId, PORTFOLIO_TYPE_LABELS, PORTFOLIO_TYPE_COLORS } from './utils';

interface OfficeSelectorProps {
  offices: ProjectOffice[];
  currentOfficeId: string;
  onSelectOffice: (officeId: string) => void;
  onCreateOffice: (office: ProjectOffice) => void;
  onUpdateOffice: (office: ProjectOffice) => void;
  onDeleteOffice: (officeId: string) => void;
}

export const OfficeSelector: React.FC<OfficeSelectorProps> = ({
  offices, currentOfficeId, onSelectOffice, onCreateOffice, onUpdateOffice, onDeleteOffice
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingOffice, setEditingOffice] = useState<ProjectOffice | null>(null);
  const [showPortfolios, setShowPortfolios] = useState(false);

  const currentOffice = offices.find(o => o.id === currentOfficeId);

  const handleCreate = (data: Record<string, string>) => {
    const newOffice: ProjectOffice = {
      id: generateId(),
      name: data.name,
      description: data.description || '',
      color: data.color || '#4f46e5',
      icon: data.icon || '🏢',
      director: data.director || '',
      createdAt: new Date().toISOString().split('T')[0],
      portfolios: [],
    };
    onCreateOffice(newOffice);
    setShowCreateForm(false);
  };

  const handleUpdate = (data: Record<string, string>) => {
    if (!editingOffice) return;
    const updated: ProjectOffice = {
      ...editingOffice,
      name: data.name,
      description: data.description || '',
      color: data.color || editingOffice.color,
      icon: data.icon || editingOffice.icon,
      director: data.director || '',
    };
    onUpdateOffice(updated);
    setEditingOffice(null);
  };

  return (
    <div className="space-y-4">
      {/* Office Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offices.map(office => (
          <div
            key={office.id}
            className={`relative bg-white rounded-xl border-2 p-5 cursor-pointer transition-all hover:shadow-lg ${
              office.id === currentOfficeId ? 'border-indigo-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectOffice(office.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                  style={{ backgroundColor: office.color + '20' }}
                >
                  {office.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{office.name}</h3>
                  <p className="text-xs text-gray-500">Руководитель: {office.director}</p>
                </div>
              </div>
              {office.id === currentOfficeId && (
                <div className="absolute top-2 right-2">
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-medium rounded">Активный</span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{office.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>📁 {office.portfolios.length} портфелей</span>
              <span>📅 {office.createdAt}</span>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
              <button
                onClick={(e) => { e.stopPropagation(); setEditingOffice(office); }}
                className="flex-1 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Редактировать
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteOffice(office.id); }}
                className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        ))}

        {/* Create New Office Card */}
        <div
          className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 p-5 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all flex flex-col items-center justify-center min-h-[200px]"
          onClick={() => setShowCreateForm(true)}
        >
          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-600">Создать проектный офис</p>
        </div>
      </div>

      {/* Create/Edit Office Modal */}
      {(showCreateForm || editingOffice) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingOffice ? 'Редактировать офис' : 'Новый проектный офис'}
              </h3>
            </div>
            <OfficeForm
              initialData={editingOffice ? {
                name: editingOffice.name,
                description: editingOffice.description,
                color: editingOffice.color,
                icon: editingOffice.icon,
                director: editingOffice.director,
              } : undefined}
              onSubmit={editingOffice ? handleUpdate : handleCreate}
              onCancel={() => { setShowCreateForm(false); setEditingOffice(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const OfficeForm: React.FC<{
  initialData?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
  const [data, setData] = useState<Record<string, string>>(initialData || {
    name: '', description: '', color: '#4f46e5', icon: '🏢', director: ''
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="p-6 space-y-4">
      <div>
        <label className={labelClass}>Название офиса *</label>
        <input type="text" required value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} className={inputClass} placeholder="Например: ИТ-дирекция" />
      </div>
      <div>
        <label className={labelClass}>Описание</label>
        <textarea rows={3} value={data.description || ''} onChange={e => setData({ ...data, description: e.target.value })} className={inputClass} placeholder="Описание проектного офиса" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Иконка (emoji)</label>
          <input type="text" value={data.icon || ''} onChange={e => setData({ ...data, icon: e.target.value })} className={inputClass} placeholder="🏢" />
        </div>
        <div>
          <label className={labelClass}>Цвет бренда</label>
          <input type="color" value={data.color || '#4f46e5'} onChange={e => setData({ ...data, color: e.target.value })} className="w-full h-10 border border-gray-300 rounded-lg cursor-pointer" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Руководитель офиса *</label>
        <input type="text" required value={data.director || ''} onChange={e => setData({ ...data, director: e.target.value })} className={inputClass} placeholder="ФИО руководителя" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Сохранить</button>
      </div>
    </form>
  );
};
