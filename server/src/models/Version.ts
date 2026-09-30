import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVersion extends Document {
  documentId: Types.ObjectId;
  versionName: string;
  isNamed: boolean;
  authorId: Types.ObjectId;
  ydocState: Buffer;
  contentSnapshot: string;
  createdAt: Date;
}

const VersionSchema = new Schema<IVersion>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    versionName: { type: String, default: 'Autosave snapshot' },
    isNamed: { type: Boolean, default: false },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    ydocState: { type: Buffer, required: true },
    contentSnapshot: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const VersionModel = mongoose.models.Version || mongoose.model<IVersion>('Version', VersionSchema);
