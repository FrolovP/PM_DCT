import React, { useState } from 'react';
import { ProjectOffice, Portfolio, PortfolioType, Project } from './types';
import { generateId, PORTFOLIO_TYPE_LABELS, PORTFOLIO_TYPE_COLORS, formatCurrency } from './utils';

interface PortfolioViewProps {
  office: ProjectOffice;
  projects: Project[];
  onUpdateOffice: (office: ProjectOffice) => void;
  onViewProject: (project: Project) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({ office, projects, onUpdateOffice, onViewProject }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [managingPortfolio, setManagingPortfolio] = useState<Portfolio | null>(null);

  const officeProjects = projects.filter(p => p.officeId === office.id);

  const handleCreate = (data: Record<string, string>) => {
    const newPortfolio: Portfolio = {
      id: generateId(),
      name: data.name,
      description: data.description || '',
      type: (data.type || 'business') as PortfolioType,
      officeId: office.id,
      projectIds: [],
      createdAt: new Date().toISOString().split('T')[0],
      strategicGoal: data.strategicGoal || '',
    };
    onUpdateOffice({ ...office, portfolios: [...office.portfolios, newPortfolio] });
    setShowCreateForm(false);
  };

  const handleUpdate = (data: Record<string, string>) => {
    if (!editingPortfolio) return;
    const updated: Portfolio = {
      ...editingPortfolio,
      name: data.name,
      description: data.description || '',
      type: (data.type || editingPortfolio.type) as PortfolioType,
      strategicGoal: data.strategicGoal || '',
    };
    onUpdateOffice({
      ...office,
      portfolios: office.portfolios.map(p => p.id === updated.id ? updated : p)
    });
    setEditingPortfolio(null);
  };

  const handleDeletePortfolio = (portfolioId: string) => {
    onUpdateOffice({
      ...office,
      portfolios: office.portfolios.filter(p => p.id !== portfolioId)
    });
  };

  const handleToggleProjectInPortfolio = (portfolioId: string, projectId: string) => {
    const updatedPortfolios = office.portfolios.map(p => {
      if (p.id === portfolioId) {
        const hasProject = p.projectIds.includes(projectId);
        return {
          ...p,
          projectIds: hasProject
            ? p.projectIds.filter(id => id !== projectId)
            : [...p.projectIds, projectId]
        };
      }
      return p;
    });
    onUpdateOffice({ ...office, portfolios: updatedPortfolios });
  };

  const getPortfolioStats = (portfolio: Portfolio) => {
    const pProjects = officeProjects.filter(p => portfolio.projectIds.includes(p.id));
    return {
      count: pProjects.length,
      active: pProjects.filter(p => p.status === 'active').length,
      budget: pProjects.reduce((s, p) => s + p.budget, 0),
      spent: pProjects.reduce((s, p) => s + p.spent, 0),
      avgProgress: pProjects.length > 0 ? Math.round(pProjects.reduce((s, p) => s + p.progress, 0) / pProjects.length) : 0,
    };
  };

  const unassignedProjects = officeProjects.filter(p => !office.portfolios.some(port => port.projectIds.includes(p.id)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>{office.icon}</span> Портфели проектов — {office.name}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Группировка проектов по направлениям деятельности или архитектуры</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + Новый портфель
        </button>
      </div>

      {/* Portfolio Cards */}
      {office.portfolios.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📁</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Портфели не созданы</h3>
          <p className="text-sm text-gray-500 mb-4">Создайте первый портфель для группировки проектов</p>
          <button onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            Создать портфель
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {office.portfolios.map(portfolio => {
            const stats = getPortfolioStats(portfolio);
            return (
              <div key={portfolio.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Portfolio Header */}
                <div className={`p-4 border-b ${PORTFOLIO_TYPE_COLORS[portfolio.type]}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold">{portfolio.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-white/50 rounded font-medium">{PORTFOLIO_TYPE_LABELS[portfolio.type]}</span>
                      </div>
                      <p className="text-sm opacity-80 mt-0.5">{portfolio.description}</p>
                      {portfolio.strategicGoal && (
                        <p className="text-xs mt-1 opacity-70">🎯 {portfolio.strategicGoal}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setManagingPortfolio(portfolio)}
                        className="p-1.5 hover:bg-white/30 rounded transition-colors"
                        title="Управление проектами"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setEditingPortfolio(portfolio)}
                        className="p-1.5 hover:bg-white/30 rounded transition-colors"
                        title="Редактировать"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(portfolio.id)}
                        className="p-1.5 hover:bg-white/30 rounded transition-colors"
                        title="Удалить"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 divide-x divide-gray-100">
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{stats.count}</p>
                    <p className="text-xs text-gray-500">Проектов</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-green-600">{stats.active}</p>
                    <p className="text-xs text-gray-500">Активных</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-lg font-bold text-gray-900">{stats.avgProgress}%</p>
                    <p className="text-xs text-gray-500">Ср. прогресс</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(stats.budget)}</p>
                    <p className="text-xs text-gray-500">Бюджет</p>
                  </div>
                  <div className="p-3 text-center">
                    <p className="text-sm font-bold text-amber-600">{formatCurrency(stats.spent)}</p>
                    <p className="text-xs text-gray-500">Освоено</p>
                  </div>
                </div>

                {/* Projects in Portfolio */}
                {portfolio.projectIds.length > 0 && (
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2">
                      {portfolio.projectIds.map(pid => {
                        const project = officeProjects.find(p => p.id === pid);
                        if (!project) return null;
                        return (
                          <button
                            key={pid}
                            onClick={() => onViewProject(project)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                          >
                            <div className={`w-2 h-2 rounded-full ${project.type === 'infrastructure' ? 'bg-blue-500' : project.type === 'support' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                            <span className="text-gray-700">{project.name}</span>
                            <span className="text-xs text-gray-400">{project.progress}%</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Unassigned Projects */}
      {unassignedProjects.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Проекты без портфеля ({unassignedProjects.length})</h3>
          <div className="flex flex-wrap gap-2">
            {unassignedProjects.map(project => (
              <button
                key={project.id}
                onClick={() => onViewProject(project)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full ${project.type === 'infrastructure' ? 'bg-blue-500' : project.type === 'support' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                <span className="text-gray-700">{project.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Create/Edit Portfolio Modal */}
      {(showCreateForm || editingPortfolio) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {editingPortfolio ? 'Редактировать портфель' : 'Новый портфель'}
              </h3>
            </div>
            <PortfolioForm
              initialData={editingPortfolio ? {
                name: editingPortfolio.name,
                description: editingPortfolio.description,
                type: editingPortfolio.type,
                strategicGoal: editingPortfolio.strategicGoal,
              } : undefined}
              onSubmit={editingPortfolio ? handleUpdate : handleCreate}
              onCancel={() => { setShowCreateForm(false); setEditingPortfolio(null); }}
            />
          </div>
        </div>
      )}

      {/* Manage Projects in Portfolio */}
      {managingPortfolio && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                Управление проектами — {managingPortfolio.name}
              </h3>
              <p className="text-sm text-gray-500 mt-1">Выберите проекты для включения в портфель</p>
            </div>
            <div className="p-6 space-y-2">
              {officeProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет проектов в офисе</p>
              ) : (
                officeProjects.map(project => (
                  <label key={project.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={managingPortfolio.projectIds.includes(project.id)}
                      onChange={() => handleToggleProjectInPortfolio(managingPortfolio.id, project.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className={`w-3 h-3 rounded-full ${project.type === 'infrastructure' ? 'bg-blue-500' : project.type === 'support' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.manager} • {project.status}</p>
                    </div>
                    <span className="text-xs text-gray-500">{project.progress}%</span>
                  </label>
                ))
              )}
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setManagingPortfolio(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PortfolioForm: React.FC<{
  initialData?: Record<string, string>;
  onSubmit: (data: Record<string, string>) => void;
  onCancel: () => void;
}> = ({ initialData, onSubmit, onCancel }) => {
  const [data, setData] = useState<Record<string, string>>(initialData || {
    name: '', description: '', type: 'business', strategicGoal: ''
  });

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="p-6 space-y-4">
      <div>
        <label className={labelClass}>Название портфеля *</label>
        <input type="text" required value={data.name || ''} onChange={e => setData({ ...data, name: e.target.value })} className={inputClass} placeholder="Например: Корпоративные системы" />
      </div>
      <div>
        <label className={labelClass}>Описание</label>
        <textarea rows={2} value={data.description || ''} onChange={e => setData({ ...data, description: e.target.value })} className={inputClass} placeholder="Описание портфеля" />
      </div>
      <div>
        <label className={labelClass}>Тип портфеля</label>
        <select value={data.type || 'business'} onChange={e => setData({ ...data, type: e.target.value })} className={inputClass}>
          {Object.entries(PORTFOLIO_TYPE_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className={labelClass}>Стратегическая цель</label>
        <textarea rows={2} value={data.strategicGoal || ''} onChange={e => setData({ ...data, strategicGoal: e.target.value })} className={inputClass} placeholder="Какую стратегическую цель решает портфель" />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Сохранить</button>
      </div>
    </form>
  );
};
