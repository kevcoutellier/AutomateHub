import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  MessageCircle, 
  Video, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Upload,
  Star,
  Target,
  TrendingUp,
  Users,
  Settings,
  Play,
  Pause,
  MoreHorizontal
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'completed' | 'in-progress' | 'pending' | 'overdue';
  deliverables: string[];
  progress: number;
}

interface ProjectUpdate {
  id: string;
  author: string;
  authorAvatar: string;
  timestamp: string;
  type: 'progress' | 'milestone' | 'issue' | 'delivery';
  title: string;
  content: string;
  attachments?: string[];
}

export const ProjectDetailView: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const project = {
    id: '1',
    name: 'E-commerce Order Automation',
    client: 'TechFlow Solutions',
    expert: {
      name: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      rating: 4.9
    },
    status: 'in-progress',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-02-28',
    budget: {
      total: 8500,
      spent: 6200,
      remaining: 2300
    },
    description: 'Comprehensive automation solution for order processing, payment handling, and inventory management across multiple e-commerce platforms.',
    objectives: [
      'Automate order processing from Shopify to fulfillment center',
      'Integrate payment gateway with automated reconciliation',
      'Set up real-time inventory synchronization',
      'Implement customer notification workflows',
      'Create comprehensive reporting dashboard'
    ],
    roi: {
      projected: 45000,
      current: 12000,
      timeframe: 'annual'
    }
  };

  const milestones: Milestone[] = [
    {
      id: '1',
      title: 'Project Discovery & Planning',
      description: 'Requirements gathering, technical analysis, and project roadmap creation',
      dueDate: '2024-01-22',
      status: 'completed',
      deliverables: ['Requirements Document', 'Technical Architecture', 'Project Timeline'],
      progress: 100
    },
    {
      id: '2',
      title: 'Core Workflow Development',
      description: 'Build primary order processing and payment workflows',
      dueDate: '2024-02-05',
      status: 'completed',
      deliverables: ['Order Processing Workflow', 'Payment Integration', 'Error Handling'],
      progress: 100
    },
    {
      id: '3',
      title: 'Payment Gateway Integration',
      description: 'Integrate Stripe payment processing with automated reconciliation',
      dueDate: '2024-02-15',
      status: 'in-progress',
      deliverables: ['Payment Gateway Setup', 'Reconciliation Workflow', 'Testing Documentation'],
      progress: 85
    },
    {
      id: '4',
      title: 'Inventory Synchronization',
      description: 'Real-time inventory sync across all sales channels',
      dueDate: '2024-02-22',
      status: 'pending',
      deliverables: ['Inventory Sync Workflow', 'Multi-channel Integration', 'Stock Alerts'],
      progress: 0
    },
    {
      id: '5',
      title: 'Testing & Documentation',
      description: 'Comprehensive testing, documentation, and team training',
      dueDate: '2024-02-28',
      status: 'pending',
      deliverables: ['Test Results', 'User Documentation', 'Training Materials'],
      progress: 0
    }
  ];

  const updates: ProjectUpdate[] = [
    {
      id: '1',
      author: 'Sarah Chen',
      authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      timestamp: '2 hours ago',
      type: 'progress',
      title: 'Payment Gateway Integration Complete',
      content: 'Successfully completed the Stripe payment gateway integration. All test transactions are processing correctly with automated reconciliation working as expected.',
      attachments: ['payment_test_results.pdf', 'integration_screenshots.zip']
    },
    {
      id: '2',
      author: 'Sarah Chen',
      authorAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      timestamp: '1 day ago',
      type: 'milestone',
      title: 'Core Workflow Development Milestone Achieved',
      content: 'Completed all core workflow development tasks ahead of schedule. Order processing is now fully automated with comprehensive error handling.',
    },
    {
      id: '3',
      author: 'TechFlow Solutions',
      authorAvatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      timestamp: '2 days ago',
      type: 'delivery',
      title: 'Feedback on Order Processing Workflow',
      content: 'Reviewed the order processing workflow - looks excellent! The automated error handling is exactly what we needed. Ready to proceed with payment integration.',
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-success-600 bg-success-100';
      case 'in-progress': return 'text-primary-600 bg-primary-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      case 'overdue': return 'text-error-600 bg-error-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUpdateTypeColor = (type: string) => {
    switch (type) {
      case 'progress': return 'text-primary-600 bg-primary-100';
      case 'milestone': return 'text-success-600 bg-success-100';
      case 'issue': return 'text-error-600 bg-error-100';
      case 'delivery': return 'text-secondary-600 bg-secondary-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" className="p-0 h-auto">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Projects
            </Button>
          </div>

          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
              <p className="text-gray-600 mb-4">{project.description}</p>
              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{project.startDate} - {project.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Client: {project.client}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-warning-500" />
                  <span>Expert: {project.expert.name} ({project.expert.rating}★)</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(project.status)}>
                {project.status.replace('-', ' ')}
              </Badge>
              <Button className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Message Expert
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Schedule Call
              </Button>
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Progress</h3>
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-primary-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
              </div>
              <p className="text-sm text-gray-600">3 of 5 milestones complete</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Budget</h3>
                <DollarSign className="w-6 h-6 text-secondary-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                ${project.budget.spent.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                of ${project.budget.total.toLocaleString()} total
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">ROI Generated</h3>
                <Target className="w-6 h-6 text-success-600" />
              </div>
              <p className="text-2xl font-bold text-success-600 mb-1">
                ${project.roi.current.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">
                Projected: ${project.roi.projected.toLocaleString()}
              </p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
                <Clock className="w-6 h-6 text-warning-600" />
              </div>
              
              <p className="text-2xl font-bold text-warning-600 mb-1">13</p>
              <p className="text-sm text-gray-600">days remaining</p>
            </Card>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'milestones', label: 'Milestones', icon: Target },
              { id: 'updates', label: 'Updates', icon: MessageCircle },
              { id: 'files', label: 'Files', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Project Objectives</h2>
                <ul className="space-y-3">
                  {project.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {updates.slice(0, 3).map((update) => (
                    <div key={update.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                      <img
                        src={update.authorAvatar}
                        alt={update.author}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{update.author}</h4>
                          <Badge className={getUpdateTypeColor(update.type)} size="sm">
                            {update.type}
                          </Badge>
                          <span className="text-xs text-gray-500">{update.timestamp}</span>
                        </div>
                        <h5 className="font-medium text-gray-900 mb-1">{update.title}</h5>
                        <p className="text-sm text-gray-600">{update.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Expert Information</h3>
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={project.expert.avatar}
                    alt={project.expert.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{project.expert.name}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning-500 fill-current" />
                      <span className="text-sm text-gray-600">{project.expert.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Video className="w-4 h-4" />
                    Schedule Call
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Settings className="w-4 h-4" />
                    Project Settings
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'milestones' && (
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <Card key={milestone.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                      milestone.status === 'completed' ? 'bg-success-500' :
                      milestone.status === 'in-progress' ? 'bg-primary-500' :
                      milestone.status === 'overdue' ? 'bg-error-500' : 'bg-gray-400'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{milestone.title}</h3>
                      <p className="text-gray-600 mb-2">{milestone.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Due: {milestone.dueDate}</span>
                        <span>•</span>
                        <span>{milestone.deliverables.length} deliverables</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(milestone.status)}>
                    {milestone.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm text-gray-600">{milestone.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        milestone.status === 'completed' ? 'bg-success-500' :
                        milestone.status === 'in-progress' ? 'bg-primary-500' : 'bg-gray-400'
                      }`}
                      style={{ width: `${milestone.progress}%` }}
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables:</h4>
                  <ul className="space-y-1">
                    {milestone.deliverables.map((deliverable, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className={`w-4 h-4 ${
                          milestone.status === 'completed' ? 'text-success-500' : 'text-gray-300'
                        }`} />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'updates' && (
          <div className="space-y-6">
            {updates.map((update) => (
              <Card key={update.id} className="p-6">
                <div className="flex gap-4">
                  <img
                    src={update.authorAvatar}
                    alt={update.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{update.author}</h4>
                      <Badge className={getUpdateTypeColor(update.type)} size="sm">
                        {update.type}
                      </Badge>
                      <span className="text-sm text-gray-500">{update.timestamp}</span>
                    </div>
                    <h5 className="text-lg font-medium text-gray-900 mb-2">{update.title}</h5>
                    <p className="text-gray-700 mb-4">{update.content}</p>
                    
                    {update.attachments && (
                      <div className="space-y-2">
                        <h6 className="text-sm font-medium text-gray-900">Attachments:</h6>
                        {update.attachments.map((attachment, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 cursor-pointer">
                            <FileText className="w-4 h-4" />
                            {attachment}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Project Files</h2>
                  <Button className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {[
                    { name: 'Project Requirements.pdf', size: '2.4 MB', type: 'PDF', updated: '2 days ago' },
                    { name: 'Technical Architecture.docx', size: '1.8 MB', type: 'DOC', updated: '1 week ago' },
                    { name: 'Workflow Diagrams.zip', size: '5.2 MB', type: 'ZIP', updated: '3 days ago' },
                    { name: 'Test Results.xlsx', size: '892 KB', type: 'XLS', updated: '1 day ago' },
                    { name: 'User Training Video.mp4', size: '45.2 MB', type: 'MP4', updated: '5 days ago' }
                  ].map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-gray-600" />
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-600">{file.type} • {file.size}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">{file.updated}</span>
                        <Button variant="ghost" size="sm">
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div>
              <Card className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">File Categories</h3>
                <div className="space-y-3">
                  {[
                    { category: 'Documentation', count: 8, size: '12.4 MB' },
                    { category: 'Designs', count: 5, size: '8.7 MB' },
                    { category: 'Code', count: 12, size: '3.2 MB' },
                    { category: 'Media', count: 3, size: '67.8 MB' }
                  ].map((cat, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{cat.category}</p>
                        <p className="text-sm text-gray-600">{cat.count} files</p>
                      </div>
                      <span className="text-sm text-gray-500">{cat.size}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};