import React, { useState, useEffect, useMemo } from 'react';
import { Project, ProjectType, ProjectStatus, KBEntry, ProjectOffice } from './types';
import {
  loadProjects, saveProjects, getDashboardStats,
  loadGlobalKB, saveGlobalKB, loadOffices, saveOffices,
  getOfficeStats,
  PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS,
} from './utils';
import { useAuth } from './AuthContext';
import { LoginScreen } from './LoginScreen';
import { UserMenu } from './UserMenu';
import { loadUsers } from './AuthContext';
import { Dashboard } from './Dashboard';
import { ProjectCard } from './ProjectCard';
import { ProjectForm } from './ProjectForm';
import { ProjectDetailView } from './ProjectDetailView';
import { GlobalKnowledgeBase } from './GlobalKnowledgeBase';
import { OfficeSelector } from './OfficeSelector';
import { PortfolioView } from './PortfolioView';
import { ProtectedRoute, PermissionButton } from './ProtectedRoute';
import { UserManagement } from './UserManagement';
import { AdminSettings } from './AdminSettings';

type ViewMode = 'dashboard' | 'offices' | 'projects' | 'portfolios' | 'global-kb' | 'users' | 'settings';

function App() {
  const { auth, login, hasPermission } = useAuth();
  const [users] = useState(loadUsers());
  const [projects, setProjects] = useState<Project[]>([]);
  const [offices, setOffices] = useState<ProjectOffice[]>([]);
  const [globalKB, setGlobalKB] = useState<KBEntry[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [currentOfficeId, setCurrentOfficeId] = useState<string>('');
  const [filterType, setFilterType] = useState<ProjectType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadedOffices = loadOffices();
    setOffices(loadedOffices);
    setProjects(loadProjects());
    setGlobalKB(loadGlobalKB());
    if (loadedOffices.length > 0) setCurrentOfficeId(loadedOffices[0].id);
  }, []);

  useEffect(() => { if (projects.length > 0) saveProjects(projects); }, [projects]);
  useEffect(() => { if (offices.length > 0) saveOffices(offices); }, [offices]);
  useEffect(() => { if (globalKB.length > 0) saveGlobalKB(globalKB); }, [globalKB]);

  const stats = useMemo(() => getDashboardStats(projects), [projects]);
  const currentOffice = offices.find(o => o.id === currentOfficeId);

  // Filter projects by current office and user permissions
  const officeProjects = useMemo(() => {
    return projects.filter(p => {
      const matchOffice = p.officeId === currentOfficeId;
      const matchType = filterType === 'all' || p.type === filterType;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchSearch = searchQuery === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.manager.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Role-based filtering
      if (auth.user?.role === 'project_manager' || auth.user?.role === 'team_member') {
        const hasAccess = auth.user.projectIds?.includes(p.id);
        if (!hasAccess && !hasPermission('view_all_projects')) return false;
      }
      
      return matchOffice && matchType && matchStatus && matchSearch;
    });
  }, [projects, currentOfficeId, filterType, filterStatus, searchQuery, auth.user, hasPermission]);

  const handleSaveProject = (project: Project) => {
    const projectWithOffice = {
      ...project,
      officeId: project.officeId || currentOfficeId,
      portfolioId: project.portfolioId || '',
    };
    setProjects(prev => {
      const exists = prev.find(p => p.id === projectWithOffice.id);
      if (exists) return prev.map(p => p.id === projectWithOffice.id ? projectWithOffice : p);
      return [...prev, projectWithOffice];
    });
    if (projectWithOffice.portfolioId) {
      setOffices(prev => prev.map(o => {
        if (o.id === projectWithOffice.officeId) {
          const portfolio = o.portfolios.find(p => p.id === projectWithOffice.portfolioId);
          if (portfolio && !portfolio.projectIds.includes(projectWithOffice.id)) {
            return {
              ...o,
              portfolios: o.portfolios.map(p =>
                p.id === projectWithOffice.portfolioId
                  ? { ...p, projectIds: [...p.projectIds, projectWithOffice.id] }
                  : p
              )
            };
          }
        }
        return o;
      }));
    }
    setShowForm(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    setOffices(prev => prev.map(o => ({
      ...o,
      portfolios: o.portfolios.map(p => ({
        ...p,
        projectIds: p.projectIds.filter(pid => pid !== id)
      }))
    })));
    setDeleteConfirm(null);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    setViewingProject(updatedProject);
  };

  const handleUpdateAllProjects = (updatedProjects: Project[]) => {
    setProjects(updatedProjects);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCreateOffice = (office: ProjectOffice) => {
    setOffices(prev => [...prev, office]);
    if (!currentOfficeId) setCurrentOfficeId(office.id);
  };

  const handleUpdateOffice = (office: ProjectOffice) => {
    setOffices(prev => prev.map(o => o.id === office.id ? office : o));
  };

  const handleDeleteOffice = (officeId: string) => {
    setOffices(prev => prev.filter(o => o.id !== officeId));
    if (currentOfficeId === officeId) {
      const remaining = offices.filter(o => o.id !== officeId);
      if (remaining.length > 0) setCurrentOfficeId(remaining[0].id);
    }
  };

  // Show login screen if not authenticated
  if (!auth.isAuthenticated) {
    return <LoginScreen users={users} onLogin={login} />;
  }

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
                <h1 className="text-lg font-bold text-gray-900">Платформа проектных офисов</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Единое управление проектами и знаниями</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-gray-100 rounded-lg p-1">
              <ProtectedRoute permission="view_dashboard">
                <NavButton active={viewMode === 'dashboard'} onClick={() => setViewMode('dashboard')}>📊 Обзор</NavButton>
              </ProtectedRoute>
              <ProtectedRoute permission="view_offices">
                <NavButton active={viewMode === 'offices'} onClick={() => setViewMode('offices')}>🏢 Офисы</NavButton>
              </ProtectedRoute>
              <ProtectedRoute permission="view_portfolios">
                <NavButton active={viewMode === 'portfolios'} onClick={() => setViewMode('portfolios')}>📁 Портфели</NavButton>
              </ProtectedRoute>
              <ProtectedRoute permission="view_projects">
                <NavButton active={viewMode === 'projects'} onClick={() => setViewMode('projects')}>📋 Проекты</NavButton>
              </ProtectedRoute>
              <ProtectedRoute permission="view_global_kb">
                <NavButton active={viewMode === 'global-kb'} onClick={() => setViewMode('global-kb')}>📖 База знаний</NavButton>
              </ProtectedRoute>
              <ProtectedRoute permission="manage_users">
                <NavButton active={viewMode === 'users'} onClick={() => setViewMode('users')}>👥 Пользователи</NavButton>
              </ProtectedRoute>
              <ProtectedRoute permission="manage_settings">
                <NavButton active={viewMode === 'settings'} onClick={() => setViewMode('settings')}>⚙️ Настройки</NavButton>
              </ProtectedRoute>
            </nav>

            {/* Mobile nav */}
            <select
              className="md:hidden px-2 py-1.5 border border-gray-300 rounded-lg text-sm"
              value={viewMode}
              onChange={e => setViewMode(e.target.value as ViewMode)}
            >
              {hasPermission('view_dashboard') && <option value="dashboard">📊 Обзор</option>}
              {hasPermission('view_offices') && <option value="offices">🏢 Офисы</option>}
              {hasPermission('view_portfolios') && <option value="portfolios">📁 Портфели</option>}
              {hasPermission('view_projects') && <option value="projects">📋 Проекты</option>}
              {hasPermission('view_global_kb') && <option value="global-kb">📖 База знаний</option>}
              {hasPermission('manage_users') && <option value="users">👥 Пользователи</option>}
              {hasPermission('manage_settings') && <option value="settings">⚙️ Настройки</option>}
            </select>

            <div className="flex items-center gap-3">
              <PermissionButton
                permission="create_projects"
                onClick={() => { setEditingProject(null); setShowForm(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Новый проект</span>
              </PermissionButton>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Office Selector Bar */}
      {(viewMode === 'projects' || viewMode === 'portfolios') && offices.length > 0 && (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-xs text-gray-500 shrink-0">Офис:</span>
              {offices.map(office => (
                <button
                  key={office.id}
                  onClick={() => setCurrentOfficeId(office.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    office.id === currentOfficeId
                      ? 'text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={office.id === currentOfficeId ? { backgroundColor: office.color } : {}}
                >
                  <span>{office.icon}</span>
                  <span>{office.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {viewMode === 'dashboard' && (
          <ProtectedRoute permission="view_dashboard">
            <Dashboard stats={stats} />
          </ProtectedRoute>
        )}

        {viewMode === 'offices' && (
          <ProtectedRoute permission="view_offices">
            <OfficeSelector
              offices={offices}
              currentOfficeId={currentOfficeId}
              onSelectOffice={setCurrentOfficeId}
              onCreateOffice={handleCreateOffice}
              onUpdateOffice={handleUpdateOffice}
              onDeleteOffice={handleDeleteOffice}
            />
          </ProtectedRoute>
        )}

        {viewMode === 'portfolios' && currentOffice && (
          <ProtectedRoute permission="view_portfolios">
            <PortfolioView
              office={currentOffice}
              projects={projects}
              onUpdateOffice={handleUpdateOffice}
              onViewProject={setViewingProject}
            />
          </ProtectedRoute>
        )}

        {viewMode === 'projects' && (
          <ProtectedRoute permission="view_projects">
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text" placeholder="Поиск проектов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
                  </div>
                  <select value={filterType} onChange={e => setFilterType(e.target.value as ProjectType | 'all')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    <option value="all">Все типы</option>
                    {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                  <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as ProjectStatus | 'all')} className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                    <option value="all">Все статусы</option>
                    {Object.entries(PROJECT_STATUS_LABELS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Проектов в офисе: <span className="font-semibold text-gray-700">{officeProjects.length}</span>
                </p>
              </div>

              {officeProjects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Проекты не найдены</h3>
                  <p className="text-sm text-gray-500 mb-4">Создайте новый проект в текущем офисе</p>
                  <PermissionButton
                    permission="create_projects"
                    onClick={() => { setEditingProject(null); setShowForm(true); }}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    Создать проект
                  </PermissionButton>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {officeProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onEdit={handleEditProject} onDelete={(id) => setDeleteConfirm(id)} onView={setViewingProject} />
                  ))}
                </div>
              )}
            </div>
          </ProtectedRoute>
        )}

        {viewMode === 'global-kb' && (
          <ProtectedRoute permission="view_global_kb">
            <GlobalKnowledgeBase entries={globalKB} projects={projects} onUpdate={setGlobalKB} />
          </ProtectedRoute>
        )}

        {viewMode === 'users' && (
          <ProtectedRoute permission="manage_users">
            <UserManagement />
          </ProtectedRoute>
        )}

        {viewMode === 'settings' && (
          <ProtectedRoute permission="manage_settings">
            <AdminSettings />
          </ProtectedRoute>
        )}
      </main>

      {/* Modals */}
      {showForm && (
        <ProjectForm
          project={editingProject}
          offices={offices}
          currentOfficeId={currentOfficeId}
          onSave={handleSaveProject}
          onCancel={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}

      {viewingProject && (
        <ProjectDetailView
          project={viewingProject}
          allProjects={projects}
          offices={offices}
          onClose={() => setViewingProject(null)}
          onUpdate={handleUpdateProject}
          onUpdateAll={handleUpdateAllProjects}
        />
      )}

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
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
              <button onClick={() => handleDeleteProject(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700">Удалить</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const NavButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

export default App;
