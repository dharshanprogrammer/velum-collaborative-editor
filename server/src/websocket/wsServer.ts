import { Server as HttpServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import url from 'url';
import * as Y from 'yjs';
import * as syncProtocol from 'y-protocols/sync';
import * as awarenessProtocol from 'y-protocols/awareness';
import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';
import mongoose from 'mongoose';
import { verifyToken, AuthUserPayload } from '../middleware/auth.js';
import { DocModel, Role } from '../models/Document.js';
import { getOrCreateRoom, removeConnectionFromRoom, Room } from './roomManager.js';

const messageSync = 0;
const messageAwareness = 1;

export function setupWebSocketServer(httpServer: HttpServer) {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', async (request, socket, head) => {
    try {
      const parsedUrl = url.parse(request.url || '', true);
      const pathname = parsedUrl.pathname;

      if (!pathname?.startsWith('/ws')) {
        socket.destroy();
        return;
      }

      const token = (parsedUrl.query.token as string) || '';
      const docId = (parsedUrl.query.docId as string) || '';

      if (!token || !docId) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      const user = verifyToken(token);
      if (!user) {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
        socket.destroy();
        return;
      }

      // Check document permission
      let role: Role = 'viewer';
      if (mongoose.connection.readyState === 1 && mongoose.isValidObjectId(docId)) {
        const doc: any = await DocModel.findById(docId).lean();
        if (!doc) {
          socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
          socket.destroy();
          return;
        }

        const isOwner = doc.ownerId.toString() === user.id;
        if (isOwner) {
          role = 'owner';
        } else {
          const member = doc.members?.find((m: any) => m.user.toString() === user.id);
          if (member) {
            role = member.role;
          } else if (doc.accessPolicy === 'public_edit') {
            role = 'editor';
          } else if (doc.accessPolicy === 'public_view') {
            role = 'viewer';
          } else {
            socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
            socket.destroy();
            return;
          }
        }
      } else {
        // Fallback for tests/in-memory mode: default to editor
        role = 'editor';
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request, { user, docId, role });
      });
    } catch (err: any) {
      console.error('[WS Upgrade Error]:', err.message);
      socket.destroy();
    }
  });

  wss.on('connection', (ws: WebSocket, _req: any, context: { user: AuthUserPayload; docId: string; role: Role }) => {
    const { user, docId, role } = context;
    const room = getOrCreateRoom(docId);

    room.conns.set(ws, {
      user,
      role,
      lastActive: Date.now(),
    });

    console.log(`[WS] User ${user.name} (${user.email}) connected to doc ${docId} as ${role}. Total peers: ${room.conns.size}`);

    // Send initial Sync Step 1 to new client
    const encoder = encoding.createEncoder();
    encoding.writeVarUint(encoder, messageSync);
    syncProtocol.writeSyncStep1(encoder, room.ydoc);
    ws.send(encoding.toUint8Array(encoder));

    // Send role notification
    sendJson(ws, 'ROLE_INFO', { role, docId });

    // Broadcast join event to all other peers
    broadcastToRoom(room, ws, 'PEER_JOINED', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        colorIndex: user.colorIndex,
      },
    });

    ws.on('message', (data: Buffer | ArrayBuffer) => {
      try {
        const uint8Array = new Uint8Array(data as any);
        if (uint8Array.length === 0) return;

        // Check if JSON message (control plane)
        try {
          const text = new TextDecoder().decode(uint8Array);
          if (text.startsWith('{') && text.endsWith('}')) {
            const parsed = JSON.parse(text);
            handleControlMessage(room, ws, parsed);
            return;
          }
        } catch (_) {}

        const decoder = decoding.createDecoder(uint8Array);
        const messageType = decoding.readVarUint(decoder);

        switch (messageType) {
          case messageSync: {
            const conn = room.conns.get(ws);
            // Server-side RBAC: If viewer, drop update messages!
            if (conn?.role === 'viewer') {
              // Read sync message type (first byte of sync payload)
              const syncType = decoding.peekVarUint(decoder);
              if (syncType === 2) { // 2 = sync step 2 / update
                console.warn(`[WS RBAC] Dropped unauthorized write attempt from viewer ${user.email} on doc ${docId}`);
                sendJson(ws, 'ERROR_NOTICE', { message: 'You have read-only access. Edits are not synchronized.' });
                return;
              }
            }

            // Normal sync handling
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageSync);
            syncProtocol.readSyncMessage(decoder, encoder, room.ydoc, ws);

            if (encoding.length(encoder) > 1) {
              ws.send(encoding.toUint8Array(encoder));
            }

            // Broadcast the update to all other connected peers in this room
            room.conns.forEach((_, client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(uint8Array);
              }
            });
            break;
          }

          case messageAwareness: {
            // Relay awareness (cursor, selection, presence) to all other peers
            room.conns.forEach((_, client) => {
              if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(uint8Array);
              }
            });
            break;
          }
        }
      } catch (err: any) {
        console.error('[WS Message Error]:', err.message);
      }
    });

    ws.on('close', () => {
      console.log(`[WS] User ${user.name} left doc ${docId}`);
      removeConnectionFromRoom(room, ws);
      broadcastToRoom(room, ws, 'PEER_LEFT', { userId: user.id });
    });

    ws.on('error', (err) => {
      console.error(`[WS Socket Error] doc ${docId}:`, err.message);
    });
  });

  // Heartbeat ping interval (30 seconds)
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 30000);

  wss.on('close', () => {
    clearInterval(interval);
  });

  return wss;
}

function sendJson(ws: WebSocket, type: string, payload: any) {
  if (ws.readyState !== WebSocket.OPEN) return;
  ws.send(JSON.stringify({ type, ...payload }));
}

function broadcastToRoom(room: Room, excludeWs: WebSocket, type: string, payload: any) {
  const jsonStr = JSON.stringify({ type, ...payload });
  room.conns.forEach((_, client) => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  });
}

function handleControlMessage(room: Room, ws: WebSocket, msg: any) {
  if (msg.type === 'PING') {
    ws.send(JSON.stringify({ type: 'PONG' }));
  } else if (msg.type === 'DOC_CONTENT_UPDATE' && msg.content !== undefined) {
    broadcastToRoom(room, ws, 'DOC_CONTENT_UPDATE', {
      content: msg.content,
      senderId: msg.senderId,
    });
  } else if (msg.type === 'UPDATE_ROLE' && msg.targetUserId && msg.newRole) {
    // Notify target user of live permission change
    room.conns.forEach((conn, client) => {
      if (conn.user.id === msg.targetUserId) {
        conn.role = msg.newRole;
        sendJson(client, 'ROLE_CHANGED', { newRole: msg.newRole });
        console.log(`[WS Live RBAC] User ${conn.user.email} updated to role ${msg.newRole}`);
      }
    });
  }
}
