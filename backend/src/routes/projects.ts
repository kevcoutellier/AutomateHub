import express from 'express';
import { ProjectModel } from '../models/Project';
import { ExpertModel } from '../models/Expert';
import { authenticate, authorize } from '../middleware/auth';
import { validateProject, validatePagination, validateObjectId } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { AuthenticatedRequest, ProjectQuery } from '../types';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Get projects with filtering and pagination
router.get('/', authenticate, validatePagination, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const {
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order = 'desc',
    status,
    dateFrom,
    dateTo
  } = req.query as any;

  // Build query based on user role
  const query: any = {};
  
  if (user.role === 'client') {
    query.clientId = user._id;
  } else if (user.role === 'expert') {
    // Find expert profile
    const expert = await ExpertModel.findOne({ userId: user._id });
    if (expert) {
      query.expertId = expert._id;
    }
  }

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const sortObj: any = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const projects = await ProjectModel.find(query)
    .sort(sortObj)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await ProjectModel.countDocuments(query);

  res.json({
    success: true,
    data: {
      projects,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    }
  });
}));

// Get project by ID
router.get('/:id', authenticate, validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const projectId = req.params.id;

  const project = await ProjectModel.findById(projectId);

  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check access permissions
  const expert = user.role === 'expert' ? await ExpertModel.findOne({ userId: user._id }) : null;
  const hasAccess = 
    project.clientId.toString() === (user._id as string).toString() ||
    (expert && project.expertId.toString() === (expert._id as string).toString()) ||
    user.role === 'admin';

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  res.json({
    success: true,
    data: { project }
  });
}));

// Create new project
router.post('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  
  // Check if user has client role
  if (user.role !== 'client') {
    throw createError('Only clients can create projects', 403);
  }
  const { title, description, budget, startDate, endDate, expertId } = req.body;

  // Verify expert exists
  const expert = await ExpertModel.findById(expertId);
  if (!expert) {
    throw createError('Expert not found', 404);
  }

  const project = new ProjectModel({
    title,
    description,
    budget: {
      total: budget.total,
      spent: 0,
      currency: budget.currency || 'USD'
    },
    startDate,
    endDate,
    expertId,
    clientId: user._id,
    milestones: [],
    messages: [],
    files: []
  });

  await project.save();

  res.status(201).json({
    success: true,
    message: 'Project created successfully',
    data: { project }
  });
}));

// Update project
router.put('/:id', authenticate, validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const projectId = req.params.id;

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check permissions
  const expert = user.role === 'expert' ? await ExpertModel.findOne({ userId: user._id }) : null;
  const isClient = project.clientId.toString() === (user._id as string).toString();
  const isAssignedExpert = expert && project.expertId && project.expertId.toString() === (expert._id as string).toString();
  const isAdmin = user.role === 'admin';
  
  if (!isClient && !isAssignedExpert && !isAdmin) {
    throw createError('Access denied', 403);
  }

  // Define allowed updates based on user role
  let allowedUpdates: string[];
  if (isClient || isAdmin) {
    allowedUpdates = ['title', 'description', 'budget', 'endDate', 'status'];
  } else if (isAssignedExpert) {
    // Experts can only update status (accept/decline projects)
    allowedUpdates = ['status'];
  } else {
    allowedUpdates = [];
  }

  const updates: any = {};
  
  allowedUpdates.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const updatedProject = await ProjectModel.findByIdAndUpdate(
    projectId,
    updates,
    { new: true, runValidators: true }
  ).populate('expertId', 'name title avatar rating')
   .populate('clientId', 'firstName lastName avatar');

  res.json({
    success: true,
    message: 'Project updated successfully',
    data: { project: updatedProject }
  });
}));

// Update project progress (expert only)
router.put('/:id/progress', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  
  // Check if user has expert role
  if (user.role !== 'expert') {
    throw createError('Only experts can update progress', 403);
  }
  const projectId = req.params.id;
  const { progress } = req.body;

  if (typeof progress !== 'number' || progress < 0 || progress > 100) {
    throw createError('Progress must be a number between 0 and 100', 400);
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check if expert is assigned to this project
  const expert = await ExpertModel.findOne({ userId: user._id });
  if (!expert || project.expertId.toString() !== (expert._id as string).toString()) {
    throw createError('Access denied', 403);
  }

  project.progress = progress;
  
  // Auto-update status based on progress
  if (progress === 100 && project.status !== 'completed') {
    project.status = 'completed';
  } else if (progress > 0 && project.status === 'planning') {
    project.status = 'in-progress';
  }

  await project.save();

  res.json({
    success: true,
    message: 'Project progress updated successfully',
    data: { project }
  });
}));

// Add milestone
router.post('/:id/milestones', authenticate, validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const projectId = req.params.id;
  const { title, description, dueDate, deliverables } = req.body;

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check access permissions
  const expert = user.role === 'expert' ? await ExpertModel.findOne({ userId: user._id }) : null;
  const hasAccess = 
    project.clientId.toString() === (user._id as string).toString() ||
    (expert && project.expertId.toString() === (expert._id as string).toString());

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  const milestone = {
    id: uuidv4(),
    title,
    description,
    status: 'pending' as const,
    dueDate: new Date(dueDate),
    deliverables: deliverables || []
  };

  project.milestones.push(milestone);
  await project.save();

  res.status(201).json({
    success: true,
    message: 'Milestone added successfully',
    data: { milestone }
  });
}));

// Update milestone status
router.put('/:id/milestones/:milestoneId', authenticate, validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const { id: projectId, milestoneId } = req.params;
  const { status, completedDate } = req.body;

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check access permissions
  const expert = user.role === 'expert' ? await ExpertModel.findOne({ userId: user._id }) : null;
  const hasAccess = 
    project.clientId.toString() === (user._id as string).toString() ||
    (expert && project.expertId.toString() === (expert._id as string).toString());

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  const milestone = project.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw createError('Milestone not found', 404);
  }

  milestone.status = status;
  if (status === 'completed' && completedDate) {
    milestone.completedDate = new Date(completedDate);
  }

  await project.save();

  res.json({
    success: true,
    message: 'Milestone updated successfully',
    data: { milestone }
  });
}));

// Add message to project
router.post('/:id/messages', authenticate, validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const projectId = req.params.id;
  const { content, messageType = 'text', attachments } = req.body;

  if (!content || content.trim().length === 0) {
    throw createError('Message content is required', 400);
  }

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check access permissions
  const expert = user.role === 'expert' ? await ExpertModel.findOne({ userId: user._id }) : null;
  let senderRole: 'client' | 'expert';
  let hasAccess = false;

  if (project.clientId.toString() === (user._id as string).toString()) {
    senderRole = 'client';
    hasAccess = true;
  } else if (expert && project.expertId.toString() === (expert._id as string).toString()) {
    senderRole = 'expert';
    hasAccess = true;
  }

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  const message = {
    id: uuidv4(),
    senderId: (user._id as string).toString(),
    senderRole: senderRole!,
    content: content.trim(),
    timestamp: new Date(),
    attachments: attachments || [],
    messageType
  };

  project.messages.push(message);
  await project.save();

  res.status(201).json({
    success: true,
    message: 'Message sent successfully',
    data: { message }
  });
}));

// Get project messages
router.get('/:id/messages', authenticate, validateObjectId, asyncHandler(async (req: AuthenticatedRequest, res: express.Response) => {
  const user = req.user!;
  const projectId = req.params.id;
  const { page = 1, limit = 50 } = req.query as any;

  const project = await ProjectModel.findById(projectId);
  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check access permissions
  const expert = user.role === 'expert' ? await ExpertModel.findOne({ userId: user._id }) : null;
  const hasAccess = 
    project.clientId.toString() === (user._id as string).toString() ||
    (expert && project.expertId.toString() === (expert._id as string).toString()) ||
    user.role === 'admin';

  if (!hasAccess) {
    throw createError('Access denied', 403);
  }

  // Sort messages by timestamp (newest first) and paginate
  const sortedMessages = project.messages
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const paginatedMessages = sortedMessages.slice(skip, skip + parseInt(limit));

  res.json({
    success: true,
    data: {
      messages: paginatedMessages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: sortedMessages.length,
        pages: Math.ceil(sortedMessages.length / parseInt(limit))
      }
    }
  });
}));

export default router;
