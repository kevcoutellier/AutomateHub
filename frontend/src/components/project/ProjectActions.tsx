import React, { useState } from 'react';
import { 
  Edit2, 
  Trash2, 
  Play, 
  Pause, 
  CheckCircle, 
  X, 
  MoreVertical,
  FileText,
  DollarSign,
  Calendar
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { Project } from '../../types';

interface ProjectActionsProps {
  project: Project;
  onUpdate: () => void;
}

const ProjectActions: React.FC<ProjectActionsProps> = ({ project, onUpdate }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    title: project.title,
    description: project.description,
    budget: project.budget.total,
    currency: project.budget.currency || 'EUR',
    endDate: project.endDate ? project.endDate.split('T')[0] : ''
  });
  const [newProgress, setNewProgress] = useState(project.progress || 0);

  const canEdit = true; // TODO: Check user permissions
  const canUpdateProgress = true; // TODO: Check if user is expert
  const canChangeStatus = true; // TODO: Check permissions

  const handleStatusChange = async (newStatus: string) => {
    try {
      setLoading(true);
      await apiClient.updateProject(project.id, { status: newStatus });
      onUpdate();
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating project status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.updateProject(project.id, {
        title: editForm.title,
        description: editForm.description,
        budget: {
          total: editForm.budget,
          currency: editForm.currency
        },
        endDate: editForm.endDate || undefined
      });
      onUpdate();
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProgressUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.updateProjectProgress(project.id, newProgress);
      onUpdate();
      setShowProgressModal(false);
    } catch (error) {
      console.error('Error updating progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
      return;
    }

    try {
      setLoading(true);
      await apiClient.deleteProject(project.id);
      // Redirect to dashboard or projects list
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusActions = () => {
    const actions = [];
    
    switch (project.status) {
      case 'pending':
        actions.push(
          { label: 'Démarrer le projet', status: 'in-progress', icon: Play, color: 'text-green-600' }
        );
        break;
      case 'in-progress':
        actions.push(
          { label: 'Mettre en pause', status: 'paused', icon: Pause, color: 'text-yellow-600' },
          { label: 'Marquer comme terminé', status: 'completed', icon: CheckCircle, color: 'text-green-600' }
        );
        break;
      case 'paused':
        actions.push(
          { label: 'Reprendre', status: 'in-progress', icon: Play, color: 'text-green-600' },
          { label: 'Marquer comme terminé', status: 'completed', icon: CheckCircle, color: 'text-green-600' }
        );
        break;
      case 'completed':
        actions.push(
          { label: 'Rouvrir le projet', status: 'in-progress', icon: Play, color: 'text-blue-600' }
        );
        break;
    }

    if (project.status !== 'cancelled') {
      actions.push(
        { label: 'Annuler le projet', status: 'cancelled', icon: X, color: 'text-red-600' }
      );
    }

    return actions;
  };

  return (
    <div className="relative">
      {/* Main Actions Button */}
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-md"
        disabled={loading}
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {/* Actions Menu */}
      {showMenu && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            {/* Edit Project */}
            {canEdit && (
              <button
                onClick={() => {
                  setShowEditModal(true);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <Edit2 className="h-4 w-4 mr-3" />
                Modifier le projet
              </button>
            )}

            {/* Update Progress */}
            {canUpdateProgress && project.status === 'in-progress' && (
              <button
                onClick={() => {
                  setShowProgressModal(true);
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <FileText className="h-4 w-4 mr-3" />
                Mettre à jour la progression
              </button>
            )}

            <div className="border-t border-gray-100 my-1"></div>

            {/* Status Actions */}
            {canChangeStatus && getStatusActions().map((action) => (
              <button
                key={action.status}
                onClick={() => handleStatusChange(action.status)}
                className={`flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 ${action.color}`}
              >
                <action.icon className="h-4 w-4 mr-3" />
                {action.label}
              </button>
            ))}

            <div className="border-t border-gray-100 my-1"></div>

            {/* Delete Project */}
            {canEdit && (
              <button
                onClick={() => {
                  handleDeleteProject();
                  setShowMenu(false);
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Supprimer le projet
              </button>
            )}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Modifier le projet</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du projet
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget
                  </label>
                  <input
                    type="number"
                    value={editForm.budget}
                    onChange={(e) => setEditForm(prev => ({ ...prev, budget: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Devise
                  </label>
                  <select
                    value={editForm.currency}
                    onChange={(e) => setEditForm(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="EUR">EUR</option>
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de fin prévue
                </label>
                <input
                  type="date"
                  value={editForm.endDate}
                  onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Progress Update Modal */}
      {showProgressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Mettre à jour la progression</h3>
            
            <form onSubmit={handleProgressUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progression ({newProgress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgress}
                  onChange={(e) => setNewProgress(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progression actuelle</span>
                  <span className="text-sm text-gray-500">{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-gray-400 h-2 rounded-full" 
                    style={{ width: `${project.progress || 0}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Nouvelle progression</span>
                  <span className="text-sm text-gray-500">{newProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${newProgress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Mise à jour...' : 'Mettre à jour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        ></div>
      )}
    </div>
  );
};

export default ProjectActions;
