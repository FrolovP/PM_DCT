export type ProjectType = 'infrastructure' | 'support' | 'development';
export type ProjectStatus = 'planning' | 'active' | 'paused' | 'completed' | 'cancelled';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

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
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface DashboardStats {
  total: number;
  active: number;
  completed: number;
  byType: Record<ProjectType, number>;
  totalBudget: number;
  totalSpent: number;
}
