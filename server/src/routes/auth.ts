import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import mongoose from 'mongoose';
import { User, IUser } from '../models/User.js';
import { signToken, authMiddleware } from '../middleware/auth.js';

export const authRouter = Router();

// Fallback in-memory users cache if DB connection is intermittent
const memoryUsers = new Map<string, any>();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

authRouter.post('/register', async (req: Request, res: Response) => {
  try {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: parse.error.issues[0]?.message || 'Invalid input' });
    }

    const { name, email, password } = parse.data;
    const isDbConnected = mongoose.connection.readyState === 1;

    let existingUser = null;
    if (isDbConnected) {
      existingUser = await User.findOne({ email: email.toLowerCase() });
    } else {
      existingUser = Array.from(memoryUsers.values()).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
    }

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const colorIndex = Math.floor(Math.random() * 12);

    let newUser: any;
    if (isDbConnected) {
      newUser = await User.create({
        name,
        email: email.toLowerCase(),
        passwordHash,
        colorIndex,
      });
    } else {
      newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        colorIndex,
        createdAt: new Date(),
      };
      memoryUsers.set(newUser._id.toString(), newUser);
    }

    const token = signToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      colorIndex: newUser.colorIndex,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        colorIndex: newUser.colorIndex,
      },
      token,
    });
  } catch (err: any) {
    console.error('[Auth Register Error]:', err);
    return res.status(500).json({ message: 'Failed to create account. Please try again.' });
  }
});

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ message: parse.error.issues[0]?.message || 'Invalid credentials' });
    }

    const { email, password } = parse.data;
    const isDbConnected = mongoose.connection.readyState === 1;

    let user: any = null;
    if (isDbConnected) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = Array.from(memoryUsers.values()).find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
    }

    if (!user) {
      return res.status(401).json({ message: "That password doesn't match this email" });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "That password doesn't match this email" });
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      colorIndex: user.colorIndex ?? 0,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        colorIndex: user.colorIndex ?? 0,
      },
      token,
    });
  } catch (err: any) {
    console.error('[Auth Login Error]:', err);
    return res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    let user: any = null;
    if (isDbConnected) {
      user = await User.findById(req.user?.id).select('-passwordHash');
    } else {
      user = memoryUsers.get(req.user?.id || '');
    }

    if (!user) {
      return res.json({
        user: {
          id: req.user?.id,
          name: req.user?.name,
          email: req.user?.email,
          colorIndex: req.user?.colorIndex ?? 0,
        },
      });
    }

    return res.json({
      user: {
        id: user._id?.toString() || user.id,
        name: user.name,
        email: user.email,
        colorIndex: user.colorIndex ?? 0,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch user profile' });
  }
});

authRouter.post('/guest', async (_req: Request, res: Response) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const guestName = `Guest Writer ${randomSuffix}`;
    const guestEmail = `guest.${Date.now()}.${randomSuffix}@cowrite.local`;
    const colorIndex = Math.floor(Math.random() * 12);

    let newUser: any;
    if (isDbConnected) {
      newUser = await User.create({
        name: guestName,
        email: guestEmail,
        passwordHash: 'guest_no_password',
        colorIndex,
      });
    } else {
      newUser = {
        _id: new mongoose.Types.ObjectId().toString(),
        name: guestName,
        email: guestEmail,
        colorIndex,
        createdAt: new Date(),
      };
      memoryUsers.set(newUser._id.toString(), newUser);
    }

    const token = signToken({
      id: newUser._id.toString(),
      email: newUser.email,
      name: newUser.name,
      colorIndex: newUser.colorIndex,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        colorIndex: newUser.colorIndex,
      },
      token,
    });
  } catch (err: any) {
    console.error('[Auth Guest Error]:', err);
    return res.status(500).json({ message: 'Failed to create guest session' });
  }
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('token');
  return res.json({ message: 'Logged out successfully' });
});
