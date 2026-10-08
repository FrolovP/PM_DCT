export type ProjectType = 'infrastructure' | 'support' | 'development';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type DocCategory = 'regulation' | 'specification' | 'report' | 'protocol' | 'other';
export type ArtifactType = 'design' | 'code' | 'test' | 'deployment' | 'documentation' | 'other';
export type LinkType = 'dependency' | 'related' | 'blocks' | 'blocked_by' | 'duplicate' | 'parent_child';
export type KBAccess = 'public' | 'restricted' | 'private';
export type PortfolioType = 'business' | 'architecture' | 'strategic' | 'operational';

// ─── Проектный офис ───
export interface ProjectOffice {
  id: string;
  name: string;
  description: string;
  color: string; // hex color for branding
  icon: string; // emoji
  director: string;
  createdAt: string;
  portfolios: Portfolio[];
}

// ─── Портфель проектов ───
export interface Portfolio {
  id: string;
  name: string;
  description: string;
  type: PortfolioType;
  officeId: string; // parent office
  projectIds: string[]; // IDs of projects in this portfolio
  createdAt: string;
  strategicGoal: string;
}

// ─── Проект ───
export interface Project {
  id: string;
  officeId: string; // parent office
  portfolioId: string; // parent portfolio (can be empty)
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  priority: ProjectPriority;
  description: string;
  manager: string;
  startDate: string;
  endDate: string;
  progress: number;
  budget: number;
  spent: number;
  tasks: Task[];
  documents: Document[];
  artifacts: Artifact[];
  structure: StructureNode[];
  links: ProjectLink[];
  knowledgeBase: KBEntry[];
  createdAt: string;
}

// ─── Задача ───
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  dueDate: string;
  completed: boolean;
  tags: string[];
  subtasks: Subtask[];
  crossOfficeLinks: CrossOfficeLink[];
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

// ─── Межофисная связь через задачу ───
export interface CrossOfficeLink {
  id: string;
  targetProjectId: string;
  targetProjectName: string;
  targetOfficeId: string;
  targetOfficeName: string;
  linkType: LinkType;
  description: string;
}

// ─── Документ ───
export interface Document {
  id: string;
  title: string;
  category: DocCategory;
  description: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  version: string;
  tags: string[];
  content: string;
}

// ─── Артефакт ───
export interface Artifact {
  id: string;
  title: string;
  type: ArtifactType;
  description: string;
  author: string;
  createdAt: string;
  version: string;
  tags: string[];
  relatedTasks: string[];
}

// ─── Структура проекта (WBS) ───
export interface StructureNode {
  id: string;
  title: string;
  type: 'phase' | 'milestone' | 'work_package' | 'deliverable';
  children: StructureNode[];
  progress: number;
  startDate: string;
  endDate: string;
}

// ─── Связь проекта ───
export interface ProjectLink {
  id: string;
  targetProjectId: string;
  targetProjectName: string;
  targetOfficeId: string;
  targetOfficeName: string;
  linkType: LinkType;
  description: string;
}

// ─── Запись БЗ ───
export interface KBEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  author: string;
  createdAt: string;
  updatedAt: string;
  access: KBAccess;
  relatedProjects: string[];
}

// ─── Статистика ───
export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  byType: Record<ProjectType, number>;
  totalBudget: number;
  totalSpent: number;
}

export interface OfficeStats {
  totalProjects: number;
  activeProjects: number;
  totalPortfolios: number;
  totalBudget: number;
  totalSpent: number;
  crossOfficeLinks: number;
}
