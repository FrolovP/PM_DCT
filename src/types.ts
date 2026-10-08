export type ProjectType = 'infrastructure' | 'support' | 'development';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';
export type TaskStatus = 'todo' | 'in_progress' | 'review' | 'done' | 'blocked';
export type DocCategory = 'regulation' | 'specification' | 'report' | 'protocol' | 'other';
export type ArtifactType = 'design' | 'code' | 'test' | 'deployment' | 'documentation' | 'other';
export type LinkType = 'dependency' | 'related' | 'blocks' | 'blocked_by' | 'duplicate' | 'parent_child';
export type KBAccess = 'public' | 'restricted' | 'private';

export interface Project {
  id: string;
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
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

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

export interface StructureNode {
  id: string;
  title: string;
  type: 'phase' | 'milestone' | 'work_package' | 'deliverable';
  children: StructureNode[];
  progress: number;
  startDate: string;
  endDate: string;
}

export interface ProjectLink {
  id: string;
  targetProjectId: string;
  targetProjectName: string;
  linkType: LinkType;
  description: string;
}

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

export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  byType: Record<ProjectType, number>;
  totalBudget: number;
  totalSpent: number;
}
