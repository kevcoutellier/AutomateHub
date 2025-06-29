import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Calendar,
  DollarSign,
  Plus,
  Edit3,
  Trash2,
  AlertTriangle,
  FileText,
  MessageSquare
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  amount: number;
  deliverables: string[];
  comments: Comment[];
  createdAt: string;
  completedAt?: string;
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface MilestoneTrackerProps {
  projectId: string;
  milestones: Milestone[];
  onUpdate: () => void;
  canEdit: boolean;
}

const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({ 
  projectId, 
  milestones, 
  onUpdate, 
  canEdit 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    amount: 0,
    deliverables: ['']
  });
  const [loading, setLoading] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiClient.post(`/projects/${projectId}/milestones`, {
        ...milestoneForm,
        deliverables: milestoneForm.deliverables.filter(d => d.trim())
      });

      setShowAddModal(false);
      setMilestoneForm({ title: '', description: '', dueDate: '', amount: 0, deliverables: [''] });
      onUpdate();
    } catch (error) {
      console.error('Error adding milestone:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMilestone = async (milestoneId: string, updates: Partial<Milestone>) => {
    try {
      await apiClient.put(`/projects/${projectId}/milestones/${milestoneId}`, updates);
      onUpdate();
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const handleDeleteMilestone = async (milestoneId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce jalon ?')) return;

    try {
      await apiClient.delete(`/projects/${projectId}/milestones/${milestoneId}`);
      onUpdate();
    } catch (error) {
      console.error('Error deleting milestone:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'overdue': return 'En retard';
      default: return 'En attente';
    }
  };

  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  const totalBudget = milestones.reduce((sum, m) => sum + m.amount, 0);
  const completedBudget = milestones
    .filter(m => m.status === 'completed')
    .reduce((sum, m) => sum + m.amount, 0);

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Progression des jalons</h3>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un jalon
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{calculateProgress()}%</div>
            <div className="text-sm text-gray-600">Progression</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{milestones.length}</div>
            <div className="text-sm text-gray-600">Jalons totaux</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{completedBudget.toLocaleString()}€</div>
            <div className="text-sm text-gray-600">Budget libéré</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div key={milestone.id} className="bg-white rounded-lg border">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(milestone.status)}
                    {index < milestones.length - 1 && (
                      <div className="w-px h-12 bg-gray-200 mt-2"></div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">{milestone.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(milestone.status)}`}>
                        {getStatusText(milestone.status)}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Échéance: {new Date(milestone.dueDate).toLocaleDateString('fr-FR')}
                      </div>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {milestone.amount.toLocaleString()}€
                      </div>
                      {milestone.deliverables.length > 0 && (
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 mr-1" />
                          {milestone.deliverables.length} livrable(s)
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {canEdit && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setExpandedMilestone(
                        expandedMilestone === milestone.id ? null : milestone.id
                      )}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingMilestone(milestone)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(milestone.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Expanded Details */}
              {expandedMilestone === milestone.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Livrables</h5>
                      <ul className="space-y-1">
                        {milestone.deliverables.map((deliverable, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-center">
                            <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">Commentaires</h5>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {milestone.comments.map((comment) => (
                          <div key={comment.id} className="text-sm">
                            <div className="font-medium text-gray-900">{comment.author}</div>
                            <div className="text-gray-600">{comment.content}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {milestones.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun jalon défini</h3>
          <p className="text-gray-600 mb-4">Commencez par créer des jalons pour structurer votre projet</p>
          {canEdit && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Créer le premier jalon
            </button>
          )}
        </div>
      )}

      {/* Add Milestone Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Ajouter un jalon</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddMilestone} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre du jalon
                </label>
                <input
                  type="text"
                  value={milestoneForm.title}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={milestoneForm.description}
                  onChange={(e) => setMilestoneForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'échéance
                  </label>
                  <input
                    type="date"
                    value={milestoneForm.dueDate}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant (€)
                  </label>
                  <input
                    type="number"
                    value={milestoneForm.amount}
                    onChange={(e) => setMilestoneForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Livrables
                </label>
                {milestoneForm.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={deliverable}
                      onChange={(e) => {
                        const newDeliverables = [...milestoneForm.deliverables];
                        newDeliverables[index] = e.target.value;
                        setMilestoneForm(prev => ({ ...prev, deliverables: newDeliverables }));
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Décrivez le livrable..."
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newDeliverables = milestoneForm.deliverables.filter((_, i) => i !== index);
                          setMilestoneForm(prev => ({ ...prev, deliverables: newDeliverables }));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setMilestoneForm(prev => ({ 
                    ...prev, 
                    deliverables: [...prev.deliverables, ''] 
                  }))}
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  + Ajouter un livrable
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Création...' : 'Créer le jalon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneTracker;
