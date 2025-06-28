import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Shield,
  Zap,
  Users,
  TrendingUp,
  Star,
  MessageCircle,
  Calendar
} from 'lucide-react';

export const CTASection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const guarantees = [
    {
      icon: Shield,
      title: 'Satisfaction Guaranteed',
      description: 'Full refund if not completely satisfied with deliverables'
    },
    {
      icon: Clock,
      title: 'On-Time Delivery',
      description: '95% of projects delivered on or ahead of schedule'
    },
    {
      icon: CheckCircle,
      title: 'Quality Assured',
      description: 'All code reviewed and tested before handoff'
    }
  ];

  const steps = [
    {
      number: '01',
      title: 'Take Assessment',
      description: 'Complete our 5-minute business automation assessment',
      duration: '5 minutes'
    },
    {
      number: '02',
      title: 'Get Matched',
      description: 'Receive 3-5 expert recommendations within 24 hours',
      duration: '24 hours'
    },
    {
      number: '03',
      title: 'Start Project',
      description: 'Begin automation development with your chosen expert',
      duration: '1-3 days'
    }
  ];

  const stats = [
    { value: '200+', label: 'Businesses Transformed', icon: Users },
    { value: '95%', label: 'Project Success Rate', icon: TrendingUp },
    { value: '4.9/5', label: 'Client Satisfaction', icon: Star },
    { value: '$2.5M+', label: 'Total Savings Generated', icon: Zap }
  ];

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white relative overflow-hidden" ref={ref}>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Ready to Transform Your Business?
            <span className="block text-3xl md:text-4xl lg:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400 mt-2">
              Join 200+ Successful Companies
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Stop wasting time on manual processes. Start your automation journey today 
            with a free business assessment and expert matching.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
            <Link to="/assessment">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-strong hover:shadow-glow-orange flex items-center justify-center gap-4"
              >
                <Zap className="w-6 h-6 group-hover:animate-pulse" />
                <span>Start Free Assessment</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </Link>
            
            <Link to="/experts">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="group bg-white bg-opacity-10 hover:bg-opacity-20 text-white border-2 border-white border-opacity-30 hover:border-opacity-50 px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 backdrop-blur-sm flex items-center justify-center gap-4"
              >
                <MessageCircle className="w-6 h-6" />
                <span>Talk to an Expert</span>
              </motion.button>
            </Link>
          </div>

          {/* Quick Start Process */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mb-16"
          >
            <h3 className="text-2xl font-bold text-gray-300 mb-8">Get Started in 3 Simple Steps</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.2 }}
                  className="relative group"
                >
                  <div className="bg-white bg-opacity-5 hover:bg-opacity-10 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20 hover:border-opacity-30 transition-all duration-300 group-hover:transform group-hover:scale-105">
                    <div className="text-3xl font-bold text-primary-400 mb-3">{step.number}</div>
                    <h4 className="text-xl font-bold mb-3">{step.title}</h4>
                    <p className="text-gray-300 mb-4">{step.description}</p>
                    <div className="flex items-center gap-2 text-secondary-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-medium">{step.duration}</span>
                    </div>
                  </div>
                  
                  {/* Connector */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                      <ArrowRight className="w-8 h-8 text-primary-400 opacity-50" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
              className="text-center group"
            >
              <div className="bg-white bg-opacity-5 rounded-xl p-6 backdrop-blur-sm border border-white border-opacity-20 group-hover:border-opacity-30 transition-all duration-300 group-hover:transform group-hover:scale-105">
                <stat.icon className="w-8 h-8 text-primary-400 mx-auto mb-4 group-hover:text-secondary-400 transition-colors duration-300" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-gray-300 text-sm">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-bold text-center text-gray-300 mb-8">Our Commitment to You</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {guarantees.map((guarantee, index) => (
              <motion.div
                key={guarantee.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 1.1 + index * 0.2 }}
                className="text-center group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-glow-green">
                  <guarantee.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-bold mb-2">{guarantee.title}</h4>
                <p className="text-gray-300 text-sm">{guarantee.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-2xl p-8 lg:p-12 backdrop-blur-sm border border-white border-opacity-20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Don't Wait Another Day
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Every day of manual processes is money lost and opportunities missed. 
              Start your automation transformation now.
            </p>
            
            <Link to="/experts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-12 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-strong hover:shadow-glow-orange flex items-center gap-4 mx-auto"
              >
                <Calendar className="w-6 h-6" />
                <span>Book Free Consultation</span>
                <ArrowRight className="w-6 h-6" />
              </motion.button>
            </Link>
            
            <p className="text-gray-400 text-sm mt-4">
              Free assessment • No commitment • Results in 24 hours
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};