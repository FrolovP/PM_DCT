import React, { useState } from 'react';
import { Project, Task, TaskStatus, TaskPriority, Document, Artifact, StructureNode, KBEntry, KBAccess, ProjectOffice, CrossOfficeLink, LinkType } from './types';
import {
  PROJECT_TYPE_LABELS, PROJECT_STATUS_LABELS, PROJECT_PRIORITY_LABELS,
  TASK_STATUS_LABELS, TASK_STATUS_COLORS, DOC_CATEGORY_LABELS,
  ARTIFACT_TYPE_LABELS, STRUCTURE_TYPE_LABELS, STRUCTURE_TYPE_COLORS,
  TYPE_BG_COLORS, STATUS_COLORS, PRIORITY_COLORS, LINK_TYPE_LABELS,
  formatCurrency, generateId,
} from './utils';

interface ProjectDetailViewProps {
  project: Project;
  allProjects: Project[];
  offices: ProjectOffice[];
  onClose: () => void;
  onUpdate: (project: Project) => void;
  onUpdateAll: (projects: Project[]) => void;
}

type Tab = 'overview' | 'structure' | 'tasks' | 'documents' | 'artifacts' | 'links' | 'crosslinks' | 'knowledge';

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({ project, allProjects, offices, onClose, onUpdate, onUpdateAll }) => {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [showArtifactForm, setShowArtifactForm] = useState(false);
  const [showKBForm, setShowKBForm] = useState(false);
  const [showStructureForm, setShowStructureForm] = useState(false);
  const [showCrossLinkForm, setShowCrossLinkForm] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  const currentOffice = offices.find(o => o.id === project.officeId);

  // Count cross-office links
  const crossLinksCount = project.links.filter(l => l.targetOfficeId !== project.officeId).length +
    project.tasks.reduce((sum, t) => sum + (t.crossOfficeLinks?.length || 0), 0);

  const tabs: { key: Tab; label: string; icon: string; count?: number }[] = [
    { key: 'overview', label: 'Обзор', icon: '📋' },
    { key: 'structure', label: 'Структура', icon: '🏗️', count: project.structure.length },
    { key: 'tasks', label: 'Задачи', icon: '✅', count: project.tasks.length },
    { key: 'documents', label: 'Документы', icon: '📄', count: project.documents.length },
    { key: 'artifacts', label: 'Артефакты', icon: '📦', count: project.artifacts.length },
    { key: 'links', label: 'Связи', icon: '🔗', count: project.links.length },
    { key: 'crosslinks', label: 'Межофисные', icon: '🌐', count: crossLinksCount },
    { key: 'knowledge', label: 'База знаний', icon: '📚', count: project.knowledgeBase.length },
  ];

  const addTask = (task: Task) => {
    const updated = { ...project, tasks: [...project.tasks, task] };
    onUpdate(updated);
    setShowTaskForm(false);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updated = {
      ...project,
      tasks: project.tasks.map(t => t.id === taskId ? { ...t, status, completed: status === 'done' } : t)
    };
    const completedCount = updated.tasks.filter(t => t.completed).length;
    updated.progress = updated.tasks.length > 0 ? Math.round((completedCount / updated.tasks.length) * 100) : project.progress;
    onUpdate(updated);
  };

  const deleteTask = (taskId: string) => {
    const updated = { ...project, tasks: project.tasks.filter(t => t.id !== taskId) };
    onUpdate(updated);
  };

  const addDocument = (doc: Document) => {
    onUpdate({ ...project, documents: [...project.documents, doc] });
    setShowDocForm(false);
  };

  const deleteDocument = (docId: string) => {
    onUpdate({ ...project, documents: project.documents.filter(d => d.id !== docId) });
  };

  const addArtifact = (artifact: Artifact) => {
    onUpdate({ ...project, artifacts: [...project.artifacts, artifact] });
    setShowArtifactForm(false);
  };

  const deleteArtifact = (artifactId: string) => {
    onUpdate({ ...project, artifacts: project.artifacts.filter(a => a.id !== artifactId) });
  };

  const addKBEntry = (entry: KBEntry) => {
    onUpdate({ ...project, knowledgeBase: [...project.knowledgeBase, entry] });
    setShowKBForm(false);
  };

  const deleteKBEntry = (entryId: string) => {
    onUpdate({ ...project, knowledgeBase: project.knowledgeBase.filter(k => k.id !== entryId) });
  };

  const addStructureNode = (node: StructureNode) => {
    onUpdate({ ...project, structure: [...project.structure, node] });
    setShowStructureForm(false);
  };

  const addCrossOfficeLink = (linkType: LinkType, targetProjectId: string, description: string, taskId?: string) => {
    const targetProject = allProjects.find(p => p.id === targetProjectId);
    if (!targetProject) return;
    const targetOffice = offices.find(o => o.id === targetProject.officeId);

    if (taskId) {
      // Add cross-office link to a task
      const crossLink: CrossOfficeLink = {
        id: generateId(),
        targetProjectId,
        targetProjectName: targetProject.name,
        targetOfficeId: targetProject.officeId,
        targetOfficeName: targetOffice?.name || '',
        linkType,
        description,
      };
      const updated = {
        ...project,
        tasks: project.tasks.map(t => t.id === taskId ? {
          ...t,
          crossOfficeLinks: [...(t.crossOfficeLinks || []), crossLink]
        } : t)
      };
      onUpdate(updated);
    } else {
      // Add project-level link
      const updated = {
        ...project,
        links: [...project.links, {
          id: generateId(),
          targetProjectId,
          targetProjectName: targetProject.name,
          targetOfficeId: targetProject.officeId,
          targetOfficeName: targetOffice?.name || '',
          linkType,
          description,
        }]
      };
      onUpdate(updated);
    }
    setShowCrossLinkForm(false);
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  // Get projects from other offices
  const otherOfficeProjects = allProjects.filter(p => p.officeId !== project.officeId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                {currentOffice && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: currentOffice.color + '20', color: currentOffice.color }}>
                    {currentOffice.icon} {currentOffice.name}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-900 truncate">{project.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Руководитель: {project.manager}</p>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0 ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${TYPE_BG_COLORS[project.type]}`}>
              {PROJECT_TYPE_LABELS[project.type]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[project.status]}`}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${PRIORITY_COLORS[project.priority]}`}>
              {PROJECT_PRIORITY_LABELS[project.priority]}
            </span>
            {crossLinksCount > 0 && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                🌐 {crossLinksCount} межофисных связей
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100 px-4 sm:px-6 overflow-x-auto shrink-0">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 px-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1.5 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">{tab.count}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'overview' && (
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
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium text-gray-500">Прогресс</h4>
                  <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all duration-500 ${project.progress === 100 ? 'bg-green-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${project.progress}%` }}></div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">{project.tasks.length}</p>
                  <p className="text-xs text-blue-600">Задач</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-green-700">{project.documents.length}</p>
                  <p className="text-xs text-green-600">Документов</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-purple-700">{project.artifacts.length}</p>
                  <p className="text-xs text-purple-600">Артефактов</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-amber-700">{project.structure.length}</p>
                  <p className="text-xs text-amber-600">Элементов WBS</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-indigo-700">{project.knowledgeBase.length}</p>
                  <p className="text-xs text-indigo-600">Записей БЗ</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Структура проекта (WBS)</h3>
                <button onClick={() => setShowStructureForm(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Добавить</button>
              </div>
              {project.structure.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Структура не определена</p>
              ) : (
                <div className="space-y-2">
                  {project.structure.map(node => (
                    <StructureNodeView key={node.id} node={node} depth={0} expandedNodes={expandedNodes} toggleNode={toggleNode} />
                  ))}
                </div>
              )}
              {showStructureForm && (
                <InlineForm onClose={() => setShowStructureForm(false)} onSubmit={(data) => {
                  addStructureNode({ id: generateId(), title: data.title, type: data.type as any, children: [], progress: 0, startDate: data.startDate || '', endDate: data.endDate || '' });
                }} fields={[
                  { name: 'title', label: 'Название', type: 'text', required: true },
                  { name: 'type', label: 'Тип', type: 'select', options: Object.entries(STRUCTURE_TYPE_LABELS) },
                  { name: 'startDate', label: 'Начало', type: 'date' },
                  { name: 'endDate', label: 'Окончание', type: 'date' },
                ]} />
              )}
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Задачи проекта</h3>
                <button onClick={() => setShowTaskForm(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Новая задача</button>
              </div>
              {project.tasks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Задачи не добавлены</p>
              ) : (
                <div className="space-y-2">
                  {project.tasks.map(task => (
                    <div key={task.id} className={`p-3 rounded-lg border transition-colors ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
                      <div className="flex items-start gap-3">
                        <input type="checkbox" checked={task.completed} onChange={() => updateTaskStatus(task.id, task.completed ? 'todo' : 'done')} className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>{task.title}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <select value={task.status} onChange={e => updateTaskStatus(task.id, e.target.value as TaskStatus)} className={`text-xs px-2 py-0.5 rounded-md font-medium border-0 ${TASK_STATUS_COLORS[task.status]}`}>
                              {Object.entries(TASK_STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                            {task.assignee && <span className="text-xs text-gray-500">👤 {task.assignee}</span>}
                            {task.dueDate && <span className="text-xs text-gray-500">📅 {task.dueDate}</span>}
                          </div>
                          {/* Cross-office links on task */}
                          {task.crossOfficeLinks && task.crossOfficeLinks.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {task.crossOfficeLinks.map(cl => (
                                <span key={cl.id} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 bg-purple-50 text-purple-700 rounded border border-purple-200">
                                  🌐 {cl.targetOfficeName}: {cl.targetProjectName}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showTaskForm && (
                <InlineForm onClose={() => setShowTaskForm(false)} onSubmit={(data) => {
                  addTask({ id: generateId(), title: data.title, description: data.description || '', status: 'todo', priority: (data.priority || 'medium') as TaskPriority, assignee: data.assignee || '', dueDate: data.dueDate || '', completed: false, tags: [], subtasks: [], crossOfficeLinks: [] });
                }} fields={[
                  { name: 'title', label: 'Название задачи', type: 'text', required: true },
                  { name: 'description', label: 'Описание', type: 'textarea' },
                  { name: 'assignee', label: 'Исполнитель', type: 'text' },
                  { name: 'priority', label: 'Приоритет', type: 'select', options: [['low','Низкий'],['medium','Средний'],['high','Высокий'],['critical','Критический']] },
                  { name: 'dueDate', label: 'Срок', type: 'date' },
                ]} />
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Документы</h3>
                <button onClick={() => setShowDocForm(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Добавить</button>
              </div>
              {project.documents.length === 0 ? <p className="text-gray-500 text-center py-8">Документы не добавлены</p> : (
                <div className="grid gap-3">
                  {project.documents.map(doc => (
                    <div key={doc.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center shrink-0"><span className="text-lg">📄</span></div>
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900">{doc.title}</h4>
                            <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">{DOC_CATEGORY_LABELS[doc.category]}</span>
                              <span className="text-xs text-gray-500">v{doc.version}</span>
                              <span className="text-xs text-gray-500">👤 {doc.author}</span>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => deleteDocument(doc.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showDocForm && (
                <InlineForm onClose={() => setShowDocForm(false)} onSubmit={(data) => {
                  addDocument({ id: generateId(), title: data.title, category: (data.category || 'other') as any, description: data.description || '', author: data.author || '', createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0], version: data.version || '1.0', tags: (data.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean), content: data.content || '' });
                }} fields={[
                  { name: 'title', label: 'Название', type: 'text', required: true },
                  { name: 'category', label: 'Категория', type: 'select', options: Object.entries(DOC_CATEGORY_LABELS) },
                  { name: 'description', label: 'Описание', type: 'textarea' },
                  { name: 'author', label: 'Автор', type: 'text' },
                  { name: 'version', label: 'Версия', type: 'text' },
                  { name: 'tags', label: 'Теги (через запятую)', type: 'text' },
                ]} />
              )}
            </div>
          )}

          {activeTab === 'artifacts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Артефакты проекта</h3>
                <button onClick={() => setShowArtifactForm(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Добавить</button>
              </div>
              {project.artifacts.length === 0 ? <p className="text-gray-500 text-center py-8">Артефакты не добавлены</p> : (
                <div className="grid gap-3 md:grid-cols-2">
                  {project.artifacts.map(art => (
                    <div key={art.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{art.type === 'design' ? '🎨' : art.type === 'code' ? '💻' : art.type === 'test' ? '🧪' : art.type === 'deployment' ? '🚀' : art.type === 'documentation' ? '📖' : '📦'}</span>
                            <h4 className="text-sm font-semibold text-gray-900">{art.title}</h4>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{art.description}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">{ARTIFACT_TYPE_LABELS[art.type]}</span>
                            <span className="text-xs text-gray-500">v{art.version}</span>
                          </div>
                        </div>
                        <button onClick={() => deleteArtifact(art.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showArtifactForm && (
                <InlineForm onClose={() => setShowArtifactForm(false)} onSubmit={(data) => {
                  addArtifact({ id: generateId(), title: data.title, type: (data.type || 'other') as any, description: data.description || '', author: data.author || '', createdAt: new Date().toISOString().split('T')[0], version: data.version || '1.0', tags: (data.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean), relatedTasks: [] });
                }} fields={[
                  { name: 'title', label: 'Название', type: 'text', required: true },
                  { name: 'type', label: 'Тип', type: 'select', options: Object.entries(ARTIFACT_TYPE_LABELS) },
                  { name: 'description', label: 'Описание', type: 'textarea' },
                  { name: 'author', label: 'Автор', type: 'text' },
                  { name: 'version', label: 'Версия', type: 'text' },
                  { name: 'tags', label: 'Теги', type: 'text' },
                ]} />
              )}
            </div>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Связи проекта</h3>
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-6 border border-indigo-100">
                <div className="flex flex-col items-center">
                  <div className="bg-white rounded-xl shadow-md border-2 border-indigo-300 p-4 text-center max-w-xs">
                    <p className="text-sm font-bold text-indigo-700">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{currentOffice?.name}</p>
                  </div>
                  {project.links.length === 0 ? (
                    <p className="text-gray-500 text-sm mt-6">Связи не определены</p>
                  ) : (
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      {project.links.map(link => {
                        const targetOffice = offices.find(o => o.id === link.targetOfficeId);
                        const isCrossOffice = link.targetOfficeId !== project.officeId;
                        return (
                          <div key={link.id} className="relative">
                            <div className={`bg-white rounded-lg shadow-sm border p-3 ${isCrossOffice ? 'border-purple-300 bg-purple-50/50' : 'border-gray-200'}`}>
                              <div className="flex items-center gap-2 mb-1">
                                {isCrossOffice && <span className="text-xs">🌐</span>}
                                <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">{LINK_TYPE_LABELS[link.linkType]}</span>
                              </div>
                              <p className="text-sm font-medium text-gray-900">{link.targetProjectName}</p>
                              <p className="text-xs text-gray-500">{targetOffice?.icon} {link.targetOfficeName}</p>
                              {link.description && <p className="text-xs text-gray-500 mt-1">{link.description}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'crosslinks' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">🌐 Межофисные связи</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Связи с проектами из других проектных офисов через задачи</p>
                </div>
                <button onClick={() => setShowCrossLinkForm(true)} className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700">+ Создать связь</button>
              </div>

              {/* Cross-office links from project links */}
              {project.links.filter(l => l.targetOfficeId !== project.officeId).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Связи на уровне проекта:</h4>
                  <div className="space-y-2">
                    {project.links.filter(l => l.targetOfficeId !== project.officeId).map(link => {
                      const targetOffice = offices.find(o => o.id === link.targetOfficeId);
                      return (
                        <div key={link.id} className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{targetOffice?.icon}</span>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{link.targetProjectName}</p>
                              <p className="text-xs text-gray-500">{targetOffice?.name} • {LINK_TYPE_LABELS[link.linkType]}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Cross-office links from tasks */}
              {project.tasks.filter(t => t.crossOfficeLinks && t.crossOfficeLinks.length > 0).length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Связи через задачи:</h4>
                  <div className="space-y-2">
                    {project.tasks.filter(t => t.crossOfficeLinks && t.crossOfficeLinks.length > 0).map(task => (
                      <div key={task.id} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-2">📋 {task.title}</p>
                        <div className="space-y-1 ml-4">
                          {task.crossOfficeLinks?.map(cl => {
                            const targetOffice = offices.find(o => o.id === cl.targetOfficeId);
                            return (
                              <div key={cl.id} className="flex items-center gap-2 text-xs p-2 bg-purple-50 rounded">
                                <span>{targetOffice?.icon}</span>
                                <span className="text-gray-700">{cl.targetProjectName}</span>
                                <span className="text-gray-400">({cl.targetOfficeName})</span>
                                <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">{LINK_TYPE_LABELS[cl.linkType]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {crossLinksCount === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl">🌐</span>
                  <p className="text-gray-500 mt-2">Межофисных связей пока нет</p>
                  <p className="text-xs text-gray-400 mt-1">Создайте связь с проектом из другого офиса</p>
                </div>
              )}

              {showCrossLinkForm && (
                <CrossLinkForm
                  otherProjects={otherOfficeProjects}
                  offices={offices}
                  tasks={project.tasks}
                  onSubmit={(linkType, targetProjectId, description, taskId) => {
                    addCrossOfficeLink(linkType, targetProjectId, description, taskId);
                  }}
                  onClose={() => setShowCrossLinkForm(false)}
                />
              )}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">База знаний проекта</h3>
                <button onClick={() => setShowKBForm(true)} className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700">+ Новая запись</button>
              </div>
              {project.knowledgeBase.length === 0 ? <p className="text-gray-500 text-center py-8">Записи не добавлены</p> : (
                <div className="space-y-3">
                  {project.knowledgeBase.map(entry => (
                    <div key={entry.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-gray-900">{entry.title}</h4>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${entry.access === 'public' ? 'bg-green-100 text-green-700' : entry.access === 'restricted' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>
                              {entry.access === 'public' ? '🌐' : entry.access === 'restricted' ? '🔒' : '🔐'}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{entry.category} • {entry.author} • {entry.updatedAt}</p>
                          <p className="text-sm text-gray-700 mt-2 whitespace-pre-line">{entry.content}</p>
                        </div>
                        <button onClick={() => deleteKBEntry(entry.id)} className="p-1 text-gray-400 hover:text-red-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showKBForm && (
                <InlineForm onClose={() => setShowKBForm(false)} onSubmit={(data) => {
                  addKBEntry({ id: generateId(), title: data.title, content: data.content || '', category: data.category || 'Общее', tags: (data.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean), author: data.author || '', createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0], access: (data.access || 'public') as KBAccess, relatedProjects: [project.id] });
                }} fields={[
                  { name: 'title', label: 'Заголовок', type: 'text', required: true },
                  { name: 'content', label: 'Содержание', type: 'textarea', required: true },
                  { name: 'category', label: 'Категория', type: 'text' },
                  { name: 'author', label: 'Автор', type: 'text' },
                  { name: 'tags', label: 'Теги', type: 'text' },
                  { name: 'access', label: 'Доступ', type: 'select', options: [['public','Публичная'],['restricted','Ограниченная'],['private','Приватная']] },
                ]} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Cross-Link Form
const CrossLinkForm: React.FC<{
  otherProjects: Project[];
  offices: ProjectOffice[];
  tasks: Task[];
  onSubmit: (linkType: LinkType, targetProjectId: string, description: string, taskId?: string) => void;
  onClose: () => void;
}> = ({ otherProjects, offices, tasks, onSubmit, onClose }) => {
  const [data, setData] = useState({ linkType: 'dependency' as LinkType, targetProjectId: '', description: '', taskId: '' });

  const targetProject = otherProjects.find(p => p.id === data.targetProjectId);
  const targetOffice = targetProject ? offices.find(o => o.id === targetProject.officeId) : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">🌐 Межофисная связь</h3>
          <p className="text-sm text-gray-500 mt-1">Создание связи с проектом из другого офиса</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data.linkType, data.targetProjectId, data.description, data.taskId || undefined); }} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип связи</label>
            <select value={data.linkType} onChange={e => setData({ ...data, linkType: e.target.value as LinkType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              {Object.entries(LINK_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Целевой проект (другой офис) *</label>
            <select required value={data.targetProjectId} onChange={e => setData({ ...data, targetProjectId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">Выберите проект...</option>
              {offices.filter(o => o.id !== (targetProject?.officeId || '')).map(office => (
                <optgroup key={office.id} label={`${office.icon} ${office.name}`}>
                  {otherProjects.filter(p => p.officeId === office.id).map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            {targetOffice && (
              <p className="text-xs text-gray-500 mt-1">Офис: {targetOffice.icon} {targetOffice.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Привязать к задаче (опционально)</label>
            <select value={data.taskId} onChange={e => setData({ ...data, taskId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option value="">На уровне проекта</option>
              {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea rows={2} value={data.description} onChange={e => setData({ ...data, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Описание связи..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Отмена</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700" disabled={!data.targetProjectId}>Создать связь</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Structure Node View
const StructureNodeView: React.FC<{ node: StructureNode; depth: number; expandedNodes: Set<string>; toggleNode: (id: string) => void }> = ({ node, depth, expandedNodes, toggleNode }) => {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const icon = node.type === 'phase' ? '📁' : node.type === 'milestone' ? '🏁' : node.type === 'work_package' ? '📋' : '📦';

  return (
    <div style={{ marginLeft: depth * 24 }}>
      <div className={`flex items-center gap-2 p-2.5 rounded-lg border ${STRUCTURE_TYPE_COLORS[node.type]} hover:shadow-sm transition-shadow`}>
        {hasChildren ? (
          <button onClick={() => toggleNode(node.id)} className="p-0.5 hover:bg-black/5 rounded">
            <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        ) : <div className="w-5" />}
        <span>{icon}</span>
        <span className="text-sm font-medium flex-1">{node.title}</span>
        <span className="text-xs px-1.5 py-0.5 bg-white/50 rounded">{STRUCTURE_TYPE_LABELS[node.type]}</span>
        <div className="w-16 bg-white/50 rounded-full h-1.5"><div className="h-1.5 rounded-full bg-current opacity-60" style={{ width: `${node.progress}%` }}></div></div>
        <span className="text-xs font-medium w-8 text-right">{node.progress}%</span>
      </div>
      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {node.children.map(child => <StructureNodeView key={child.id} node={child} depth={depth + 1} expandedNodes={expandedNodes} toggleNode={toggleNode} />)}
        </div>
      )}
    </div>
  );
};

// Inline Form
interface InlineFormProps {
  fields: { name: string; label: string; type: string; required?: boolean; options?: [string, string][] }[];
  onSubmit: (data: Record<string, string>) => void;
  onClose: () => void;
}

const InlineForm: React.FC<InlineFormProps> = ({ fields, onSubmit, onClose }) => {
  const [data, setData] = useState<Record<string, string>>({});

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map(field => (
          <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}{field.required && ' *'}</label>
            {field.type === 'textarea' ? (
              <textarea rows={3} required={field.required} value={data[field.name] || ''} onChange={e => setData({ ...data, [field.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            ) : field.type === 'select' ? (
              <select value={data[field.name] || ''} onChange={e => setData({ ...data, [field.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                <option value="">Выберите...</option>
                {field.options?.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            ) : (
              <input type={field.type} required={field.required} value={data[field.name] || ''} onChange={e => setData({ ...data, [field.name]: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100">Отмена</button>
        <button type="submit" className="px-3 py-1.5 text-sm text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Добавить</button>
      </div>
    </form>
  );
};
