import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Star, Quote, TrendingUp, Users, DollarSign, Clock } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const testimonials = [
    {
      company: 'TechFlow Solutions',
      industry: 'SaaS',
      logo: '🚀',
      challenge: 'Manual customer onboarding taking 2 hours per client',
      solution: 'Automated workflow reducing process to 15 minutes',
      result: '300% efficiency gain, $50K annual savings',
      quote: 'AutomateHub connected us with exactly the right expert. The ROI was immediate and the quality exceeded expectations.',
      author: 'Sarah Chen',
      role: 'Operations Director',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      rating: 5,
      metrics: {
        efficiency: '+300%',
        savings: '$50K',
        time: '15min'
      },
      beforeAfter: {
        before: '2 hours manual process',
        after: '15 minutes automated'
      }
    },
    {
      company: 'GrowthMart',
      industry: 'E-commerce',
      logo: '🛒',
      challenge: 'Inventory synchronization across 5 platforms',
      solution: 'Real-time inventory automation with error handling',
      result: 'Zero overselling incidents, 40 hours/week saved',
      quote: 'The expert understood our business immediately. What seemed impossible became routine within weeks.',
      author: 'Marcus Rodriguez',
      role: 'Founder',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      rating: 5,
      metrics: {
        efficiency: '100%',
        savings: '40hrs/wk',
        errors: 'Zero'
      },
      beforeAfter: {
        before: 'Manual sync errors daily',
        after: 'Real-time sync, zero errors'
      }
    },
    {
      company: 'ConsultPro',
      industry: 'Professional Services',
      logo: '📊',
      challenge: 'Client reporting consuming 20% of billable time',
      solution: 'Automated report generation and client delivery',
      result: '80% time reduction, improved client satisfaction',
      quote: 'Now we focus on strategy instead of manual data work. Game-changer for our business.',
      author: 'Lisa Park',
      role: 'Managing Partner',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
      rating: 5,
      metrics: {
        efficiency: '+80%',
        focus: 'Strategy',
        satisfaction: '+95%'
      },
      beforeAfter: {
        before: '20% time on reports',
        after: '4% time, better quality'
      }
    }
  ];

  const stats = [
    { label: 'Average ROI', value: '450%', icon: TrendingUp },
    { label: 'Client Satisfaction', value: '4.9/5', icon: Users },
    { label: 'Time Savings', value: '65%', icon: Clock },
    { label: 'Annual Savings', value: '$75K', icon: DollarSign },
  ];

  return (
    <section id="success-stories" className="py-16 lg:py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Success Stories From Real Businesses
            <span className="block text-2xl md:text-3xl lg:text-4xl text-primary-600 mt-2">
              Transformations That Speak for Themselves
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how businesses like yours achieved breakthrough efficiency 
            and growth through strategic automation.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 mb-4">
                <stat.icon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.company}
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-8 shadow-medium hover:shadow-strong transition-all duration-300 border border-gray-100 h-full flex flex-col">
                {/* Company Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-4xl">{testimonial.logo}</div>
                  <div>
                    <div className="font-bold text-lg text-gray-900">{testimonial.company}</div>
                    <div className="text-sm text-gray-600">{testimonial.industry}</div>
                  </div>
                </div>

                {/* Quote */}
                <div className="relative mb-6 flex-grow">
                  <Quote className="w-8 h-8 text-primary-200 absolute -top-2 -left-2" />
                  <p className="text-gray-700 italic text-lg leading-relaxed pl-6">
                    "{testimonial.quote}"
                  </p>
                </div>

                {/* Before/After Comparison */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-error-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">Before: {testimonial.beforeAfter.before}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">After: {testimonial.beforeAfter.after}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {Object.entries(testimonial.metrics).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-lg font-bold text-primary-600">{value}</div>
                      <div className="text-xs text-gray-500 capitalize">{key}</div>
                    </div>
                  ))}
                </div>

                {/* Author */}
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-900">{testimonial.author}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-warning-500 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 lg:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to write your own success story?
            </h3>
            <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of businesses that have transformed their operations with our expert automation services.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/assessment">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow-orange"
                >
                  Start Your Transformation
                </motion.button>
              </Link>
              <Link to="/experts">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white bg-opacity-10 hover:bg-opacity-20 text-white border border-white border-opacity-30 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300"
                >
                  View More Case Studies
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};