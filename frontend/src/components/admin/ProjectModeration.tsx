import React, { useState, useEffect } from 'react';
import { Search, Filter, Flag, CheckCircle, X, Eye, AlertTriangle } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

const ProjectModeration: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'reports' | 'projects'>('reports');
  const [filters, setFilters] = useState({
    status: 'all',
    severity: 'all',
    search: ''
  });

  const handleReportAction = async (reportId: string, action: string) => {
    try {
      setLoading(true);
      if (action === 'approve') {
        await adminApi.moderateReports([reportId], 'approve');
      } else if (action === 'reject') {
        await adminApi.moderateReports([reportId], 'reject');
      }
      await loadReports();
    } catch (error) {
      console.error(`Error performing ${action} on report ${reportId}:`, error);
      setError(`Erreur lors de l'action ${action}`);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectAction = async (projectId: string, action: string) => {
    try {
      console.log(`Action ${action} for project ${projectId}`);
      // TODO: Implémenter les actions sur les projets
    } catch (error) {
      console.error(`Error performing ${action} on project ${projectId}:`, error);
    }
  };

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.getReports({
        status: filters.status !== 'all' ? filters.status : undefined,
        search: filters.search || undefined,
        limit: 50
      });
      
      if (response.success && response.data) {
        setReports(response.data.reports || []);
      } else {
        // Fallback vers des données mock
        setReports([
          {
            id: '1',
            projectId: 'PRJ-001',
            projectTitle: 'Développement App Mobile',
            reportedBy: 'Marie Dubois',
            reportType: 'inappropriate_behavior',
            description: 'Communication inappropriée de la part de l\'expert',
            status: 'pending',
            createdAt: '2024-01-20T10:30:00Z',
            severity: 'medium'
          },
          {
            id: '2',
            projectId: 'PRJ-002',
            projectTitle: 'Site E-commerce',
            reportedBy: 'Jean Martin',
            reportType: 'quality_issues',
            description: 'Travail de mauvaise qualité, non conforme aux spécifications',
            status: 'investigating',
            createdAt: '2024-01-19T15:45:00Z',
            severity: 'high'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading reports:', error);
      setError('Erreur lors du chargement des signalements');
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      // TODO: Implémenter l'API pour récupérer les projets
      setProjects([
        {
          id: 'PRJ-001',
          title: 'Développement App Mobile',
          client: 'TechCorp',
          expert: 'Pierre Durand',
          status: 'in-progress',
          flagged: true,
          budget: 5000,
          createdAt: '2024-01-15'
        },
        {
          id: 'PRJ-002',
          title: 'Site E-commerce',
          client: 'ShopPlus',
          expert: 'Sophie Martin',
          status: 'completed',
          flagged: false,
          budget: 3500,
          createdAt: '2024-01-10'
        }
      ]);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      loadReports();
    } else {
      loadProjects();
    }
  }, [activeTab, filters]);

  const getSeverityBadge = (severity: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[severity as keyof typeof styles]}`}>
        {severity === 'low' ? 'Faible' :
         severity === 'medium' ? 'Moyen' :
         severity === 'high' ? 'Élevé' :
         'Critique'}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      investigating: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      dismissed: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles]}`}>
        {status === 'pending' ? 'En attente' :
         status === 'investigating' ? 'En cours' :
         status === 'resolved' ? 'Résolu' :
         'Rejeté'}
      </span>
    );
  };

  const getReportTypeText = (type: string) => {
    switch (type) {
      case 'inappropriate_behavior': return 'Comportement inapproprié';
      case 'quality_issues': return 'Problème de qualité';
      case 'payment_dispute': return 'Litige de paiement';
      case 'spam': return 'Spam';
      case 'fraud': return 'Fraude';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={() => activeTab === 'reports' ? loadReports() : loadProjects()}
            className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Modération des projets</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {reports.filter(r => r.status === 'pending').length} signalement(s) en attente
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'reports', label: 'Signalements', icon: Flag },
            { id: 'projects', label: 'Projets', icon: Eye }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`${
                activeTab === id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Tous les statuts</option>
          <option value="pending">En attente</option>
          <option value="investigating">En cours</option>
          <option value="resolved">Résolus</option>
        </select>

        {activeTab === 'reports' && (
          <select
            value={filters.severity}
            onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Toutes les sévérités</option>
            <option value="low">Faible</option>
            <option value="medium">Moyen</option>
            <option value="high">Élevé</option>
            <option value="critical">Critique</option>
          </select>
        )}
      </div>

      {/* Content */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Flag className={`h-5 w-5 ${
                      report.severity === 'high' || report.severity === 'critical' ? 'text-red-500' :
                      report.severity === 'medium' ? 'text-yellow-500' :
                      'text-green-500'
                    }`} />
                    <h3 className="text-lg font-medium text-gray-900">
                      {getReportTypeText(report.reportType)}
                    </h3>
                    {getSeverityBadge(report.severity)}
                    {getStatusBadge(report.status)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Projet concerné</p>
                      <p className="font-medium text-gray-900">{report.projectTitle}</p>
                      <p className="text-sm text-gray-500">ID: {report.projectId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Signalé par</p>
                      <p className="font-medium text-gray-900">{report.reportedBy}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-1">Description</p>
                    <p className="text-gray-900">{report.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => handleReportAction(report.id, 'investigate')}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Enquêter"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReportAction(report.id, 'resolve')}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                    title="Résoudre"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReportAction(report.id, 'dismiss')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Rejeter"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {project.flagged && (
                        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-500">ID: {project.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Client: {project.client}</div>
                    <div className="text-sm text-gray-500">Expert: {project.expert}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {project.status === 'completed' ? 'Terminé' :
                       project.status === 'in-progress' ? 'En cours' :
                       'En attente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {project.budget.toLocaleString()}€
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleProjectAction(project.id, 'view')}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Voir les détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleProjectAction(project.id, 'suspend')}
                        className="text-red-600 hover:text-red-900"
                        title="Suspendre"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProjectModeration;
