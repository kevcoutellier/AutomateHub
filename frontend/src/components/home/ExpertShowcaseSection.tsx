import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Star, Award, Clock, CheckCircle } from 'lucide-react';

export const ExpertShowcaseSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const experts = [
    {
      name: 'Sarah Chen',
      title: 'Senior n8n Automation Specialist',
      experience: '5+ years',
      rating: 4.9,
      completedProjects: 127,
      specialties: ['E-commerce Integration', 'CRM Automation', 'Data Workflows'],
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400',
      testimonial: 'Sarah transformed our entire sales process. What used to take hours now happens automatically.',
      client: 'TechStart Inc.'
    },
    {
      name: 'Marcus Rodriguez',
      title: 'n8n Integration Expert',
      experience: '7+ years',
      rating: 5.0,
      completedProjects: 203,
      specialties: ['API Integrations', 'Webhook Automation', 'Custom Workflows'],
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400',
      testimonial: 'Marcus delivered exactly what we needed, on time and within budget. Exceptional work.',
      client: 'Growth Solutions'
    },
    {
      name: 'Emily Watson',
      title: 'Business Process Automation Lead',
      experience: '6+ years',
      rating: 4.8,
      completedProjects: 156,
      specialties: ['HR Automation', 'Document Processing', 'Notification Systems'],
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=400',
      testimonial: 'Emily understood our complex requirements and delivered a solution that exceeded expectations.',
      client: 'Enterprise Corp'
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Meet Our Top-Rated
            <span className="block text-primary-600">n8n Experts</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Work with certified professionals who have delivered hundreds of successful 
            automation projects for businesses just like yours.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert, index) => (
            <motion.div
              key={expert.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="bg-white rounded-2xl p-8 shadow-medium hover:shadow-strong transition-all duration-300 border border-gray-100 group"
            >
              {/* Expert Header */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                  <img
                    src={expert.avatar}
                    alt={expert.name}
                    className="w-16 h-16 rounded-full object-cover ring-4 ring-primary-100 group-hover:ring-primary-200 transition-all duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{expert.name}</h3>
                  <p className="text-primary-600 font-medium">{expert.title}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Star className="w-4 h-4 text-warning-500 fill-current" />
                    <span className="font-bold text-gray-900">{expert.rating}</span>
                  </div>
                  <p className="text-sm text-gray-600">Rating</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Award className="w-4 h-4 text-primary-500" />
                    <span className="font-bold text-gray-900">{expert.completedProjects}</span>
                  </div>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    <Clock className="w-4 h-4 text-secondary-500" />
                    <span className="font-bold text-gray-900">{expert.experience}</span>
                  </div>
                  <p className="text-sm text-gray-600">Experience</p>
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Specialties</h4>
                <div className="flex flex-wrap gap-2">
                  {expert.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="px-3 py-1 bg-primary-50 text-primary-700 text-sm font-medium rounded-full"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                <p className="text-gray-700 text-sm italic mb-2">"{expert.testimonial}"</p>
                <p className="text-xs text-gray-500 font-medium">— {expert.client}</p>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-glow"
              >
                View Profile
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to work with top n8n talent?
            </h3>
            <p className="text-primary-100 mb-8 max-w-2xl mx-auto text-lg">
              Get matched with the perfect expert for your project in under 24 hours. 
              Start with a free consultation to discuss your automation needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow"
            >
              Find Your Expert
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};