// src/models/Review.ts
import mongoose, { Schema, Document } from 'mongoose';

// Business Logic Layer - Pure domain concepts for review functionality
// This interface represents what a Review means to your application logic
// Notice how it focuses on review-specific properties without database concerns
export interface IReview {
  // Core review content
  rating: number; // Overall rating from 1-5
  comment: string; // Written feedback from the client
  
  // Detailed aspect ratings for comprehensive feedback
  aspects: {
    communication: number; // How well the expert communicated
    quality: number; // Quality of work delivered
    timeliness: number; // Whether deadlines were met
    expertise: number; // Level of expertise demonstrated
  };
  
  // Relationship identifiers (using ObjectId for database efficiency)
  clientId: mongoose.Types.ObjectId; // Who wrote this review
  expertId: mongoose.Types.ObjectId; // Who this review is about
  projectId?: mongoose.Types.ObjectId; // Optional: which project this relates to
  
  // Review metadata
  isVerified: boolean; // Has this review been verified as legitimate
  isPublic: boolean; // Should this review be shown publicly
  helpfulVotes: number; // How many people found this review helpful
  
  // Response from expert (optional)
  expertResponse?: {
    message: string;
    respondedAt: Date;
  };
}

// Integration Layer - Database document interface
// This handles how reviews are stored and managed in MongoDB
// Extends only Document to avoid _id conflicts, then explicitly defines all needed properties
export interface ReviewDocument extends Document {
  // All the review content and relationships
  rating: number;
  comment: string;
  
  aspects: {
    communication: number;
    quality: number;
    timeliness: number;
    expertise: number;
  };
  
  // References to other documents in the system
  clientId: mongoose.Types.ObjectId;
  expertId: mongoose.Types.ObjectId;
  projectId?: mongoose.Types.ObjectId;
  
  // Review status and metadata
  isVerified: boolean;
  isPublic: boolean;
  helpfulVotes: number;
  
  // Optional expert response
  expertResponse?: {
    message: string;
    respondedAt: Date;
  };
  
  // Database-specific properties inherited from Document:
  // _id, __v, createdAt, updatedAt, save(), remove(), etc.
  
  // Custom methods for review-specific operations
  calculateHelpfulness(): number;
  markAsHelpful(): Promise<void>;
  addExpertResponse(message: string): Promise<void>;
}

// Database Persistence Layer - Schema with MongoDB-specific logic
const reviewSchema = new Schema<ReviewDocument>({
  // Overall rating with validation to ensure it's within acceptable range
  rating: {
    type: Number,
    required: [true, 'Overall rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5'],
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number'
    }
  },
  
  // Written feedback with length constraints for quality control
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    minlength: [10, 'Comment must be at least 10 characters'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  
  // Detailed aspect ratings for granular feedback
  aspects: {
    communication: {
      type: Number,
      required: [true, 'Communication rating is required'],
      min: [1, 'Communication rating must be at least 1'],
      max: [5, 'Communication rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Communication rating must be a whole number'
      }
    },
    quality: {
      type: Number,
      required: [true, 'Quality rating is required'],
      min: [1, 'Quality rating must be at least 1'],
      max: [5, 'Quality rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Quality rating must be a whole number'
      }
    },
    timeliness: {
      type: Number,
      required: [true, 'Timeliness rating is required'],
      min: [1, 'Timeliness rating must be at least 1'],
      max: [5, 'Timeliness rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Timeliness rating must be a whole number'
      }
    },
    expertise: {
      type: Number,
      required: [true, 'Expertise rating is required'],
      min: [1, 'Expertise rating must be at least 1'],
      max: [5, 'Expertise rating cannot exceed 5'],
      validate: {
        validator: Number.isInteger,
        message: 'Expertise rating must be a whole number'
      }
    }
  },
  
  // References to other documents with proper validation
  clientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Client ID is required'],
    validate: {
      validator: async function(clientId: mongoose.Types.ObjectId) {
        // Ensure the client exists and has the correct role
        const User = mongoose.model('User');
        const client = await User.findById(clientId);
        return client && (client.role === 'client' || client.role === 'admin');
      },
      message: 'Invalid client reference'
    }
  },
  
  expertId: {
    type: Schema.Types.ObjectId,
    ref: 'Expert',
    required: [true, 'Expert ID is required'],
    validate: {
      validator: async function(expertId: mongoose.Types.ObjectId) {
        // Ensure the expert exists and is active
        const Expert = mongoose.model('Expert');
        const expert = await Expert.findById(expertId);
        return expert && expert.isActive;
      },
      message: 'Invalid expert reference'
    }
  },
  
  projectId: {
    type: Schema.Types.ObjectId,
    ref: 'Project',
    required: false // Optional field for connecting reviews to specific projects
  },
  
  // Review status and moderation flags
  isVerified: {
    type: Boolean,
    default: false // Reviews start unverified and get verified through moderation
  },
  
  isPublic: {
    type: Boolean,
    default: true // Most reviews are public unless client opts for privacy
  },
  
  helpfulVotes: {
    type: Number,
    default: 0,
    min: [0, 'Helpful votes cannot be negative']
  },
  
  // Optional response from the expert
  expertResponse: {
    message: {
      type: String,
      trim: true,
      maxlength: [500, 'Expert response cannot exceed 500 characters']
    },
    respondedAt: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  
  // Optimize JSON output for API responses
  toJSON: {
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Create database indexes for efficient querying
// These indexes optimize the most common query patterns in your application
reviewSchema.index({ expertId: 1, createdAt: -1 }); // Expert's reviews by date
reviewSchema.index({ clientId: 1, createdAt: -1 }); // Client's reviews by date
reviewSchema.index({ rating: -1 }); // Filter by rating quality
reviewSchema.index({ isPublic: 1, isVerified: 1 }); // Public verified reviews
reviewSchema.index({ projectId: 1 }); // Reviews for specific projects
reviewSchema.index({ expertId: 1, rating: -1 }); // Expert ratings for statistics

// Compound index for complex queries combining multiple filters
reviewSchema.index({ 
  expertId: 1, 
  isPublic: 1, 
  isVerified: 1, 
  createdAt: -1 
});

// Pre-save middleware to ensure data consistency
reviewSchema.pre('save', function(next) {
  // Ensure the overall rating aligns reasonably with aspect ratings
  const aspectAverage = (
    this.aspects.communication + 
    this.aspects.quality + 
    this.aspects.timeliness + 
    this.aspects.expertise
  ) / 4;
  
  // If overall rating differs significantly from aspect average, flag for review
  const difference = Math.abs(this.rating - aspectAverage);
  if (difference > 1.5) {
    // This could indicate inconsistent rating or potential manipulation
    this.isVerified = false; // Require manual verification
  }
  
  next();
});

// Post-save middleware to update related models when reviews change
reviewSchema.post('save', async function(doc) {
  try {
    // Update the expert's average rating and review count
    const Expert = mongoose.model('Expert');
    const expert = await Expert.findById(doc.expertId);
    
    if (expert) {
      // Recalculate expert's statistics based on all their reviews
      await expert.calculateAverageRating();
    }
  } catch (error) {
    console.error('Error updating expert statistics after review save:', error);
  }
});

// Instance methods for review-specific operations
reviewSchema.methods.calculateHelpfulness = function(): number {
  // Simple helpfulness score based on votes and review age
  const ageInDays = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyFactor = Math.max(0.1, 1 - (ageInDays / 365)); // Newer reviews weighted higher
  
  return this.helpfulVotes * recencyFactor;
};

reviewSchema.methods.markAsHelpful = async function(): Promise<void> {
  this.helpfulVotes += 1;
  await this.save();
};

reviewSchema.methods.addExpertResponse = async function(message: string): Promise<void> {
  this.expertResponse = {
    message: message.trim(),
    respondedAt: new Date()
  };
  await this.save();
};

// Static methods for common query patterns
reviewSchema.statics.findVerifiedPublicReviews = function(expertId: mongoose.Types.ObjectId) {
  return this.find({
    expertId,
    isPublic: true,
    isVerified: true
  })
  .populate('clientId', 'firstName lastName avatar')
  .sort({ createdAt: -1 });
};

reviewSchema.statics.calculateExpertStatistics = async function(expertId: mongoose.Types.ObjectId) {
  const reviews = await this.find({ expertId, isPublic: true, isVerified: true });
  
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      aspectAverages: {
        communication: 0,
        quality: 0,
        timeliness: 0,
        expertise: 0
      }
    };
  }
  
  const totals = reviews.reduce((acc: { rating: any; communication: any; quality: any; timeliness: any; expertise: any; }, review: { rating: any; aspects: { communication: any; quality: any; timeliness: any; expertise: any; }; }) => {
    acc.rating += review.rating;
    acc.communication += review.aspects.communication;
    acc.quality += review.aspects.quality;
    acc.timeliness += review.aspects.timeliness;
    acc.expertise += review.aspects.expertise;
    return acc;
  }, { rating: 0, communication: 0, quality: 0, timeliness: 0, expertise: 0 });
  
  const count = reviews.length;
  
  return {
    averageRating: Math.round((totals.rating / count) * 10) / 10,
    totalReviews: count,
    aspectAverages: {
      communication: Math.round((totals.communication / count) * 10) / 10,
      quality: Math.round((totals.quality / count) * 10) / 10,
      timeliness: Math.round((totals.timeliness / count) * 10) / 10,
      expertise: Math.round((totals.expertise / count) * 10) / 10
    }
  };
};

// Create and export the model using our properly architected interface
export const ReviewModel = mongoose.model<ReviewDocument>('Review', reviewSchema);