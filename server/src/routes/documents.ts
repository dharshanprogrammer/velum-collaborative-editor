import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import * as Y from 'yjs';
import { DocModel, Role } from '../models/Document.js';
import { VersionModel } from '../models/Version.js';
import { authMiddleware } from '../middleware/auth.js';
import { getOrCreateRoom } from '../websocket/roomManager.js';

export const documentsRouter = Router();

// In-memory fallback if Mongo disconnected
const memoryDocs = new Map<string, any>();
const memoryVersions = new Map<string, any[]>();

const TEMPLATES: Record<string, { title: string; content: string }> = {
  blank: {
    title: 'Untitled document',
    content: '<p></p>',
  },
  'meeting-notes': {
    title: 'Team Sync & Product Strategy',
    content: '<h1>Team Sync & Product Strategy</h1><p><strong>Date:</strong> Today | <strong>Attendees:</strong> @Design, @Engineering</p><h2>Agenda</h2><ul data-type="taskList"><li data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>Review v1.0 release milestones</p></div></li><li data-checked="false"><label><input type="checkbox"><span></span></label><div><p>Yjs CRDT WebSocket stress testing</p></div></li></ul><h2>Action Items</h2><p>Solidify UI design tokens and prepare demo.</p>',
  },
  'project-brief': {
    title: 'Project Brief: Next-Gen Canvas',
    content: '<h1>Project Brief: Next-Gen Canvas</h1><p>A quiet, ultra-responsive document platform engineered for high-velocity teams.</p><h2>Problem Statement</h2><p>Legacy tools suffer from cursor teleportation, clunky UI modals, and lost edits during network drops.</p><h2>Target Metrics</h2><p>INP &lt; 100ms, 60fps animations, 0 keystroke loss guarantee.</p>',
  },
  'weekly-report': {
    title: 'Weekly Engineering Report',
    content: '<h1>Weekly Engineering Report</h1><p>Highlights of the sprint, shipped primitives, and core performance audits.</p><h2>Shipped Features</h2><ul><li>Integrated Yjs real-time collaboration with custom awareness.</li><li>Command palette (Cmd+K) and full keyboard shortcuts.</li><li>Local-first IndexedDB persistence.</li></ul>',
  },
};

// 1. List documents
documentsRouter.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const filter = (req.query.filter as string) || 'all'; // all, shared, starred, trash
    const search = ((req.query.search as string) || '').trim().toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let docs: any[] = [];

    if (isDbConnected) {
      let query: any = {};
      if (filter === 'trash') {
        query.isTrash = true;
        query.$or = [{ ownerId: userId }, { 'members.user': userId }];
      } else {
        query.isTrash = false;
        if (filter === 'starred') {
          query.isStarred = true;
          query.$or = [{ ownerId: userId }, { 'members.user': userId }];
        } else if (filter === 'shared') {
          query.ownerId = { $ne: userId };
          query['members.user'] = userId;
        } else {
          // all
          query.$or = [{ ownerId: userId }, { 'members.user': userId }];
        }
      }

      if (search) {
        query.title = { $regex: search, $options: 'i' };
      }

      docs = await DocModel.find(query)
        .populate('ownerId', 'name email colorIndex')
        .populate('members.user', 'name email colorIndex')
        .sort({ updatedAt: -1 })
        .lean();
    } else {
      docs = Array.from(memoryDocs.values()).filter((doc) => {
        const isMember = doc.ownerId === userId || doc.members?.some((m: any) => m.user === userId || m.user?.id === userId);
        if (!isMember) return false;
        if (filter === 'trash') return doc.isTrash === true;
        if (doc.isTrash) return false;
        if (filter === 'starred') return doc.isStarred === true;
        if (filter === 'shared') return doc.ownerId !== userId;
        if (search && !doc.title.toLowerCase().includes(search)) return false;
        return true;
      });
    }

    return res.json({ documents: docs });
  } catch (err: any) {
    console.error('[List Docs Error]:', err);
    return res.status(500).json({ message: 'Failed to retrieve documents' });
  }
});

// 2. Create document
documentsRouter.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const templateKey = (req.body.template as string) || 'blank';
    const template = TEMPLATES[templateKey] || TEMPLATES.blank;
    const title = req.body.title || template.title;
    const isDbConnected = mongoose.connection.readyState === 1;

    // Seed initial Y.Doc state
    const ydoc = new Y.Doc();
    const ytext = ydoc.getXmlFragment('default');
    const update = Y.encodeStateAsUpdate(ydoc);
    const ydocBuffer = Buffer.from(update);

    let doc: any;
    const initialContent = template.content || '<p></p>';
    const coverId = req.body.coverId || null;
    const icon = req.body.icon || '📄';

    if (isDbConnected) {
      doc = await DocModel.create({
        title,
        ownerId: userId,
        content: initialContent,
        coverId,
        icon,
        ydocState: ydocBuffer,
        contentPreview: initialContent.replace(/<[^>]*>?/gm, '').slice(0, 160),
        members: [{ user: userId, role: 'owner' }],
        accessPolicy: 'restricted',
        isStarred: false,
        isTrash: false,
      });

      doc = await DocModel.findById(doc._id)
        .populate('ownerId', 'name email colorIndex')
        .populate('members.user', 'name email colorIndex');
    } else {
      const docId = new mongoose.Types.ObjectId().toString();
      doc = {
        _id: docId,
        title,
        ownerId: {
          _id: userId,
          name: req.user!.name,
          email: req.user!.email,
          colorIndex: req.user!.colorIndex,
        },
        content: initialContent,
        coverId,
        icon,
        ydocState: ydocBuffer,
        contentPreview: initialContent.replace(/<[^>]*>?/gm, '').slice(0, 160),
        members: [{ user: { _id: userId, name: req.user!.name, email: req.user!.email }, role: 'owner' }],
        accessPolicy: 'restricted',
        isStarred: false,
        isTrash: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryDocs.set(docId, doc);
    }

    return res.status(201).json({ document: doc });
  } catch (err: any) {
    console.error('[Create Doc Error]:', err);
    return res.status(500).json({ message: 'Failed to create document' });
  }
});

// 3. Get single document
documentsRouter.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const isDbConnected = mongoose.connection.readyState === 1;

    let doc: any = null;
    if (isDbConnected && mongoose.isValidObjectId(id)) {
      doc = await DocModel.findById(id)
        .populate('ownerId', 'name email colorIndex')
        .populate('members.user', 'name email colorIndex')
        .lean();
    } else {
      doc = memoryDocs.get(id);
    }

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Role check
    let userRole: Role = 'viewer';
    const isOwner = doc.ownerId?._id?.toString() === userId || doc.ownerId === userId;
    if (isOwner) {
      userRole = 'owner';
    } else {
      const memberEntry = doc.members?.find(
        (m: any) => (m.user?._id?.toString() || m.user?.toString() || m.user) === userId
      );
      if (memberEntry) {
        userRole = memberEntry.role;
      } else if (doc.accessPolicy === 'public_edit') {
        userRole = 'editor';
      } else if (doc.accessPolicy === 'public_view') {
        userRole = 'viewer';
      } else {
        return res.status(403).json({ message: 'Access denied to this document' });
      }
    }

    return res.json({ document: doc, role: userRole });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to load document' });
  }
});

// 4. Update document metadata and content
documentsRouter.patch('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, isStarred, isTrash, accessPolicy, content, contentPreview, coverId, icon } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    let doc: any = null;
    if (isDbConnected && mongoose.isValidObjectId(id)) {
      doc = await DocModel.findById(id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });

      if (title !== undefined) doc.title = title;
      if (isStarred !== undefined) doc.isStarred = isStarred;
      if (isTrash !== undefined) doc.isTrash = isTrash;
      if (accessPolicy !== undefined) doc.accessPolicy = accessPolicy;
      if (coverId !== undefined) doc.coverId = coverId;
      if (icon !== undefined) doc.icon = icon;
      if (content !== undefined) {
        doc.content = content;
        doc.contentPreview = (contentPreview || content.replace(/<[^>]*>?/gm, '')).slice(0, 160);
      }

      await doc.save();
    } else {
      doc = memoryDocs.get(id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });

      if (title !== undefined) doc.title = title;
      if (isStarred !== undefined) doc.isStarred = isStarred;
      if (isTrash !== undefined) doc.isTrash = isTrash;
      if (accessPolicy !== undefined) doc.accessPolicy = accessPolicy;
      if (coverId !== undefined) doc.coverId = coverId;
      if (icon !== undefined) doc.icon = icon;
      if (content !== undefined) {
        doc.content = content;
        doc.contentPreview = (contentPreview || content.replace(/<[^>]*>?/gm, '')).slice(0, 160);
      }
      doc.updatedAt = new Date();
      memoryDocs.set(id, doc);
    }

    return res.json({ document: doc });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to update document' });
  }
});

// 5. Permanent delete
documentsRouter.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && mongoose.isValidObjectId(id)) {
      await DocModel.findByIdAndDelete(id);
      await VersionModel.deleteMany({ documentId: id });
    } else {
      memoryDocs.delete(id);
      memoryVersions.delete(id);
    }

    return res.json({ message: 'Document deleted permanently' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to delete document' });
  }
});

// 6. Share / invite members
documentsRouter.post('/:id/members', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected && mongoose.isValidObjectId(id)) {
      const doc = await DocModel.findById(id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });

      // Find user by email
      const { User } = await import('../models/User.js');
      const targetUser = await User.findOne({ email: email.toLowerCase() });
      if (!targetUser) {
        return res.status(404).json({ message: 'No registered user found with that email' });
      }

      const existingIdx = doc.members.findIndex((m: any) => m.user.toString() === targetUser._id.toString());
      if (existingIdx >= 0) {
        doc.members[existingIdx].role = role || 'editor';
      } else {
        doc.members.push({ user: targetUser._id, role: role || 'editor' });
      }

      await doc.save();
      const updatedDoc = await DocModel.findById(id)
        .populate('ownerId', 'name email colorIndex')
        .populate('members.user', 'name email colorIndex');
      return res.json({ document: updatedDoc });
    } else {
      const doc = memoryDocs.get(id);
      if (!doc) return res.status(404).json({ message: 'Document not found' });
      const targetId = new mongoose.Types.ObjectId().toString();
      doc.members = doc.members || [];
      doc.members.push({
        user: { _id: targetId, name: email.split('@')[0], email, colorIndex: 2 },
        role: role || 'editor',
      });
      memoryDocs.set(id, doc);
      return res.json({ document: doc });
    }
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to invite collaborator' });
  }
});

// 7. Version history: list snapshots
documentsRouter.get('/:id/versions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    let versions: any[] = [];
    if (isDbConnected && mongoose.isValidObjectId(id)) {
      versions = await VersionModel.find({ documentId: id })
        .populate('authorId', 'name email colorIndex')
        .sort({ createdAt: -1 })
        .lean();
    } else {
      versions = memoryVersions.get(id) || [];
    }

    return res.json({ versions });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to retrieve version history' });
  }
});

// 8. Create named version snapshot
documentsRouter.post('/:id/versions', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { versionName, contentSnapshot } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    // Get current YDoc from room or DB
    const room = getOrCreateRoom(id);
    const update = Y.encodeStateAsUpdate(room.ydoc);
    const ydocBuffer = Buffer.from(update);

    let version: any;
    if (isDbConnected && mongoose.isValidObjectId(id)) {
      version = await VersionModel.create({
        documentId: id,
        versionName: versionName || 'Named version',
        isNamed: true,
        authorId: userId,
        ydocState: ydocBuffer,
        contentSnapshot: contentSnapshot || '',
      });
      version = await VersionModel.findById(version._id).populate('authorId', 'name email colorIndex');
    } else {
      const vId = new mongoose.Types.ObjectId().toString();
      version = {
        _id: vId,
        documentId: id,
        versionName: versionName || 'Named version',
        isNamed: true,
        authorId: {
          _id: userId,
          name: req.user!.name,
          email: req.user!.email,
          colorIndex: req.user!.colorIndex,
        },
        ydocState: ydocBuffer,
        contentSnapshot: contentSnapshot || '',
        createdAt: new Date(),
      };
      const list = memoryVersions.get(id) || [];
      list.unshift(version);
      memoryVersions.set(id, list);
    }

    return res.status(201).json({ version });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to create version snapshot' });
  }
});

// 9. Restore a version snapshot
documentsRouter.post('/:id/restore-version/:versionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id, versionId } = req.params;
    const isDbConnected = mongoose.connection.readyState === 1;

    let targetVersion: any = null;
    if (isDbConnected && mongoose.isValidObjectId(versionId)) {
      targetVersion = await VersionModel.findById(versionId);
    } else {
      const list = memoryVersions.get(id) || [];
      targetVersion = list.find((v: any) => v._id === versionId);
    }

    if (!targetVersion) {
      return res.status(404).json({ message: 'Version snapshot not found' });
    }

    // Apply binary state into active room YDoc
    const room = getOrCreateRoom(id);
    Y.applyUpdate(room.ydoc, targetVersion.ydocState);

    // Save to DB
    if (isDbConnected && mongoose.isValidObjectId(id)) {
      await DocModel.findByIdAndUpdate(id, {
        ydocState: targetVersion.ydocState,
        contentPreview: (targetVersion.contentSnapshot || '').slice(0, 160),
      });
    }

    return res.json({ message: 'Document restored to snapshot successfully' });
  } catch (err: any) {
    return res.status(500).json({ message: 'Failed to restore version snapshot' });
  }
});
