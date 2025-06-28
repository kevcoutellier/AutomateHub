import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  MessageSquare, 
  CheckCircle, 
  AlertCircle,
  Plus,
  FileText,
  Star
} from 'lucide-react';
import { apiClient } from '../services/api';
import { Project, Milestone, Message } from '../types';
import ProjectMessaging from '../components/project/ProjectMessaging';
import MilestoneManager from '../components/project/MilestoneManager';
import ProgressTracker from '../components/project/ProgressTracker';
import ProjectActions from '../components/project/ProjectActions';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'messages'>('overview');

  useEffect(() => {
    if (id) {
      loadProjectData();
    }
  }, [id]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      const [projectResponse, milestonesResponse, messagesResponse] = await Promise.all([
        apiClient.getProject(id!),
        apiClient.getProjectMilestones(id!),
        apiClient.getProjectMessages(id!)
      ]);

      setProject(projectResponse.data.project);
      setMilestones(milestonesResponse.data.milestones || []);
      setMessages(messagesResponse.data.messages || []);
    } catch (err) {
      setError('Erreur lors du chargement du projet');
      console.error('Error loading project:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMilestoneUpdate = () => {
    loadProjectData();
  };

  const handleMessageSent = () => {
    loadProjectData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in-progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Terminé';
      case 'in-progress': return 'En cours';
      case 'pending': return 'En attente';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Projet introuvable</h2>
          <p className="text-gray-600 mb-4">{error || 'Le projet demandé n\'existe pas.'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <div className="mt-2 flex items-center space-x-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Créé le {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              <ProjectActions project={project} onUpdate={loadProjectData} />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: FileText },
              { id: 'milestones', label: 'Jalons', icon: CheckCircle },
              { id: 'messages', label: 'Messages', icon: MessageSquare }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`${
                  activeTab === id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Description du projet</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </div>

              {/* Progress Tracker */}
              <ProgressTracker project={project} milestones={milestones} />

              {/* Recent Messages */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Messages récents</h3>
                  <button
                    onClick={() => setActiveTab('messages')}
                    className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                  >
                    Voir tous
                  </button>
                </div>
                <div className="space-y-3">
                  {messages.slice(0, 3).map((message) => (
                    <div key={message.id} className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {message.sender.firstName} {message.sender.lastName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{message.content}</p>
                      </div>
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <p className="text-gray-500 text-sm">Aucun message pour le moment.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informations</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Budget</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {project.budget.total.toLocaleString('fr-FR')} {project.budget.currency || 'EUR'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de début</dt>
                    <dd className="text-sm text-gray-900 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(project.startDate).toLocaleDateString('fr-FR')}
                    </dd>
                  </div>
                  {project.endDate && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date de fin prévue</dt>
                      <dd className="text-sm text-gray-900 flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.endDate).toLocaleDateString('fr-FR')}
                      </dd>
                    </div>
                  )}
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Progression</dt>
                    <dd className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full" 
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                        <span>{project.progress || 0}%</span>
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Expert Info */}
              {project.expert && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Expert assigné</h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {project.expert.avatar ? (
                        <img 
                          className="h-10 w-10 rounded-full" 
                          src={project.expert.avatar} 
                          alt={`${project.expert.firstName} ${project.expert.lastName}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {project.expert.firstName} {project.expert.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{project.expert.title}</p>
                      {project.expert.averageRating && (
                        <div className="flex items-center mt-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">
                            {project.expert.averageRating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Stats */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Statistiques</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Jalons</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {milestones.filter(m => m.status === 'completed').length} / {milestones.length}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Messages</dt>
                    <dd className="text-sm font-medium text-gray-900">{messages.length}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Temps écoulé</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {Math.ceil((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <MilestoneManager 
            projectId={id!} 
            milestones={milestones} 
            onUpdate={handleMilestoneUpdate}
            canEdit={true} // TODO: Check user permissions
          />
        )}

        {activeTab === 'messages' && (
          <ProjectMessaging 
            projectId={id!} 
            messages={messages} 
            onMessageSent={handleMessageSent}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;
