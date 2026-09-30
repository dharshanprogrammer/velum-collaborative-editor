import mongoose, { Document, Schema, Types } from 'mongoose';

export type Role = 'owner' | 'editor' | 'viewer';
export type AccessPolicy = 'restricted' | 'public_view' | 'public_edit';

export interface IMember {
  user: Types.ObjectId;
  role: Role;
}

export interface IDocument extends Document {
  title: string;
  ownerId: Types.ObjectId;
  content?: string;
  contentPreview?: string;
  coverId?: string | null;
  icon?: string;
  ydocState?: Buffer;
  members: IMember[];
  accessPolicy: AccessPolicy;
  isStarred: boolean;
  isTrash: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MemberSchema = new Schema<IMember>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'editor', 'viewer'], default: 'editor' },
  },
  { _id: false }
);

const DocumentSchema = new Schema<IDocument>(
  {
    title: { type: String, default: 'Untitled document', trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    content: { type: String, default: '' },
    contentPreview: { type: String, default: '' },
    coverId: { type: String, default: null },
    icon: { type: String, default: '📄' },
    ydocState: { type: Buffer },
    members: [MemberSchema],
    accessPolicy: {
      type: String,
      enum: ['restricted', 'public_view', 'public_edit'],
      default: 'restricted',
    },
    isStarred: { type: Boolean, default: false },
    isTrash: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export const DocModel = mongoose.models.Document || mongoose.model<IDocument>('Document', DocumentSchema);
