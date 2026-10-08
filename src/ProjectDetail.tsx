import React, { useState } from 'react';
import { Project } from './types';
import {
  PROJECT_TYPE_LABELS,
  PROJECT_STATUS_LABELS,
  PROJECT_PRIORITY_LABELS,
  TYPE_BG_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  formatCurrency,
} from './utils';

interface ProjectDetailProps {
  project: Project;
  onClose: () => void;
  onUpdateTask: (projectId: string, taskId: string, completed: boolean) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onClose, onUpdateTask }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'tasks'>('info');
  const completedTasks = project.tasks.filter(t => t.completed).length;
  const totalTasks = project.tasks.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Руководитель: {project.manager}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${TYPE_BG_COLORS[project.type]}`}>
              {PROJECT_TYPE_LABELS[project.type]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[project.status]}`}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
              Приоритет: {PROJECT_PRIORITY_LABELS[project.priority]}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'info'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Информация
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'tasks'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Задачи ({completedTasks}/{totalTasks})
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Описание</h4>
                <p className="text-gray-700">{project.description || '—'}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Дата начала</p>
                  <p className="text-sm font-semibold text-gray-900">{project.startDate || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Дата окончания</p>
                  <p className="text-sm font-semibold text-gray-900">{project.endDate || '—'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Бюджет</p>
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(project.budget)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Освоено</p>
                  <p className="text-sm font-semibold text-amber-600">{formatCurrency(project.spent)}</p>
                </div>
              </div>

              {/* Progress */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-500">Прогресс выполнения</h4>
                  <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                      project.progress === 100 ? 'bg-green-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Budget bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-500">Освоение бюджета</h4>
                  <span className="text-sm font-semibold text-gray-700">
                    {project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-500"
                    style={{ width: `${project.budget > 0 ? Math.min((project.spent / project.budget) * 100, 100) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-2">
              {project.tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Задачи не добавлены</p>
              ) : (
                project.tasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => onUpdateTask(project.id, task.id, !task.completed)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <span className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {task.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
