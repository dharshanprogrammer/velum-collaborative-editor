export type Role = 'owner' | 'editor' | 'viewer';
export type AccessPolicy = 'restricted' | 'public_view' | 'public_edit';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  colorIndex: number;
}

export interface DocumentMember {
  user: UserProfile;
  role: Role;
}

export interface DocumentItem {
  _id: string;
  title: string;
  ownerId: UserProfile;
  content?: string;
  contentPreview?: string;
  coverId?: string | null;
  icon?: string;
  members: DocumentMember[];
  accessPolicy: AccessPolicy;
  isStarred: boolean;
  isTrash: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollaboratorPeer {
  id: string;
  tabId?: string;
  name: string;
  email: string;
  colorIndex: number;
  cursor?: {
    anchor?: number;
    head?: number;
    x?: number;
    y?: number;
  };
  selection?: {
    from: number;
    to: number;
  };
  isTyping?: boolean;
  lastActive: number;
  isIdle?: boolean;
}

export interface CommentReaction {
  emoji: string;
  userId: string;
}

export interface CommentReply {
  _id: string;
  authorId: UserProfile;
  content: string;
  createdAt: string;
}

export interface CommentThread {
  _id: string;
  documentId: string;
  authorId: UserProfile;
  content: string;
  anchor: {
    from: number;
    to: number;
    quote?: string;
    relativePosition?: string;
  };
  resolved: boolean;
  resolvedBy?: UserProfile;
  reactions: CommentReaction[];
  replies: CommentReply[];
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  _id: string;
  documentId: string;
  versionName: string;
  isNamed: boolean;
  authorId: UserProfile;
  contentSnapshot: string;
  createdAt: string;
}
