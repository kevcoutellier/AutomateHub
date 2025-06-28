import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  MessageCircle,
  ChevronDown,
  X,
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import { apiClient } from '../services/api';
import { Expert } from '../types';

export const ExpertsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [sortBy, setSortBy] = useState<string>('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch experts from API
  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          search: searchTerm || undefined,
          specialties: selectedSpecialties.length > 0 ? selectedSpecialties : undefined,
          industries: selectedIndustries.length > 0 ? selectedIndustries : undefined,
          availability: selectedAvailability || undefined,
          location: selectedLocation || undefined,
          maxRate: priceRange[1],
          minRating: 4.0, // Only show highly rated experts
        };

        const response = await apiClient.getExperts(params);
        
        if (response.success && response.data) {
          setExperts(response.data.experts || []);
        } else {
          setError(response.message || 'Failed to fetch experts');
        }
      } catch (err) {
        console.error('Error fetching experts:', err);
        setError('Failed to load experts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();
  }, [searchTerm, selectedSpecialties, selectedIndustries, selectedAvailability, selectedLocation, priceRange]);

  const allSpecialties = useMemo(() => {
    const specs = new Set<string>();
    experts.forEach(expert => expert.specialties.forEach(spec => specs.add(spec)));
    return Array.from(specs).sort();
  }, [experts]);

  const allIndustries = useMemo(() => {
    const industries = new Set<string>();
    experts.forEach(expert => expert.industries.forEach(industry => industries.add(industry)));
    return Array.from(industries).sort();
  }, [experts]);

  const filteredExperts = useMemo(() => {
    let filtered = [...experts];

    // Apply filters
    filtered = filtered.filter(expert => {
      const matchesSearch = expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           expert.specialties.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesSpecialties = selectedSpecialties.length === 0 ||
                                selectedSpecialties.some(spec => expert.specialties.includes(spec));

      const matchesIndustries = selectedIndustries.length === 0 ||
                               selectedIndustries.some(industry => expert.industries.includes(industry));

      const matchesAvailability = selectedAvailability === '' ||
                                 selectedAvailability === expert.availability;

      const hourlyMin = expert.hourlyRate.min;
      const hourlyMax = expert.hourlyRate.max;
      const matchesPrice = hourlyMin <= priceRange[1] && hourlyMax >= priceRange[0];

      return matchesSearch && matchesSpecialties && matchesIndustries && matchesAvailability && matchesPrice;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'projects':
          return b.projectsCompleted - a.projectsCompleted;
        case 'price-low':
          return a.hourlyRate.min - b.hourlyRate.min;
        case 'price-high':
          return b.hourlyRate.max - a.hourlyRate.max;
        default:
          return 0;
      }
    });

    // Featured experts first
    return filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });
  }, [experts, searchTerm, selectedSpecialties, selectedIndustries, selectedAvailability, priceRange, sortBy]);

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success-500';
      case 'busy': return 'bg-warning-500';
      case 'unavailable': return 'bg-error-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityText = (status: string) => {
    switch (status) {
      case 'available': return 'Available Now';
      case 'busy': return 'In Project';
      case 'unavailable': return 'Unavailable';
      default: return 'Unknown';
    }
  };

  const clearFilters = () => {
    setSelectedSpecialties([]);
    setSelectedIndustries([]);
    setSelectedAvailability('');
    setPriceRange([0, 200]);
    setSearchTerm('');
  };

  const activeFiltersCount = selectedSpecialties.length + selectedIndustries.length + 
                            (selectedAvailability !== '' ? 1 : 0) + 
                            (priceRange[0] > 0 || priceRange[1] < 200 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Find Your Perfect n8n Expert
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Connect with certified professionals who deliver results, not just workflows. 
            Every expert is personally vetted and continuously evaluated for excellence.
          </motion.p>
        </div>

        {/* Search and Filter Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-medium border border-gray-100 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, skills, or expertise..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="rating">Highest Rated</option>
                <option value="projects">Most Projects</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="availability">Availability</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors duration-200"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="bg-primary-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Specialties Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Specialties</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allSpecialties.map(specialty => (
                      <label key={specialty} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(specialty)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSpecialties([...selectedSpecialties, specialty]);
                            } else {
                              setSelectedSpecialties(selectedSpecialties.filter(s => s !== specialty));
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Industries Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Industries</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {allIndustries.map(industry => (
                      <label key={industry} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedIndustries.includes(industry)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedIndustries([...selectedIndustries, industry]);
                            } else {
                              setSelectedIndustries(selectedIndustries.filter(i => i !== industry));
                            }
                          }}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{industry}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Availability</label>
                  <div className="space-y-2">
                    {['available', 'busy', 'unavailable'].map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="radio"
                          checked={selectedAvailability === status}
                          onChange={() => setSelectedAvailability(status)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {getAvailabilityText(status)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range Filter */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Hourly Rate: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <div className="space-y-4">
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="200"
                      step="10"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                    Clear all filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredExperts.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{experts.length}</span> experts
          </div>
          
          {/* Featured Badge */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-warning-500" />
            <span>Featured experts appear first</span>
          </div>
        </div>

        {/* Expert Grid */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 text-gray-400" />
            <p className="text-gray-600 mt-4">Loading experts...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error loading experts</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredExperts.map((expert) => (
              <motion.div
                key={expert._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="group relative"
              >
                <div className="bg-white rounded-2xl p-6 shadow-medium hover:shadow-strong transition-all duration-300 border border-gray-100 hover:border-primary-200 h-full">
                  {/* Featured Badge */}
                  {expert.featured && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-warning-500 to-secondary-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-glow">
                      Featured
                    </div>
                  )}

                  {/* Expert Header */}
                  <div className="flex items-start gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={expert.avatar}
                        alt={expert.name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-primary-200 transition-all duration-300"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 ${getAvailabilityColor(expert.availability)} rounded-full border-2 border-white`}></div>
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors duration-200">
                        {expert.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">{expert.title}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3" />
                        <span>{expert.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Star className="w-4 h-4 text-warning-500 fill-current" />
                        <span className="text-sm font-semibold text-gray-900">{expert.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">({expert.reviewCount} reviews)</div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                    <div>
                      <div className="text-lg font-bold text-success-600">{expert.successRate}%</div>
                      <div className="text-xs text-gray-500">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary-600">{expert.projectsCompleted}</div>
                      <div className="text-xs text-gray-500">Projects</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-secondary-600">{expert.responseTime}</div>
                      <div className="text-xs text-gray-500">Response</div>
                    </div>
                  </div>

                  {/* Specialties */}
                  <div className="mb-6">
                    <div className="text-sm font-semibold text-gray-900 mb-2">Top Specialties</div>
                    <div className="flex flex-wrap gap-2">
                      {expert.specialties.slice(0, 3).map((specialty, i) => (
                        <span
                          key={i}
                          className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full border border-primary-200"
                        >
                          {specialty}
                        </span>
                      ))}
                      {expert.specialties.length > 3 && (
                        <span className="text-xs text-gray-500">+{expert.specialties.length - 3} more</span>
                      )}
                    </div>
                  </div>

                  {/* Recent Achievement */}
                  <div className="bg-gradient-to-r from-success-50 to-primary-50 rounded-lg p-3 mb-6">
                    <div className="flex items-start gap-2">
                      <TrendingUp className="w-4 h-4 text-success-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-gray-700">{expert.recentProject}</p>
                    </div>
                  </div>

                  {/* Availability & Pricing */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 ${getAvailabilityColor(expert.availability)} rounded-full`}></div>
                        <span className="text-sm font-medium text-gray-700">
                          {getAvailabilityText(expert.availability)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{expert.nextAvailable}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rate</span>
                      <span className="text-sm font-semibold text-gray-900">${expert.hourlyRate.min} - ${expert.hourlyRate.max}/hr</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <Link
                      to={`/expert/${expert._id}`}
                      className="block w-full bg-primary-500 hover:bg-primary-600 text-white py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-glow text-center"
                    >
                      View Profile
                    </Link>
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium transition-colors duration-200 text-sm flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Quick Message
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredExperts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No experts found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={clearFilters}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200"
            >
              Clear All Filters
            </button>
          </motion.div>
        )}

        {/* Load More (if needed) */}
        {filteredExperts.length > 0 && filteredExperts.length < experts.length && (
          <div className="text-center mt-12">
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-medium transition-colors duration-200">
              Load More Experts
            </button>
          </div>
        )}
      </div>
    </div>
  );
};