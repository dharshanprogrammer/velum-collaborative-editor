import * as Y from 'yjs';
import { WebSocket } from 'ws';
import mongoose from 'mongoose';
import { DocModel, Role } from '../models/Document.js';
import { AuthUserPayload } from '../middleware/auth.js';

export interface RoomConnection {
  user: AuthUserPayload;
  role: Role;
  lastActive: number;
}

export interface Room {
  docId: string;
  ydoc: Y.Doc;
  conns: Map<WebSocket, RoomConnection>;
  isDirty: boolean;
  debounceTimer: NodeJS.Timeout | null;
  maxWaitTimer: NodeJS.Timeout | null;
}

const rooms = new Map<string, Room>();

export function getOrCreateRoom(docId: string): Room {
  let room = rooms.get(docId);
  if (!room) {
    const ydoc = new Y.Doc();
    room = {
      docId,
      ydoc,
      conns: new Map(),
      isDirty: false,
      debounceTimer: null,
      maxWaitTimer: null,
    };

    // Load initial YDoc state from DB if available
    loadDocState(room).catch((err) => {
      console.warn(`[RoomManager] Failed to preload YDoc state for ${docId}:`, err.message);
    });

    // Listen to changes to mark dirty and schedule debounced persistence
    ydoc.on('update', () => {
      room!.isDirty = true;
      scheduleDebouncedSave(room!);
    });

    rooms.set(docId, room);
  }
  return room;
}

async function loadDocState(room: Room) {
  try {
    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(room.docId)) {
      const doc: any = await DocModel.findById(room.docId).select('ydocState').lean();
      if (doc?.ydocState && doc.ydocState.length > 2) {
        try {
          Y.applyUpdate(room.ydoc, new Uint8Array(doc.ydocState));
          console.log(`[RoomManager] Restored persisted state for doc ${room.docId}`);
        } catch (e: any) {
          console.warn(`[RoomManager] Skipped malformed ydocState for ${room.docId}:`, e.message);
        }
      }
    }
  } catch (err: any) {
    console.error(`[RoomManager] Error loading doc state:`, err.message);
  }
}

export function scheduleDebouncedSave(room: Room) {
  if (room.debounceTimer) {
    clearTimeout(room.debounceTimer);
  }

  // 2s debounced write
  room.debounceTimer = setTimeout(() => {
    persistRoom(room);
  }, 2000);

  // 10s max-wait write
  if (!room.maxWaitTimer) {
    room.maxWaitTimer = setTimeout(() => {
      persistRoom(room);
    }, 10000);
  }
}

export async function persistRoom(room: Room) {
  if (room.debounceTimer) {
    clearTimeout(room.debounceTimer);
    room.debounceTimer = null;
  }
  if (room.maxWaitTimer) {
    clearTimeout(room.maxWaitTimer);
    room.maxWaitTimer = null;
  }

  if (!room.isDirty) return;
  room.isDirty = false;

  try {
    const update = Y.encodeStateAsUpdate(room.ydoc);
    const buffer = Buffer.from(update);

    if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(room.docId)) {
      await DocModel.findByIdAndUpdate(room.docId, {
        ydocState: buffer,
        updatedAt: new Date(),
      });
      console.log(`[RoomManager] Compacted and persisted doc ${room.docId} (${buffer.length} bytes)`);
    }
  } catch (err: any) {
    console.error(`[RoomManager] Failed to persist room ${room.docId}:`, err.message);
  }
}

export function removeConnectionFromRoom(room: Room, ws: WebSocket) {
  room.conns.delete(ws);
  if (room.conns.size === 0) {
    // Flush on last disconnect
    persistRoom(room).finally(() => {
      // Unload room after 5 minutes of inactivity if still 0 connections
      setTimeout(() => {
        if (room.conns.size === 0) {
          room.ydoc.destroy();
          rooms.delete(room.docId);
          console.log(`[RoomManager] Evicted inactive room ${room.docId}`);
        }
      }, 5 * 60 * 1000);
    });
  }
}

// Graceful flush on SIGTERM / SIGINT
export async function flushAllRooms() {
  console.log(`[RoomManager] Flushing ${rooms.size} active rooms to database...`);
  const promises: Promise<void>[] = [];
  for (const room of rooms.values()) {
    if (room.isDirty) {
      promises.push(persistRoom(room));
    }
  }
  await Promise.all(promises);
  console.log('[RoomManager] All active rooms flushed successfully.');
}
