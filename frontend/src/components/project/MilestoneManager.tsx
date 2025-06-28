import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Edit2, 
  Trash2,
  FileText,
  Target
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { Milestone } from '../../types';

interface MilestoneManagerProps {
  projectId: string;
  milestones: Milestone[];
  onUpdate: () => void;
  canEdit: boolean;
}

const MilestoneManager: React.FC<MilestoneManagerProps> = ({
  projectId,
  milestones,
  onUpdate,
  canEdit
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    deliverables: ['']
  });
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      deliverables: ['']
    });
    setShowCreateForm(false);
    setEditingMilestone(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.dueDate) return;

    try {
      setLoading(true);
      const milestoneData = {
        ...formData,
        deliverables: formData.deliverables.filter(d => d.trim())
      };

      if (editingMilestone) {
        await apiClient.updateMilestone(editingMilestone.id, milestoneData);
      } else {
        await apiClient.addMilestone(projectId, milestoneData);
      }

      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Error saving milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setFormData({
      title: milestone.title,
      description: milestone.description || '',
      dueDate: milestone.dueDate.split('T')[0],
      deliverables: milestone.deliverables?.length ? milestone.deliverables : ['']
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (milestoneId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce jalon ?')) return;

    try {
      await apiClient.deleteMilestone(milestoneId);
      onUpdate();
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const handleMarkComplete = async (milestoneId: string) => {
    try {
      await apiClient.updateMilestone(milestoneId, { status: 'completed' });
      onUpdate();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const addDeliverable = () => {
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, '']
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.map((d, i) => i === index ? value : d)
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const getStatusIcon = (status: string, dueDate: string) => {
    const isOverdue = new Date(dueDate) < new Date() && status !== 'completed';
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return isOverdue ? 
          <AlertCircle className="h-5 w-5 text-red-500" /> :
          <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return isOverdue ? 
          <AlertCircle className="h-5 w-5 text-red-500" /> :
          <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      default: return status;
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => 
    new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Jalons du projet</h2>
          <p className="text-gray-600">
            {milestones.filter(m => m.status === 'completed').length} sur {milestones.length} terminés
          </p>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter un jalon</span>
          </button>
        )}
      </div>

      {/* Progress Overview */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Progression globale</h3>
          <span className="text-sm text-gray-500">
            {milestones.length > 0 ? 
              Math.round((milestones.filter(m => m.status === 'completed').length / milestones.length) * 100) : 0
            }%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
            style={{ 
              width: `${milestones.length > 0 ? 
                (milestones.filter(m => m.status === 'completed').length / milestones.length) * 100 : 0
              }%` 
            }}
          ></div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {sortedMilestones.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun jalon défini</h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer des jalons pour structurer votre projet.
            </p>
            {canEdit && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Créer le premier jalon
              </button>
            )}
          </div>
        ) : (
          sortedMilestones.map((milestone) => {
            const isOverdue = new Date(milestone.dueDate) < new Date() && milestone.status !== 'completed';
            
            return (
              <div key={milestone.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(milestone.status, milestone.dueDate)}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-medium text-gray-900">{milestone.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          milestone.status === 'completed' ? 'bg-green-100 text-green-800' :
                          milestone.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {getStatusText(milestone.status)}
                        </span>
                        {isOverdue && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            En retard
                          </span>
                        )}
                      </div>
                      
                      {milestone.description && (
                        <p className="text-gray-600 mt-2">{milestone.description}</p>
                      )}
                      
                      <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Échéance: {new Date(milestone.dueDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {milestone.deliverables && milestone.deliverables.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{milestone.deliverables.length} livrable(s)</span>
                          </div>
                        )}
                      </div>

                      {/* Deliverables */}
                      {milestone.deliverables && milestone.deliverables.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Livrables:</h4>
                          <ul className="space-y-1">
                            {milestone.deliverables.map((deliverable, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center space-x-2">
                                <div className="h-1.5 w-1.5 bg-gray-400 rounded-full"></div>
                                <span>{deliverable}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex items-center space-x-2 ml-4">
                      {milestone.status !== 'completed' && (
                        <button
                          onClick={() => handleMarkComplete(milestone.id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          title="Marquer comme terminé"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(milestone)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-md"
                        title="Modifier"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(milestone.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingMilestone ? 'Modifier le jalon' : 'Créer un nouveau jalon'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date d'échéance *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Livrables
                  </label>
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    + Ajouter
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.deliverables.map((deliverable, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={deliverable}
                        onChange={(e) => updateDeliverable(index, e.target.value)}
                        placeholder="Description du livrable"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {formData.deliverables.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDeliverable(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editingMilestone ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneManager;
