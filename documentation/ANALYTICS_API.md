# Analytics API Documentation

## Overview
The Analytics API provides real-time metrics and insights for the AutomateHub platform, replacing the previous mock data implementation with actual MongoDB calculations.

## Endpoints

### GET /api/analytics
**Description**: Get comprehensive platform analytics with time-based filtering.

**Query Parameters**:
- `timeRange` (optional): Time period for analytics. Options: `7d`, `30d`, `90d`, `1y`. Default: `30d`

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "platformMetrics": {
      "totalProjects": 1247,
      "successRate": 96.8,
      "avgProjectValue": 8450,
      "clientSatisfaction": 4.9
    },
    "expertMetrics": {
      "activeExperts": 156,
      "avgResponseTime": "2.3h",
      "expertRetention": 94,
      "avgRating": 4.8
    },
    "revenueData": [
      {
        "period": "Jan",
        "value": 125000,
        "target": 120000
      }
    ],
    "projectData": [
      {
        "period": "Week 1",
        "value": 23
      }
    ],
    "categoryData": [
      {
        "category": "E-commerce Integration",
        "count": 342,
        "percentage": 35
      }
    ],
    "ratingDistribution": {
      "fiveStars": 78,
      "fourStars": 18,
      "threeStars": 3,
      "twoStars": 1,
      "oneStars": 0
    },
    "changes": {
      "totalProjects": 12.5,
      "successRate": 2.1,
      "avgProjectValue": 8.3,
      "clientSatisfaction": 0.1
    }
  }
}
```

### GET /api/analytics/platform
**Description**: Get platform-specific metrics only.

**Query Parameters**:
- `timeRange` (optional): Time period for analytics. Default: `30d`

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "totalProjects": 1247,
    "successRate": 96.8,
    "totalRevenue": 2450000,
    "clientSatisfaction": 4.9,
    "timeRange": "30d"
  }
}
```

### GET /api/analytics/expert
**Description**: Get overview analytics for all experts.

**Query Parameters**:
- `timeRange` (optional): Time period for analytics. Default: `30d`

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "totalExperts": 156,
    "activeExperts": 89,
    "avgRating": 4.8,
    "expertRetention": 94,
    "topExperts": [
      {
        "id": "expert_id",
        "name": "John Doe",
        "title": "Senior Developer",
        "rating": 4.9,
        "reviews": 45,
        "projects": 23
      }
    ],
    "timeRange": "30d"
  }
}
```

### GET /api/analytics/expert/:id
**Description**: Get detailed analytics for a specific expert.

**Path Parameters**:
- `id`: Expert ID (MongoDB ObjectId)

**Query Parameters**:
- `timeRange` (optional): Time period for analytics. Default: `30d`

**Response Structure**:
```json
{
  "success": true,
  "data": {
    "expert": {
      "id": "expert_id",
      "name": "John Doe",
      "title": "Senior Developer",
      "avatar": "avatar_url"
    },
    "metrics": {
      "totalProjects": 15,
      "completedProjects": 14,
      "successRate": 93.3,
      "totalEarnings": 45000,
      "avgRating": 4.9,
      "totalReviews": 12,
      "responseTime": "within 2 hours"
    },
    "recentProjects": [
      {
        "id": "project_id",
        "title": "E-commerce Integration",
        "status": "completed",
        "budget": 5000,
        "startDate": "2024-01-15T00:00:00.000Z",
        "progress": 100
      }
    ],
    "timeRange": "30d"
  }
}
```

## Data Sources

### Platform Metrics
- **Total Projects**: Count of projects created in the time range
- **Success Rate**: Percentage of completed projects vs. total projects
- **Avg Project Value**: Average budget of projects in the time range
- **Client Satisfaction**: Average rating from all verified public reviews

### Expert Metrics
- **Active Experts**: Number of experts with projects in the time range
- **Avg Response Time**: Currently static, can be calculated from message timestamps
- **Expert Retention**: Currently static, requires historical expert data
- **Avg Rating**: Average rating from expert reviews in the time range

### Revenue Data
- **Monthly Revenue**: Sum of completed project budgets by month
- **Targets**: Currently set to 90% of actual revenue for demo purposes

### Project Data
- **Weekly Projects**: Count of projects created per week

### Category Data
- **Project Categories**: Grouped by expert specialties with counts and percentages

### Rating Distribution
- **Star Ratings**: Percentage distribution of review ratings (1-5 stars)

## Authentication
All endpoints require authentication. Include the Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## Implementation Notes

1. **Real-time Calculations**: All metrics are calculated in real-time from MongoDB collections
2. **Performance**: Uses MongoDB aggregation pipelines for efficient data processing
3. **Caching**: Consider implementing Redis caching for frequently accessed analytics
4. **Time Zones**: All dates are stored and calculated in UTC
5. **Scalability**: Indexes are in place for optimal query performance

## Frontend Integration

The frontend `AnalyticsDashboard` component automatically fetches data from these endpoints and displays:
- Platform overview metrics with percentage changes
- Expert performance indicators
- Revenue and project trend charts
- Category distribution charts
- Rating distribution visualizations

The dashboard refreshes data when the time range is changed and handles loading states and errors gracefully.
