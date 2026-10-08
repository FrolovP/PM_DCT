export type UserRole = 'admin' | 'office_director' | 'project_manager' | 'team_member' | 'viewer';

export interface User {
  id: string;
  login: string;
  password: string;
  name: string;
  email: string;
  role: UserRole;
  officeId?: string; // привязка к офису (для office_director и project_manager)
  projectIds?: string[]; // привязка к проектам (для project_manager и team_member)
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  office_director: 'Руководитель офиса',
  project_manager: 'Руководитель проекта',
  team_member: 'Участник проекта',
  viewer: 'Наблюдатель',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  office_director: 'bg-purple-100 text-purple-700',
  project_manager: 'bg-blue-100 text-blue-700',
  team_member: 'bg-green-100 text-green-700',
  viewer: 'bg-gray-100 text-gray-700',
};

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: [
    'view_dashboard', 'view_offices', 'create_offices', 'edit_offices', 'delete_offices',
    'view_portfolios', 'create_portfolios', 'edit_portfolios', 'delete_portfolios',
    'view_projects', 'create_projects', 'edit_projects', 'delete_projects',
    'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
    'view_documents', 'create_documents', 'edit_documents', 'delete_documents',
    'view_artifacts', 'create_artifacts', 'edit_artifacts', 'delete_artifacts',
    'view_knowledge_base', 'create_knowledge_base', 'edit_knowledge_base', 'delete_knowledge_base',
    'view_global_kb', 'create_global_kb', 'edit_global_kb', 'delete_global_kb',
    'manage_users', 'manage_settings', 'view_audit', 'view_all_projects', 'cross_office_links'
  ],
  office_director: [
    'view_dashboard', 'view_offices', 'edit_offices',
    'view_portfolios', 'create_portfolios', 'edit_portfolios', 'delete_portfolios',
    'view_projects', 'create_projects', 'edit_projects', 'delete_projects',
    'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
    'view_documents', 'create_documents', 'edit_documents', 'delete_documents',
    'view_artifacts', 'create_artifacts', 'edit_artifacts', 'delete_artifacts',
    'view_knowledge_base', 'create_knowledge_base', 'edit_knowledge_base', 'delete_knowledge_base',
    'view_global_kb', 'create_global_kb', 'view_all_projects', 'cross_office_links'
  ],
  project_manager: [
    'view_dashboard', 'view_portfolios',
    'view_projects', 'edit_projects',
    'view_tasks', 'create_tasks', 'edit_tasks', 'delete_tasks',
    'view_documents', 'create_documents', 'edit_documents',
    'view_artifacts', 'create_artifacts', 'edit_artifacts',
    'view_knowledge_base', 'create_knowledge_base', 'edit_knowledge_base',
    'view_global_kb', 'cross_office_links'
  ],
  team_member: [
    'view_dashboard', 'view_portfolios',
    'view_projects',
    'view_tasks', 'edit_tasks',
    'view_documents',
    'view_artifacts',
    'view_knowledge_base', 'create_knowledge_base',
    'view_global_kb'
  ],
  viewer: [
    'view_dashboard', 'view_portfolios',
    'view_projects',
    'view_tasks',
    'view_documents',
    'view_artifacts',
    'view_knowledge_base',
    'view_global_kb'
  ],
};
