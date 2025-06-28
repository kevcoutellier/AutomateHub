import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Star, Users, TrendingUp } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const stats = [
    { label: 'Trusted by 200+ businesses', icon: Users },
    { label: '95% project success rate', icon: CheckCircle },
    { label: 'Average 4.9/5 rating', icon: Star },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 pt-8 pb-16 lg:pt-16 lg:pb-24">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your Business with{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-secondary-500">
                  Certified n8n
                </span>{' '}
                Automation Experts
              </h1>
              
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                From manual chaos to automated excellence. Connect with pre-vetted professionals 
                who deliver results, not just workflows.
              </p>

              {/* Value Proposition Pills */}
              <div className="mt-8 flex flex-wrap gap-4">
                {[
                  'Certified Expertise',
                  'Guided Process',
                  'Guaranteed Results'
                ].map((item, index) => (
                  <motion.div
                    key={item}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                    className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-soft border border-gray-100"
                  >
                    <CheckCircle className="w-5 h-5 text-success-500" />
                    <span className="text-sm font-medium text-gray-700">{item}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  to="/experts"
                  className="group bg-secondary-500 hover:bg-secondary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow-orange hover:-translate-y-1 flex items-center justify-center space-x-3"
                >
                  <span>Find Your Expert</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                
                <button 
                  onClick={() => {
                    const processSection = document.getElementById('process-section');
                    if (processSection) {
                      processSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-primary-300 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-medium flex items-center justify-center space-x-3"
                >
                  <span>See How It Works</span>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 rounded-full border-2 border-primary-400 border-t-transparent"
                  />
                </button>
              </div>

              {/* Social Proof */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex flex-wrap items-center gap-6">
                  {stats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      className="flex items-center space-x-2"
                    >
                      <stat.icon className="w-5 h-5 text-primary-500" />
                      <span className="text-sm font-medium text-gray-600">{stat.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <div className="mt-12 lg:mt-0 lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Hero Visual */}
              <div className="relative bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl p-8 shadow-strong">
                <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>
                <div className="relative">
                  {/* Workflow Visualization */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {[...Array(9)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                        className="aspect-square bg-white/20 rounded-lg backdrop-blur-sm flex items-center justify-center"
                      >
                        <div className="w-6 h-6 bg-white/40 rounded-full animate-pulse"></div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Connection Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <motion.path
                        d="M 20 20 Q 50 10 80 20 T 80 50 Q 70 80 50 80 T 20 50 Z"
                        stroke="rgba(255,255,255,0.3)"
                        strokeWidth="2"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                    </svg>
                  </div>

                  {/* Stats Display */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-6">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <div className="text-2xl font-bold">89%</div>
                        <div className="text-xs opacity-80">Efficiency Gain</div>
                      </div>
                      <div className="text-white">
                        <div className="text-2xl font-bold">$47K</div>
                        <div className="text-xs opacity-80">Annual Savings</div>
                      </div>
                      <TrendingUp className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-success-500 text-white p-3 rounded-full shadow-medium"
              >
                <CheckCircle className="w-6 h-6" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute -bottom-4 -left-4 bg-warning-500 text-white p-3 rounded-full shadow-medium"
              >
                <Star className="w-6 h-6" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};