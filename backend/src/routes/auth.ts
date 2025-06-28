import express, { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { config } from '../config/config';
import { validateUserRegistration, validateUserLogin } from '../middleware/validation';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { authenticate } from '../middleware/auth';
import { AuthenticatedRequest } from '../types';

const router = express.Router();

// Register user
router.post('/register', validateUserRegistration, asyncHandler(async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, role = 'client' } = req.body;

  // Check if user already exists
  const existingUser = await UserModel.findOne({ email });
  if (existingUser) {
    throw createError('User already exists with this email', 400);
  }

  // Create new user
  const user = new UserModel({
    email,
    password,
    firstName,
    lastName,
    role
  });

  await user.save();

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expiresIn } as SignOptions
  );

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      token
    }
  });
}));

// Login user
router.post('/login', validateUserLogin, asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await UserModel.findOne({ email }).select('+password');
  if (!user) {
    throw createError('Invalid email or password', 401);
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw createError('Invalid email or password', 401);
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user._id, role: user.role },
    config.jwt.secret as string,
    { expiresIn: config.jwt.expiresIn } as SignOptions
  );

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified
      },
      token
    }
  });
}));

// Get current user profile
router.get('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    }
  });
}));

// Update user profile
router.put('/me', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { firstName, lastName, avatar } = req.body;

  const updatedUser = await UserModel.findByIdAndUpdate(
    user._id,
    { firstName, lastName, avatar },
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: updatedUser!._id,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        role: updatedUser!.role,
        avatar: updatedUser!.avatar,
        isEmailVerified: updatedUser!.isEmailVerified
      }
    }
  });
}));

// Change password
router.put('/change-password', authenticate, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw createError('Current password and new password are required', 400);
  }

  if (newPassword.length < 6) {
    throw createError('New password must be at least 6 characters long', 400);
  }

  // Get user with password
  const userWithPassword = await UserModel.findById(user._id).select('+password');
  if (!userWithPassword) {
    throw createError('User not found', 404);
  }

  // Verify current password
  const isCurrentPasswordValid = await userWithPassword.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    throw createError('Current password is incorrect', 400);
  }

  // Update password
  userWithPassword.password = newPassword;
  await userWithPassword.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
}));

// Refresh token
router.post('/refresh', asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw createError('Refresh token is required', 400);
  }

  try {
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as { userId: string };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      throw createError('Invalid refresh token', 401);
    }

    // Generate new access token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn } as SignOptions
    );

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    throw createError('Invalid refresh token', 401);
  }
}));

export default router;
