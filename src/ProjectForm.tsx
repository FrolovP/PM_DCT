import React, { useState, useEffect } from 'react';
import { Project, ProjectType, ProjectStatus, ProjectPriority, ProjectOffice } from './types';
import { PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, PROJECT_PRIORITY_LABELS, generateId } from './utils';

interface ProjectFormProps {
  project?: Project | null;
  offices?: ProjectOffice[];
  currentOfficeId?: string;
  onSave: (project: Project) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ project, offices = [], currentOfficeId = '', onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'development' as ProjectType,
    status: 'planning' as ProjectStatus,
    priority: 'medium' as ProjectPriority,
    description: '',
    manager: '',
    startDate: '',
    endDate: '',
    progress: 0,
    budget: 0,
    spent: 0,
    officeId: currentOfficeId,
    portfolioId: '',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        type: project.type,
        status: project.status,
        priority: project.priority,
        description: project.description,
        manager: project.manager,
        startDate: project.startDate,
        endDate: project.endDate,
        progress: project.progress,
        budget: project.budget,
        spent: project.spent,
        officeId: project.officeId,
        portfolioId: project.portfolioId,
      });
    }
  }, [project]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: project?.id || generateId(),
      ...formData,
      officeId: formData.officeId || currentOfficeId,
      portfolioId: formData.portfolioId,
      tasks: project?.tasks || [],
      documents: project?.documents || [],
      artifacts: project?.artifacts || [],
      structure: project?.structure || [],
      links: project?.links || [],
      knowledgeBase: project?.knowledgeBase || [],
      createdAt: project?.createdAt || new Date().toISOString().split('T')[0],
    };
    onSave(newProject);
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  // Get portfolios for selected office
  const selectedOffice = offices.find(o => o.id === formData.officeId);
  const availablePortfolios = selectedOffice?.portfolios || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">
            {project ? 'Редактирование проекта' : 'Новый проект'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Office & Portfolio Selection */}
          {offices.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <label className={labelClass}>Проектный офис *</label>
                <select
                  required
                  value={formData.officeId}
                  onChange={e => setFormData({ ...formData, officeId: e.target.value, portfolioId: '' })}
                  className={inputClass}
                >
                  <option value="">Выберите офис...</option>
                  {offices.map(office => (
                    <option key={office.id} value={office.id}>{office.icon} {office.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Портфель (опционально)</label>
                <select
                  value={formData.portfolioId}
                  onChange={e => setFormData({ ...formData, portfolioId: e.target.value })}
                  className={inputClass}
                  disabled={!formData.officeId}
                >
                  <option value="">Без портфеля</option>
                  {availablePortfolios.map(portfolio => (
                    <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Название проекта *</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Введите название проекта" />
            </div>

            <div>
              <label className={labelClass}>Тип проекта *</label>
              <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value as ProjectType })} className={inputClass}>
                {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Статус</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })} className={inputClass}>
                {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Приоритет</label>
              <select value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value as ProjectPriority })} className={inputClass}>
                {Object.entries(PROJECT_PRIORITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Руководитель *</label>
              <input type="text" required value={formData.manager} onChange={e => setFormData({ ...formData, manager: e.target.value })} className={inputClass} placeholder="ФИО руководителя" />
            </div>

            <div>
              <label className={labelClass}>Дата начала</label>
              <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Дата окончания</label>
              <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Бюджет (₽)</label>
              <input type="number" min="0" value={formData.budget} onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Освоено (₽)</label>
              <input type="number" min="0" value={formData.spent} onChange={e => setFormData({ ...formData, spent: Number(e.target.value) })} className={inputClass} />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Прогресс: {formData.progress}%</label>
              <input type="range" min="0" max="100" value={formData.progress} onChange={e => setFormData({ ...formData, progress: Number(e.target.value) })} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Описание</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className={inputClass} placeholder="Краткое описание проекта" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              {project ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
