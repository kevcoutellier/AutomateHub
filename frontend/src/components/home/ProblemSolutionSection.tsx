import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Search, MessageCircleX, AlertTriangle, CheckCircle, MessageCircle, Shield } from 'lucide-react';

export const ProblemSolutionSection: React.FC = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const problems = [
    {
      title: 'The Generic Platform Problem',
      problem: 'Finding qualified experts among thousands of generalists',
      icon: Search,
      solution: 'Pre-certified n8n specialists only',
      benefit: 'Zero time wasted on unqualified candidates',
      color: 'from-error-500 to-error-600',
    },
    {
      title: 'The Communication Gap',
      problem: 'Technical experts who can\'t translate business needs',
      icon: MessageCircleX,
      solution: 'Business-focused discovery process',
      benefit: 'Clear project scope and expectations from day one',
      color: 'from-warning-500 to-warning-600',
    },
    {
      title: 'The Quality Uncertainty',
      problem: 'No guarantee of code quality or long-term maintainability',
      icon: AlertTriangle,
      solution: 'Code review standards and quality assurance',
      benefit: 'Future-proof solutions that scale with your business',
      color: 'from-primary-500 to-primary-600',
    },
  ];

  const solutions = [
    { icon: CheckCircle, color: 'text-success-500' },
    { icon: MessageCircle, color: 'text-primary-500' },
    { icon: Shield, color: 'text-secondary-500' },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Why Most Automation Projects Fail
            <span className="block text-2xl md:text-3xl lg:text-4xl text-primary-600 mt-2">
              (And How We Ensure Yours Succeeds)
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Learn from the common pitfalls that derail automation initiatives and discover 
            our systematic approach to guaranteed success.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative group"
            >
              {/* Problem Card */}
              <div className="bg-gray-50 rounded-2xl p-8 mb-6 border-2 border-gray-100 group-hover:border-gray-200 transition-all duration-300">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{item.problem}</p>
                
                <div className="flex items-center space-x-3 text-error-600">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">Common Problem</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.8 + index * 0.2 }}
                  className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center shadow-glow"
                >
                  <motion.div
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 border-b-2 border-r-2 border-white transform rotate-45"
                  />
                </motion.div>
              </div>

              {/* Solution Card */}
              <div className="bg-white rounded-2xl p-8 shadow-medium border-2 border-success-200 group-hover:shadow-strong transition-all duration-300">
                <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {React.createElement(solutions[index].icon, { 
                    className: `w-8 h-8 text-white` 
                  })}
                </div>
                
                <h4 className="text-lg font-bold text-gray-900 mb-3">{item.solution}</h4>
                <p className="text-success-700 font-medium mb-4">{item.benefit}</p>
                
                <div className="flex items-center space-x-3 text-success-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Our Solution</span>
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
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-8 lg:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to avoid these pitfalls?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Start with our free business assessment to identify your automation opportunities 
              and get matched with the perfect expert for your needs.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 hover:shadow-glow"
            >
              Start Free Assessment
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};