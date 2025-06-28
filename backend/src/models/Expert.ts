// src/models/Expert.ts
import mongoose, { Schema, Document } from 'mongoose';

// Business Logic Layer - Pure domain concepts
// This interface represents what an Expert means to your application
// It focuses on business properties without database concerns
export interface IExpert {
  name: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  hourlyRate: {
    min: number;
    max: number;
  };
  specialties: string[];
  industries: string[];
  experience: string;
  availability: 'available' | 'busy' | 'unavailable';
  languages: string[];
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
    technologies: string[];
    completedAt: Date;
  }>;
  
  // Performance metrics calculated from reviews and projects
  averageRating: number;
  totalReviews: number;
  projectsCompleted: number;
  successRate: number;
  responseTime: string; // e.g., "within 2 hours"
  
  // Status and approval information
  isApproved: boolean;
  isActive: boolean;
  featured: boolean;
  
  // Relationship to User model
  userId: mongoose.Types.ObjectId;
}

// Integration Layer - Database document interface
// This interface represents how data is stored and managed in MongoDB
// It extends Document directly without trying to also extend IExpert
// This avoids the _id collision by letting Mongoose handle all database concerns
export interface ExpertDocument extends Document {
  // Core expert information
  name: string;
  title: string;
  bio: string;
  location: string;
  timezone: string;
  hourlyRate: {
    min: number;
    max: number;
  };
  specialties: string[];
  industries: string[];
  experience: string;
  availability: 'available' | 'busy' | 'unavailable';
  languages: string[];
  
  // Portfolio as a subdocument array
  portfolio: Array<{
    id: string;
    title: string;
    description: string;
    imageUrl?: string;
    projectUrl?: string;
    technologies: string[];
    completedAt: Date;
  }>;
  
  // Calculated performance metrics
  averageRating: number;
  totalReviews: number;
  projectsCompleted: number;
  successRate: number;
  responseTime: string;
  
  // Status flags
  isApproved: boolean;
  isActive: boolean;
  featured: boolean;
  
  // User relationship
  userId: mongoose.Types.ObjectId;
  
  // Database-specific properties inherited from Document:
  // _id, __v, createdAt, updatedAt, save(), remove(), etc.
  
  // Custom methods we'll add to expert documents
  calculateAverageRating(): Promise<number>;
  updatePortfolioItem(itemId: string, updates: any): Promise<void>;
}

// Database Persistence Layer - Schema definition with all the MongoDB-specific logic
const expertSchema = new Schema<ExpertDocument>({
  name: {
    type: String,
    required: [true, 'Expert name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  title: {
    type: String,
    required: [true, 'Professional title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    trim: true,
    minlength: [50, 'Bio must be at least 50 characters'],
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  
  timezone: {
    type: String,
    required: [true, 'Timezone is required']
  },
  
  hourlyRate: {
    min: {
      type: Number,
      required: [true, 'Minimum hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative']
    },
    max: {
      type: Number,
      required: [true, 'Maximum hourly rate is required'],
      min: [0, 'Hourly rate cannot be negative']
    }
  },
  
  specialties: [{
    type: String,
    required: true,
    trim: true
  }],
  
  industries: [{
    type: String,
    required: true,
    trim: true
  }],
  
  experience: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['entry', 'intermediate', 'senior', 'expert']
  },
  
  availability: {
    type: String,
    enum: ['available', 'busy', 'unavailable'],
    default: 'available'
  },
  
  languages: [{
    type: String,
    trim: true
  }],
  
  // Portfolio as embedded documents with their own structure
  portfolio: [{
    id: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Portfolio title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Portfolio description cannot exceed 500 characters']
    },
    imageUrl: {
      type: String,
      trim: true
    },
    projectUrl: {
      type: String,
      trim: true
    },
    technologies: [{
      type: String,
      trim: true
    }],
    completedAt: {
      type: Date,
      required: true
    },
    attachments: [{
      fileId: {
        type: Schema.Types.ObjectId,
        ref: 'File'
      },
      filename: {
        type: String,
        required: true
      },
      originalName: {
        type: String,
        required: true
      },
      mimeType: {
        type: String,
        required: true
      },
      url: {
        type: String
      }
    }]
  }],
  
  // Performance metrics that get updated when reviews/projects change
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  
  totalReviews: {
    type: Number,
    default: 0,
    min: 0
  },
  
  projectsCompleted: {
    type: Number,
    default: 0,
    min: 0
  },
  
  successRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  responseTime: {
    type: String,
    default: 'within 24 hours'
  },
  
  // Status management
  isApproved: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  featured: {
    type: Boolean,
    default: false
  },
  
  // Reference to the User who owns this expert profile
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Each user can only have one expert profile
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  
  // Optimize JSON output by removing internal MongoDB fields
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create indexes for efficient querying
// Note: userId index is automatically created by unique: true
expertSchema.index({ specialties: 1 }); // Filter by specialties
expertSchema.index({ industries: 1 }); // Filter by industries
expertSchema.index({ location: 1 }); // Location-based searches
expertSchema.index({ averageRating: -1 }); // Sort by rating
expertSchema.index({ featured: -1, averageRating: -1 }); // Featured experts first
expertSchema.index({ isApproved: 1, isActive: 1 }); // Active, approved experts
expertSchema.index({ '$**': 'text' }); // Full-text search across all text fields

// Validation middleware to ensure hourly rate consistency
expertSchema.pre('save', function(next) {
  if (this.hourlyRate.min > this.hourlyRate.max) {
    const error = new Error('Minimum hourly rate cannot be greater than maximum hourly rate');
    return next(error);
  }
  next();
});

// Instance method for calculating rating from external review data
expertSchema.methods.calculateAverageRating = async function(): Promise<number> {
  // This would typically aggregate data from a Reviews collection
  // Implementation depends on your review system architecture
  const ReviewModel = mongoose.model('Review');
  const reviews = await ReviewModel.find({ expertId: this._id });
  
  if (reviews.length === 0) return 0;
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const avgRating = totalRating / reviews.length;
  
  // Update the document with the new calculated rating
  this.averageRating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
  this.totalReviews = reviews.length;
  
  return this.averageRating;
};

// Instance method for managing portfolio items
expertSchema.methods.updatePortfolioItem = async function(itemId: string, updates: any): Promise<void> {
  const portfolioItem = this.portfolio.find((item: { id: string; }) => item.id === itemId);
  if (!portfolioItem) {
    throw new Error('Portfolio item not found');
  }
  
  Object.assign(portfolioItem, updates);
  await this.save();
};

// Static method for finding available experts with filters
expertSchema.statics.findAvailableExperts = function(filters: any = {}) {
  const baseQuery = {
    isApproved: true,
    isActive: true,
    ...filters
  };
  
  return this.find(baseQuery)
    .populate('userId', 'firstName lastName avatar isEmailVerified')
    .sort({ featured: -1, averageRating: -1 });
};

// Create and export the model using the properly structured interface
export const ExpertModel = mongoose.model<ExpertDocument>('Expert', expertSchema);