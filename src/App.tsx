import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectType, ProjectStatus, KBEntry } from './types';
import {
  loadProjects, saveProjects, getDashboardStats,
  loadGlobalKB, saveGlobalKB,
  PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS,
} from './utils';
import { Dashboard } from './Dashboard';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectDetailView } from './ProjectDetailView';
import { GlobalKnowledgeBase } from './GlobalKnowledgeBase';

type ViewMode = 'dashboard' | 'projects' | 'global-kb';

function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [globalKB, setGlobalKB] = useState<KBEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    setProjects(loadProjects());
    setGlobalKB(loadGlobalKB());
  }, []);

  useEffect(() => {
    if (projects.length > 0) saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    if (globalKB.length > 0) saveGlobalKB(globalKB);
  }, [globalKB]);

  const stats = useMemo(() => getDashboardStats(projects), [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const matchType = filterType === 'all' || p.type === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchType && matchStatus && matchSearch;
    });
  }, [projects, filterType, filterStatus, searchQuery]);

  const handleSaveProject = (project: Project) => {
    setProjects(prev => {
      const exists = prev.find(p => p.id === project.id);
      if (exists) return prev.map(p => p.id === project.id ? project : p);
      return [...prev, project];
    });
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setViewingProject(updatedProject);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleGlobalKBUpdate = (entries: KBEntry[]) => {
    setGlobalKB(entries);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Проектный офис</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Управление проектами и знаниями</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'dashboard' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="hidden sm:inline">📊 </span>Дашборд
              </button>
              <button
                onClick={() => setViewMode('projects')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'projects' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="hidden sm:inline">📁 </span>Проекты
              </button>
              <button
                onClick={() => setViewMode('global-kb')}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'global-kb' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="hidden sm:inline">📖 </span>База знаний
              </button>
            </nav>

            <button
              onClick={() => { setEditingProject(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Новый проект</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'dashboard' && <Dashboard stats={stats} />}

        {viewMode === 'projects' && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Поиск проектов..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value as ProjectType | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">Все типы</option>
                  {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as ProjectStatus | 'all')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                >
                  <option value="all">Все статусы</option>
                  {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              {(filterType !== 'all' || filterStatus !== 'all' || searchQuery) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Фильтры:</span>
                  {filterType !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                      {PROJECT_TYPE_LABELS[filterType as ProjectType]}
                      <button onClick={() => setFilterType('all')} className="hover:text-indigo-900">×</button>
                    </span>
                  )}
                  {filterStatus !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                      {PROJECT_STATUS_LABELS[filterStatus as ProjectStatus]}
                      <button onClick={() => setFilterStatus('all')} className="hover:text-indigo-900">×</button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded text-xs">
                      «{searchQuery}»
                      <button onClick={() => setSearchQuery('')} className="hover:text-indigo-900">×</button>
                    </span>
                  )}
                  <button onClick={() => { setFilterType('all'); setFilterStatus('all'); setSearchQuery(''); }} className="text-xs text-gray-500 hover:text-red-500 ml-auto">
                    Сбросить все
                  </button>
                </div>
              )}
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Найдено проектов: <span className="font-semibold text-gray-700">{filteredProjects.length}</span>
              </p>
            </div>

            {/* Project Grid */}
            {filteredProjects.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Проекты не найдены</h3>
                <p className="text-sm text-gray-500 mb-4">Попробуйте изменить параметры фильтрации или создайте новый проект</p>
                <button onClick={() => { setEditingProject(null); setShowForm(true); }} className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                  Создать проект
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onEdit={handleEditProject}
                    onDelete={(id) => setDeleteConfirm(id)}
                    onView={setViewingProject}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {viewMode === 'global-kb' && (
          <GlobalKnowledgeBase entries={globalKB} projects={projects} onUpdate={handleGlobalKBUpdate} />
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          onSave={handleSaveProject}
          onCancel={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}

      {viewingProject && (
        <ProjectDetailView
          project={viewingProject}
          allProjects={projects}
          onClose={() => setViewingProject(null)}
          onUpdate={handleUpdateProject}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Удалить проект?</h3>
                <p className="text-sm text-gray-500">Это действие нельзя отменить</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Отмена
              </button>
              <button onClick={() => handleDeleteProject(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
