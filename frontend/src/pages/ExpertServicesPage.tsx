import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Star, 
  Clock, 
  DollarSign, 
  Edit, 
  Plus, 
  Eye,
  Settings,
  TrendingUp,
  Users,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuthStore } from '../stores/authStore';

interface Service {
  id: string;
  title: string;
  description: string;
  category: string;
  price: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  complexity: 'basic' | 'intermediate' | 'advanced';
  isActive: boolean;
  views: number;
  inquiries: number;
  completedProjects: number;
  rating: number;
  tags: string[];
}

export const ExpertServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not expert
  useEffect(() => {
    if (user && user.role !== 'expert') {
      navigate('/dashboard');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    // Mock data for services
    const mockServices: Service[] = [
      {
        id: '1',
        title: 'E-commerce Automation Setup',
        description: 'Complete automation setup for e-commerce platforms including order processing, inventory management, and customer notifications.',
        category: 'E-commerce',
        price: { min: 2500, max: 5000, currency: 'USD' },
        duration: '2-4 weeks',
        complexity: 'advanced',
        isActive: true,
        views: 156,
        inquiries: 23,
        completedProjects: 12,
        rating: 4.9,
        tags: ['n8n', 'Shopify', 'WooCommerce', 'Zapier']
      },
      {
        id: '2',
        title: 'CRM Integration & Workflow',
        description: 'Integrate your CRM with various tools and create automated workflows for lead management and customer communication.',
        category: 'CRM',
        price: { min: 1500, max: 3000, currency: 'USD' },
        duration: '1-3 weeks',
        complexity: 'intermediate',
        isActive: true,
        views: 89,
        inquiries: 15,
        completedProjects: 8,
        rating: 4.8,
        tags: ['n8n', 'HubSpot', 'Salesforce', 'Pipedrive']
      },
      {
        id: '3',
        title: 'Data Processing Pipeline',
        description: 'Build automated data processing pipelines for data cleaning, transformation, and reporting.',
        category: 'Data Processing',
        price: { min: 3000, max: 6000, currency: 'USD' },
        duration: '3-6 weeks',
        complexity: 'advanced',
        isActive: false,
        views: 45,
        inquiries: 8,
        completedProjects: 5,
        rating: 4.7,
        tags: ['n8n', 'Python', 'PostgreSQL', 'MongoDB']
      }
    ];

    setServices(mockServices);
    setLoading(false);
  }, []);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Services</h1>
              <p className="text-gray-600 mt-2">Manage your service offerings and track performance</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Service
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{services.length}</p>
              </div>
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.reduce((sum, service) => sum + service.views, 0)}
                </p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {services.reduce((sum, service) => sum + service.inquiries, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(services.reduce((sum, service) => sum + service.rating, 0) / services.length).toFixed(1)}
                </p>
              </div>
              <Star className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>
        </div>

        {/* Services List */}
        <div className="space-y-6">
          {services.map((service) => (
            <Card key={service.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-gray-900">{service.title}</h3>
                    <Badge className={getComplexityColor(service.complexity)}>
                      {service.complexity}
                    </Badge>
                    <Badge className={service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{service.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      ${service.price.min.toLocaleString()} - ${service.price.max.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {service.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      {service.rating}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {service.completedProjects} completed
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {service.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Views</p>
                      <p className="font-medium">{service.views}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Inquiries</p>
                      <p className="font-medium">{service.inquiries}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Conversion</p>
                      <p className="font-medium">
                        {service.inquiries > 0 ? Math.round((service.completedProjects / service.inquiries) * 100) : 0}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-6">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Preview
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {services.length === 0 && (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-600 mb-6">Create your first service to start attracting clients</p>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Service
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};
