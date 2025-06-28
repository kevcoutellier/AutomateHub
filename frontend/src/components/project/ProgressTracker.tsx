import React from 'react';
import { CheckCircle, Clock, AlertTriangle, Target, TrendingUp } from 'lucide-react';
import { Project, Milestone } from '../../types';

interface ProgressTrackerProps {
  project: Project;
  milestones: Milestone[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ project, milestones }) => {
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  const overdueMilestones = milestones.filter(m => 
    new Date(m.dueDate) < new Date() && m.status !== 'completed'
  ).length;

  const upcomingMilestones = milestones.filter(m => {
    const dueDate = new Date(m.dueDate);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return dueDate >= now && dueDate <= weekFromNow && m.status !== 'completed';
  });

  const getProjectHealth = () => {
    if (overdueMilestones > 0) return 'critical';
    if (upcomingMilestones.length > 2) return 'warning';
    if (progressPercentage >= 75) return 'excellent';
    if (progressPercentage >= 50) return 'good';
    return 'fair';
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-100';
      case 'good': return 'text-blue-600 bg-blue-100';
      case 'fair': return 'text-yellow-600 bg-yellow-100';
      case 'warning': return 'text-orange-600 bg-orange-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthText = (health: string) => {
    switch (health) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Bon';
      case 'fair': return 'Correct';
      case 'warning': return 'Attention';
      case 'critical': return 'Critique';
      default: return 'Inconnu';
    }
  };

  const projectHealth = getProjectHealth();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">Suivi de progression</h3>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(projectHealth)}`}>
          {getHealthText(projectHealth)}
        </span>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression globale</span>
          <span className="text-sm text-gray-500">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-indigo-600 h-3 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-indigo-100 rounded-full">
            <Target className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalMilestones}</div>
          <div className="text-xs text-gray-500">Jalons totaux</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{completedMilestones}</div>
          <div className="text-xs text-gray-500">Terminés</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-yellow-100 rounded-full">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{upcomingMilestones.length}</div>
          <div className="text-xs text-gray-500">À venir (7j)</div>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-red-100 rounded-full">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{overdueMilestones}</div>
          <div className="text-xs text-gray-500">En retard</div>
        </div>
      </div>

      {/* Timeline Preview */}
      {milestones.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Prochains jalons</h4>
          <div className="space-y-3">
            {milestones
              .filter(m => m.status !== 'completed')
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 3)
              .map((milestone) => {
                const dueDate = new Date(milestone.dueDate);
                const now = new Date();
                const isOverdue = dueDate < now;
                const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={milestone.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      isOverdue ? 'bg-red-500' : 
                      daysUntilDue <= 7 ? 'bg-yellow-500' : 
                      'bg-green-500'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{milestone.title}</p>
                      <p className="text-xs text-gray-500">
                        {isOverdue ? 
                          `En retard de ${Math.abs(daysUntilDue)} jour(s)` :
                          daysUntilDue === 0 ? 'Aujourd\'hui' :
                          daysUntilDue === 1 ? 'Demain' :
                          `Dans ${daysUntilDue} jour(s)`
                        }
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {milestone.status === 'in-progress' ? (
                        <Clock className="h-4 w-4 text-blue-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                );
              })}
            
            {milestones.filter(m => m.status !== 'completed').length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">Tous les jalons sont terminés !</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Insights */}
      {totalMilestones > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Aperçu du projet
          </h4>
          <div className="space-y-2 text-sm">
            {progressPercentage >= 75 && (
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Le projet est en bonne voie d'achèvement</span>
              </div>
            )}
            
            {overdueMilestones > 0 && (
              <div className="flex items-center text-red-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                <span>{overdueMilestones} jalon(s) en retard nécessitent une attention</span>
              </div>
            )}
            
            {upcomingMilestones.length > 0 && (
              <div className="flex items-center text-yellow-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{upcomingMilestones.length} jalon(s) à échéance dans les 7 prochains jours</span>
              </div>
            )}
            
            {progressPercentage < 25 && totalMilestones > 0 && (
              <div className="flex items-center text-blue-600">
                <Target className="h-4 w-4 mr-2" />
                <span>Le projet vient de commencer, restez concentré sur les premiers jalons</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
