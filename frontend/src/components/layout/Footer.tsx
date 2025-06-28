import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Find Experts', href: '/experts' },
        { name: 'Business Assessment', href: '/assessment' },
        { name: 'Success Stories', href: '/success-stories' },
        { name: 'Pricing', href: '/pricing' }
      ]
    },
    {
      title: 'For Experts',
      links: [
        { name: 'Join Our Network', href: '/expert-signup' },
        { name: 'Certification Program', href: '/certification' },
        { name: 'Expert Resources', href: '/expert-resources' },
        { name: 'Community', href: '/community' },
        { name: 'Support', href: '/expert-support' }
      ]
    },
    {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'Careers', href: '/careers' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press', href: '/press' },
        { name: 'Contact', href: '/contact' }
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Documentation', href: '/docs' },
        { name: 'API Reference', href: '/api' },
        { name: 'System Status', href: '/status' },
        { name: 'Security', href: '/security' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Twitter, href: '#', name: 'Twitter' },
    { icon: Linkedin, href: '#', name: 'LinkedIn' },
    { icon: Github, href: '#', name: 'GitHub' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl shadow-glow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold group-hover:text-primary-400 transition-colors duration-200">
                  AutomateHub
                </span>
                <span className="text-xs text-gray-400 font-medium">Premium n8n Expertise</span>
              </div>
            </Link>
            
            <p className="text-gray-300 text-sm leading-relaxed mb-6 max-w-md">
              Transform your business with certified n8n automation experts. From manual chaos to automated excellence with pre-vetted professionals who deliver results.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>hello@automatehub.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-300">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>San Francisco, CA</span>
              </div>
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200 p-2 hover:bg-gray-800 rounded-lg"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} AutomateHub. All rights reserved.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-6">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Cookie Policy
              </Link>
              <Link to="/accessibility" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};