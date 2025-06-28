import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Search, 
  Users, 
  FileText, 
  Code, 
  CheckCircle, 
  Calendar,
  BarChart3,
  Settings,
  ArrowRight,
  Clock,
  Target,
  Zap
} from 'lucide-react';

export const ProcessSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const phases = [
    {
      number: '01',
      title: 'Discover & Define',
      duration: '1-2 days',
      description: 'Intelligent assessment of your automation potential',
      icon: Search,
      color: 'from-primary-500 to-primary-600',
      details: [
        'Comprehensive business process audit',
        'ROI calculation and priority matrix',
        'Technical feasibility assessment'
      ],
      deliverable: 'Custom automation roadmap with expert recommendations',
      visual: 'Assessment dashboard mockup'
    },
    {
      number: '02',
      title: 'Match & Meet',
      duration: '1-3 days',
      description: 'AI-powered matching with perfect-fit experts',
      icon: Users,
      color: 'from-secondary-500 to-secondary-600',
      details: [
        'Algorithm considers industry experience and technical depth',
        '3-5 expert profiles with compatibility scores',
        'Optional intro calls with top candidates'
      ],
      deliverable: 'Shortlist of pre-qualified experts ready to propose',
      visual: 'Expert profile cards with matching scores'
    },
    {
      number: '03',
      title: 'Plan & Propose',
      duration: '3-5 days',
      description: 'Detailed project planning with your chosen expert',
      icon: FileText,
      color: 'from-warning-500 to-warning-600',
      details: [
        'Technical architecture design',
        'Milestone-based timeline creation',
        'Fixed-price proposal with clear deliverables'
      ],
      deliverable: 'Comprehensive project plan and binding agreement',
      visual: 'Project timeline with milestones'
    },
    {
      number: '04',
      title: 'Build & Deliver',
      duration: '1-4 weeks',
      description: 'Managed development with continuous oversight',
      icon: Code,
      color: 'from-success-500 to-success-600',
      details: [
        'Daily progress updates via dedicated dashboard',
        'Quality checkpoints at each milestone',
        'Testing and documentation included'
      ],
      deliverable: 'Production-ready automation with full documentation',
      visual: 'Development dashboard with progress tracking'
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Guaranteed Success',
      description: 'Quality assurance and satisfaction guarantee on every project'
    },
    {
      icon: Clock,
      title: 'Predictable Timeline',
      description: 'Clear milestones and realistic delivery schedules'
    },
    {
      icon: Zap,
      title: 'Immediate ROI',
      description: 'Start seeing efficiency gains from day one of deployment'
    }
  ];

  return (
    <section id="process-section" className="py-16 lg:py-24 bg-gradient-to-br from-gray-50 to-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Your Success Journey
            <span className="block text-2xl md:text-3xl lg:text-4xl text-primary-600 mt-2">
              From Chaos to Automated Excellence
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our proven 4-phase methodology ensures every automation project delivers 
            measurable results with zero surprises.
          </p>
        </motion.div>

        {/* Process Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-primary-200 via-secondary-200 via-warning-200 to-success-200"></div>

          <div className="space-y-12 lg:space-y-24">
            {phases.map((phase, index) => (
              <motion.div
                key={phase.number}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.3 }}
                className={`relative flex flex-col lg:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
                }`}
              >
                {/* Phase Content */}
                <div className="flex-1 lg:w-1/2">
                  <div className="bg-white rounded-2xl p-8 shadow-medium hover:shadow-strong transition-all duration-300 border border-gray-100">
                    {/* Phase Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${phase.color} rounded-xl flex items-center justify-center shadow-glow`}>
                        <phase.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-500 mb-1">
                          Phase {phase.number}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {phase.title}
                        </h3>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">{phase.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-lg mb-6">{phase.description}</p>

                    {/* Details List */}
                    <ul className="space-y-3 mb-6">
                      {phase.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Deliverable */}
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
                      <div className="flex items-center gap-2 mb-2">
                        <BarChart3 className="w-5 h-5 text-primary-500" />
                        <span className="font-semibold text-gray-900">Key Deliverable</span>
                      </div>
                      <p className="text-gray-700">{phase.deliverable}</p>
                    </div>
                  </div>
                </div>

                {/* Timeline Node */}
                <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${phase.color} rounded-full flex items-center justify-center shadow-strong`}>
                    <span className="text-white font-bold text-sm">{phase.number}</span>
                  </div>
                </div>

                {/* Visual Mockup */}
                <div className="flex-1 lg:w-1/2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-8 aspect-video flex items-center justify-center shadow-medium"
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 bg-gradient-to-br ${phase.color} rounded-xl mx-auto mb-4 flex items-center justify-center`}>
                        <Settings className="w-8 h-8 text-white animate-spin-slow" />
                      </div>
                      <p className="text-gray-600 font-medium">{phase.visual}</p>
                      <div className="mt-4 space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="h-2 bg-gray-300 rounded animate-pulse"
                            style={{ width: `${60 + i * 15}%`, margin: '0 auto' }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-24"
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Why Our Process Works
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Every step is designed to eliminate common project failures and ensure your success.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.8 + index * 0.2 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-glow group-hover:shadow-glow-green transition-all duration-300 group-hover:scale-110">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{benefit.title}</h4>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 2.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to start your success journey?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Begin with our free business assessment to map your automation opportunities 
              and get matched with the perfect expert.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow-orange flex items-center gap-3 mx-auto"
            >
              <span>Start Free Assessment</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};