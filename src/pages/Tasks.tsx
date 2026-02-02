import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { Task, TaskUser, TaskFormData, TaskFilters } from '../types/task';
import toast from 'react-hot-toast';

const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<TaskUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: 0,
    due_date: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await api.get('/api/tasks', { params: filters });
      setTasks(response.data);
    } catch (error) {
      toast.error(t('tasks.error.fetch'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      toast.error(t('tasks.error.fetchUsers'));
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/tasks', formData);
      toast.success(t('tasks.success.created'));
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        assigned_to: 0,
        due_date: '',
      });
      fetchTasks();
    } catch (error) {
      toast.error(t('tasks.error.create'));
    }
  };

  const handleStatusChange = async (taskId: number, newStatus: string) => {
    try {
      await api.patch(`/api/tasks/${taskId}`, { status: newStatus });
      toast.success(t('tasks.success.updated'));
      fetchTasks();
    } catch (error) {
      toast.error(t('tasks.error.update'));
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('tasks.title')}</h1>
          <p className="text-gray-600">{t('tasks.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {t('tasks.create')}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder={t('tasks.filters.search')}
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filters.status || ''}
            onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('tasks.filters.allStatuses')}</option>
            <option value="pending">{t('tasks.status.pending')}</option>
            <option value="in_progress">{t('tasks.status.inProgress')}</option>
            <option value="completed">{t('tasks.status.completed')}</option>
            <option value="cancelled">{t('tasks.status.cancelled')}</option>
          </select>
          <select
            value={filters.priority || ''}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value || undefined })}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{t('tasks.filters.allPriorities')}</option>
            <option value="urgent">{t('tasks.priority.urgent')}</option>
            <option value="high">{t('tasks.priority.high')}</option>
            <option value="medium">{t('tasks.priority.medium')}</option>
            <option value="low">{t('tasks.priority.low')}</option>
          </select>
          <button
            onClick={() => setFilters({})}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            {t('tasks.filters.clear')}
          </button>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.table.title')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.table.assignee')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.table.priority')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.table.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.table.dueDate')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('tasks.table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tasks.map((task) => (
                <tr key={task.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {users.find(u => u.id === task.assigned_to)?.full_name || t('tasks.unassigned')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                      {t(`tasks.priority.${task.priority}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full border-0 ${getStatusColor(task.status)}`}
                    >
                      <option value="pending">{t('tasks.status.pending')}</option>
                      <option value="in_progress">{t('tasks.status.inProgress')}</option>
                      <option value="completed">{t('tasks.status.completed')}</option>
                      <option value="cancelled">{t('tasks.status.cancelled')}</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">
                      {t('tasks.table.edit')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden space-y-3 p-4">
          {tasks.map((task) => (
            <div key={task.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2 ${getPriorityColor(task.priority)}`}>
                  {t(`tasks.priority.${task.priority}`)}
                </span>
              </div>
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t('tasks.table.assignee')}:</span>
                  <span className="text-xs text-gray-900">
                    {users.find(u => u.id === task.assigned_to)?.full_name || t('tasks.unassigned')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{t('tasks.table.dueDate')}:</span>
                  <span className="text-xs text-gray-900">
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <select
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                  className={`px-2 py-1 text-xs font-semibold rounded-full border-0 flex-1 mr-2 ${getStatusColor(task.status)}`}
                >
                  <option value="pending">{t('tasks.status.pending')}</option>
                  <option value="in_progress">{t('tasks.status.inProgress')}</option>
                  <option value="completed">{t('tasks.status.completed')}</option>
                  <option value="cancelled">{t('tasks.status.cancelled')}</option>
                </select>
                <button className="text-blue-600 hover:text-blue-900 text-xs font-medium">
                  {t('tasks.table.edit')}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{t('tasks.createTitle')}</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tasks.form.title')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tasks.form.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tasks.form.priority')}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">{t('tasks.priority.low')}</option>
                  <option value="medium">{t('tasks.priority.medium')}</option>
                  <option value="high">{t('tasks.priority.high')}</option>
                  <option value="urgent">{t('tasks.priority.urgent')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tasks.form.assignee')}
                </label>
                <select
                  value={formData.assigned_to}
                  onChange={(e) => setFormData({ ...formData, assigned_to: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">{t('tasks.selectAssignee')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('tasks.form.dueDate')}
                </label>
                <input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors w-full sm:w-auto"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
                >
                  {t('tasks.create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
