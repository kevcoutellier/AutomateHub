import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, MessageCircle, Calendar, Award, Globe, Shield, TrendingUp, Users, Zap, Loader2 } from 'lucide-react';
import { Container } from '../components/layout/Container';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { AuthModal } from '../components/auth/AuthModal';
import { apiClient } from '../services/api';
import { conversationApi } from '../services/conversationApi';
import { useAuthStore } from '../stores/authStore';
import { Expert, Review, CaseStudy } from '../types';

export const ExpertProfilePage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [expert, setExpert] = useState<Expert | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactingExpert, setContactingExpert] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  useEffect(() => {
    const fetchExpertData = async () => {
      if (!id) {
        setError('Expert ID not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.getExpert(id);
        
        if (response.success && response.data) {
          setExpert(response.data.expert);
          setReviews(response.data.reviews || []);
        } else {
          setError(response.message || 'Failed to fetch expert data');
        }
      } catch (err) {
        console.error('Error fetching expert:', err);
        setError('Failed to load expert profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpertData();
  }, [id]);

  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    // After successful authentication, proceed with contacting the expert
    if (expert) {
      await startConversationWithExpert();
    }
  };

  const startConversationWithExpert = async () => {
    if (!expert) return;

    try {
      setContactingExpert(true);

      // Start or get existing conversation
      const response = await conversationApi.startConversation(expert._id);
      
      if (response.success && response.data) {
        // Navigate to dashboard messages with the conversation
        navigate('/dashboard', { 
          state: { 
            activeTab: 'messages',
            conversationId: response.data._id 
          }
        });
      } else {
        console.error('Failed to start conversation:', response.message);
        // Show error message to user
        alert('Failed to start conversation. Please try again.');
      }
    } catch (error) {
      console.error('Error contacting expert:', error);
      alert('Failed to contact expert. Please try again.');
    } finally {
      setContactingExpert(false);
    }
  };

  const handleContactExpert = async () => {
    if (!expert) return;

    console.log('handleContactExpert - isAuthenticated:', isAuthenticated);
    console.log('handleContactExpert - localStorage auth_token:', localStorage.getItem('auth_token'));

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Show auth modal - default to signin, but user can switch to signup
      setAuthMode('signin');
      setIsAuthModalOpen(true);
      return;
    }

    // User is authenticated, proceed with starting conversation
    await startConversationWithExpert();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  if (error || !expert) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert not found</h3>
          <p className="text-gray-600 mb-6">{error || 'The expert profile could not be loaded.'}</p>
          <Link
            to="/experts"
            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
          >
            Browse Experts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Button variant="ghost" className="p-0 h-auto text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Experts
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Profile Header */}
            <Card className="p-8">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="relative">
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-32 h-32 rounded-full object-cover ring-4 ring-primary-100"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-success-500 w-8 h-8 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">{expert.name}</h1>
                      <p className="text-xl text-gray-600 mb-3">{expert.title}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                      <span className="text-sm font-medium text-success-700">Available Now</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{expert.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>{expert.timezone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Responds in {expert.responseTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Member since {expert.memberSince}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Star className="w-5 h-5 fill-warning-400 text-warning-400" />
                        <span className="text-2xl font-bold text-gray-900">{expert.rating}</span>
                      </div>
                      <div className="text-sm text-gray-600">{expert.reviewCount} reviews</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600 mb-1">{expert.completedProjects}</div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success-600 mb-1">{expert.successRate}%</div>
                      <div className="text-sm text-gray-600">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary-600 mb-1">{expert.clientRetention}%</div>
                      <div className="text-sm text-gray-600">Client Retention</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {expert.specialties.slice(0, 4).map((specialty) => (
                      <Badge key={specialty} variant="primary">
                        {specialty}
                      </Badge>
                    ))}
                    {expert.specialties.length > 4 && (
                      <Badge variant="gray">+{expert.specialties.length - 4} more</Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* About */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-600 leading-relaxed">{expert.bio}</p>
            </Card>

            {/* Technical Competencies */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Expertise</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">n8n Competency Matrix</h3>
                <div className="space-y-4">
                  {expert.competencies && Object.entries(expert.competencies).length > 0 ? (
                    Object.entries(expert.competencies).map(([skill, level]) => (
                      <div key={skill}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-gray-700">{skill}</span>
                          <span className="text-sm text-gray-600">{level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${level}%` }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Competency details not available</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Specialties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {expert.integrationExpertise && Object.entries(expert.integrationExpertise).length > 0 ? (
                    Object.entries(expert.integrationExpertise).map(([category, tools]) => (
                      <div key={category}>
                        <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                        <div className="flex flex-wrap gap-2">
                          {tools.map((tool) => (
                            <Badge key={tool} variant="secondary" size="sm">
                              {tool}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">Integration details not available</p>
                  )}
                </div>
              </div>
            </Card>

            {/* Experience */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Professional Experience</h2>
              <div className="space-y-6">
                <div className="border-l-2 border-primary-200 pl-6 relative">
                  <div className="absolute w-3 h-3 bg-primary-500 rounded-full -left-2 top-1"></div>
                  <h3 className="font-semibold text-gray-900">Experience Level</h3>
                  <p className="text-primary-600 font-medium">{expert.experience || 'Not specified'}</p>
                  <p className="text-sm text-gray-500 mb-2">Professional automation experience</p>
                  {expert.bio && <p className="text-gray-600">{expert.bio}</p>}
                </div>
              </div>
            </Card>

            {/* Case Studies */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Case Studies</h2>
              <div className="space-y-8">
                {expert.caseStudies && expert.caseStudies.length > 0 ? (
                  expert.caseStudies.map((study: CaseStudy, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">{study.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{study.industry}</span>
                          <span>•</span>
                          <span>{study.timeline}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Challenge</h4>
                          <p className="text-gray-600 text-sm">{study.challenge}</p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Solution</h4>
                          <p className="text-gray-600 text-sm">{study.solution}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-900 mb-2">Results</h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {study.results.map((result: string, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Technologies Used</h4>
                        <div className="flex flex-wrap gap-2">
                          {study.technologies.map((tech) => (
                            <Badge key={tech} variant="gray" size="sm">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No case studies available</p>
                )}
              </div>
            </Card>

            {/* Testimonials */}
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Testimonials</h2>
              <div className="space-y-6">
                {expert.testimonials && expert.testimonials.length > 0 ? (
                  expert.testimonials.map((testimonial, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning-400 text-warning-400" />
                        ))}
                      </div>
                      <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{testimonial.client}</p>
                          <p className="text-sm text-gray-600">{testimonial.role}, {testimonial.company}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{testimonial.project}</p>
                          <p className="text-xs text-gray-500">{testimonial.date}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No testimonials available</p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Card */}
            <Card className="p-6 sticky top-8">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  ${expert.hourlyRate.min} - ${expert.hourlyRate.max}/hour
                </div>
                <p className="text-gray-500">Starting rate</p>
              </div>

              <div className="space-y-4 mb-6">
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={handleContactExpert}
                  disabled={contactingExpert}
                >
                  {contactingExpert ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Conversation...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Contact Expert
                    </>
                  )}
                </Button>
                <Button variant="outline" className="w-full" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Consultation
                </Button>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Response time:</span>
                  <span className="font-medium">{expert.responseTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Projects completed:</span>
                  <span className="font-medium">{expert.completedProjects}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Success rate:</span>
                  <span className="font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-success-500" />
                    {expert.successRate}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Next available:</span>
                  <span className="font-medium text-success-600">{expert.nextAvailable}</span>
                </div>
              </div>
            </Card>

            {/* Certifications */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-500" />
                Certifications
              </h3>
              <div className="space-y-3">
                {expert.certifications && expert.certifications.length > 0 ? (
                  expert.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{cert}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No certifications available</p>
                )}
              </div>
            </Card>

            {/* Languages */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-500" />
                Languages
              </h3>
              <div className="space-y-2">
                {expert.languages && expert.languages.length > 0 ? (
                  expert.languages.map((language, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{language}</span>
                      <span className="text-xs text-gray-500">Native</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No languages available</p>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success-500" />
                    <span className="text-sm text-gray-600">Success Rate</span>
                  </div>
                  <span className="font-medium">{expert.successRate}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary-500" />
                    <span className="text-sm text-gray-600">Client Retention</span>
                  </div>
                  <span className="font-medium">{expert.clientRetention}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-secondary-500" />
                    <span className="text-sm text-gray-600">Avg Response</span>
                  </div>
                  <span className="font-medium">{expert.responseTime}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Container>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialMode={authMode} 
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
};