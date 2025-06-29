import React, { useState, useEffect } from 'react';
import { 
  Flag, 
  Eye, 
  CheckCircle, 
  X, 
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  Filter,
  Search,
  Download
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface Report {
  id: string;
  type: 'inappropriate_behavior' | 'quality_issues' | 'payment_dispute' | 'spam' | 'fraud';
  title: string;
  description: string;
  reportedBy: {
    id: string;
    name: string;
    email: string;
  };
  reportedUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  projectId?: string;
  projectTitle?: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  resolution?: string;
  evidence: string[];
}

const ReportManagement: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: ''
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/reports');
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      // Mock data for development
      setReports([
        {
          id: '1',
          type: 'inappropriate_behavior',
          title: 'Comportement inapproprié',
          description: 'L\'expert a utilisé un langage inapproprié lors de nos échanges et a été irrespectueux.',
          reportedBy: {
            id: '1',
            name: 'Marie Dubois',
            email: 'marie@example.com'
          },
          reportedUser: {
            id: '2',
            name: 'Pierre Durand',
            email: 'pierre@example.com',
            role: 'expert'
          },
          projectId: 'PRJ-001',
          projectTitle: 'Développement App Mobile',
          status: 'pending',
          priority: 'high',
          createdAt: '2024-01-20T10:30:00Z',
          updatedAt: '2024-01-20T10:30:00Z',
          evidence: ['screenshot1.png', 'conversation.txt']
        },
        {
          id: '2',
          type: 'quality_issues',
          title: 'Problème de qualité',
          description: 'Le travail livré ne correspond pas aux spécifications et présente de nombreux défauts.',
          reportedBy: {
            id: '3',
            name: 'Jean Martin',
            email: 'jean@example.com'
          },
          reportedUser: {
            id: '4',
            name: 'Sophie Leroy',
            email: 'sophie@example.com',
            role: 'expert'
          },
          projectId: 'PRJ-002',
          projectTitle: 'Site E-commerce',
          status: 'investigating',
          priority: 'medium',
          createdAt: '2024-01-19T15:45:00Z',
          updatedAt: '2024-01-20T09:15:00Z',
          assignedTo: 'Admin',
          evidence: ['code_review.pdf']
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReportAction = async (reportId: string, action: 'resolve' | 'dismiss' | 'escalate', resolution?: string) => {
    setActionLoading(true);
    try {
      await apiClient.put(`/admin/reports/${reportId}`, {
        action,
        resolution
      });
      
      setReports(prev => prev.map(report => 
        report.id === reportId 
          ? { 
              ...report, 
              status: action === 'resolve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'investigating',
              resolution,
              updatedAt: new Date().toISOString()
            }
          : report
      ));
      
      setSelectedReport(null);
    } catch (error) {
      console.error('Error updating report:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'inappropriate_behavior': return 'Comportement inapproprié';
      case 'quality_issues': return 'Problème de qualité';
      case 'payment_dispute': return 'Litige de paiement';
      case 'spam': return 'Spam';
      case 'fraud': return 'Fraude';
      default: return type;
    }
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

  const getPriorityBadge = (priority: string) => {
    const styles = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
      critical: 'bg-red-200 text-red-900'
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[priority as keyof typeof styles]}`}>
        {priority === 'low' ? 'Faible' :
         priority === 'medium' ? 'Moyen' :
         priority === 'high' ? 'Élevé' :
         'Critique'}
      </span>
    );
  };

  const filteredReports = reports.filter(report => {
    const matchesStatus = filters.status === 'all' || report.status === filters.status;
    const matchesType = filters.type === 'all' || report.type === filters.type;
    const matchesPriority = filters.priority === 'all' || report.priority === filters.priority;
    const matchesSearch = !filters.search || 
      report.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.reportedUser.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      report.reportedBy.name.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesPriority && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des signalements</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {reports.filter(r => r.status === 'pending').length} signalement(s) en attente
          </span>
          <button className="px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2 inline" />
            Exporter
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
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
            <option value="dismissed">Rejetés</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tous les types</option>
            <option value="inappropriate_behavior">Comportement inapproprié</option>
            <option value="quality_issues">Problème de qualité</option>
            <option value="payment_dispute">Litige de paiement</option>
            <option value="spam">Spam</option>
            <option value="fraud">Fraude</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Toutes les priorités</option>
            <option value="critical">Critique</option>
            <option value="high">Élevée</option>
            <option value="medium">Moyenne</option>
            <option value="low">Faible</option>
          </select>

          <button
            onClick={() => setFilters({ status: 'all', type: 'all', priority: 'all', search: '' })}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Signalement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilisateur signalé
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
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
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                </td>
              </tr>
            ) : filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Flag className="h-4 w-4 text-red-500 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.title}</div>
                      <div className="text-sm text-gray-500">{getTypeText(report.type)}</div>
                      {report.projectTitle && (
                        <div className="text-xs text-gray-400">Projet: {report.projectTitle}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">{report.reportedUser.name}</div>
                      <div className="text-sm text-gray-500">{report.reportedUser.email}</div>
                      <div className="text-xs text-gray-400">{report.reportedUser.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(report.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(report.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                    title="Voir les détails"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {report.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleReportAction(report.id, 'resolve')}
                        className="text-green-600 hover:text-green-900 mr-3"
                        title="Résoudre"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleReportAction(report.id, 'dismiss')}
                        className="text-red-600 hover:text-red-900"
                        title="Rejeter"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Détails du signalement</h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Informations générales</h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Type</dt>
                    <dd className="text-sm text-gray-900">{getTypeText(selectedReport.type)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Statut</dt>
                    <dd className="text-sm text-gray-900">{getStatusBadge(selectedReport.status)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Priorité</dt>
                    <dd className="text-sm text-gray-900">{getPriorityBadge(selectedReport.priority)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(selectedReport.createdAt).toLocaleString('fr-FR')}
                    </dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-3">Participants</h4>
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Signalé par</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedReport.reportedBy.name} ({selectedReport.reportedBy.email})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Utilisateur signalé</dt>
                    <dd className="text-sm text-gray-900">
                      {selectedReport.reportedUser.name} ({selectedReport.reportedUser.email})
                    </dd>
                  </div>
                  {selectedReport.projectTitle && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Projet concerné</dt>
                      <dd className="text-sm text-gray-900">{selectedReport.projectTitle}</dd>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Description</h4>
              <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                {selectedReport.description}
              </p>
            </div>

            {selectedReport.evidence.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-3">Preuves</h4>
                <div className="space-y-2">
                  {selectedReport.evidence.map((evidence, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {evidence}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedReport.status === 'pending' && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'resolve', 'Signalement traité et résolu')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Traitement...' : 'Résoudre'}
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'dismiss', 'Signalement non fondé')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Traitement...' : 'Rejeter'}
                </button>
                <button
                  onClick={() => handleReportAction(selectedReport.id, 'escalate')}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Traitement...' : 'Escalader'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportManagement;
