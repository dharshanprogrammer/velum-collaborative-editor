import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { CommentModel } from '../models/Comment.js';
import { authMiddleware } from '../middleware/auth.js';

export const commentsRouter = Router();

const memoryComments = new Map<string, any[]>();

// 1. Get comments for doc
commentsRouter.get('/:documentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    let comments: any[] = [];
    if (isDbConnected && mongoose.isValidObjectId(documentId)) {
      comments = await CommentModel.find({ documentId })
        .populate('authorId', 'name email colorIndex')
        .populate('replies.authorId', 'name email colorIndex')
        .sort({ createdAt: 1 })
        .lean();
    } else {
      comments = memoryComments.get(documentId) || [];
    }

    return res.json({ comments });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to fetch comments' });
  }
});

// 2. Create comment
commentsRouter.post('/:documentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;
    const { content, anchor } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    let comment: any;
    if (isDbConnected && mongoose.isValidObjectId(documentId)) {
      comment = await CommentModel.create({
        documentId,
        authorId: userId,
        content,
        anchor: anchor || { from: 0, to: 0 },
        reactions: [],
        replies: [],
      });
      comment = await CommentModel.findById(comment._id)
        .populate('authorId', 'name email colorIndex')
        .lean();
    } else {
      const cId = new mongoose.Types.ObjectId().toString();
      comment = {
        _id: cId,
        documentId,
        authorId: {
          _id: userId,
          name: req.user!.name,
          email: req.user!.email,
          colorIndex: req.user!.colorIndex,
        },
        content,
        anchor: anchor || { from: 0, to: 0 },
        resolved: false,
        reactions: [],
        replies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const list = memoryComments.get(documentId) || [];
      list.push(comment);
      memoryComments.set(documentId, list);
    }

    return res.status(201).json({ comment });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to post comment' });
  }
});

// 3. Resolve / unresolve
commentsRouter.patch('/:commentId/resolve', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { resolved } = req.body;
    const userId = req.user!.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let comment: any = null;
    if (isDbConnected && mongoose.isValidObjectId(commentId)) {
      comment = await CommentModel.findByIdAndUpdate(
        commentId,
        { resolved: !!resolved, resolvedBy: resolved ? userId : null },
        { new: true }
      ).populate('authorId', 'name email colorIndex');
    } else {
      for (const list of memoryComments.values()) {
        const found = list.find((c) => c._id === commentId);
        if (found) {
          found.resolved = !!resolved;
          comment = found;
          break;
        }
      }
    }

    return res.json({ comment });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update comment' });
  }
});

// 4. Add reply
commentsRouter.post('/:commentId/reply', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let comment: any = null;
    if (isDbConnected && mongoose.isValidObjectId(commentId)) {
      comment = await CommentModel.findByIdAndUpdate(
        commentId,
        {
          $push: {
            replies: {
              authorId: userId,
              content,
              createdAt: new Date(),
            },
          },
        },
        { new: true }
      )
        .populate('authorId', 'name email colorIndex')
        .populate('replies.authorId', 'name email colorIndex');
    } else {
      for (const list of memoryComments.values()) {
        const found = list.find((c) => c._id === commentId);
        if (found) {
          found.replies.push({
            _id: new mongoose.Types.ObjectId().toString(),
            authorId: {
              _id: userId,
              name: req.user!.name,
              email: req.user!.email,
              colorIndex: req.user!.colorIndex,
            },
            content,
            createdAt: new Date(),
          });
          comment = found;
          break;
        }
      }
    }

    return res.json({ comment });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to post reply' });
  }
});

// 5. Add reaction
commentsRouter.post('/:commentId/react', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { emoji } = req.body;
    const userId = req.user!.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let comment: any = null;
    if (isDbConnected && mongoose.isValidObjectId(commentId)) {
      const existing = await CommentModel.findById(commentId);
      if (existing) {
        const rIdx = existing.reactions.findIndex(
          (r: any) => r.userId.toString() === userId && r.emoji === emoji
        );
        if (rIdx >= 0) {
          existing.reactions.splice(rIdx, 1);
        } else {
          existing.reactions.push({ emoji, userId: new mongoose.Types.ObjectId(userId) });
        }
        await existing.save();
        comment = await CommentModel.findById(commentId).populate('authorId', 'name email colorIndex');
      }
    } else {
      for (const list of memoryComments.values()) {
        const found = list.find((c) => c._id === commentId);
        if (found) {
          const rIdx = found.reactions.findIndex(
            (r: any) => (r.userId?.toString() || r.userId) === userId && r.emoji === emoji
          );
          if (rIdx >= 0) {
            found.reactions.splice(rIdx, 1);
          } else {
            found.reactions.push({ emoji, userId });
          }
          comment = found;
          break;
        }
      }
    }

    return res.json({ comment });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update reaction' });
  }
});
