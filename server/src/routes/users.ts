import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

export const usersRouter = Router();

usersRouter.get('/search', authMiddleware, async (req: Request, res: Response) => {
  try {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    if (!q) return res.json({ users: [] });

    const isDbConnected = mongoose.connection.readyState === 1;
    let results: any[] = [];

    if (isDbConnected) {
      results = await User.find({
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
        ],
      })
        .select('name email colorIndex')
        .limit(10)
        .lean();
    }

    return res.json({ users: results });
  } catch (err: any) {
    return res.status(500).json({ message: 'User search failed' });
  }
});
