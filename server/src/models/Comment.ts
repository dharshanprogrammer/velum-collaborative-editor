import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReaction {
  emoji: string;
  userId: Types.ObjectId;
}

export interface IReply {
  _id?: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface IComment extends Document {
  documentId: Types.ObjectId;
  authorId: Types.ObjectId;
  content: string;
  anchor: {
    from: number;
    to: number;
    quote?: string;
    relativePosition?: string;
  };
  resolved: boolean;
  resolvedBy?: Types.ObjectId;
  reactions: IReaction[];
  replies: IReply[];
  createdAt: Date;
  updatedAt: Date;
}

const ReplySchema = new Schema<IReply>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ReactionSchema = new Schema<IReaction>(
  {
    emoji: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false }
);

const CommentSchema = new Schema<IComment>(
  {
    documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    anchor: {
      from: { type: Number, default: 0 },
      to: { type: Number, default: 0 },
      quote: { type: String },
      relativePosition: { type: String },
    },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reactions: [ReactionSchema],
    replies: [ReplySchema],
  },
  { timestamps: true }
);

export const CommentModel = mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema);
