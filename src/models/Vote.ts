import mongoose, { Schema, Document } from 'mongoose';
import dbConnect from '@/lib/mongodb';

export interface IVote extends Document {
  topic: string;
  votes: number;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>({
  topic: {
    type: String,
    required: true,
    unique: true
  },
  votes: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
VoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a model factory function to ensure we're using the same connection
const getModel = async () => {
  const conn = await dbConnect();
  return conn.models.Vote || conn.model('Vote', VoteSchema);
};

// Export a proxy object that will lazily get the model when needed
const VoteModel = new Proxy({} as any, {
  get: (target, prop) => {
    return async (...args: any[]) => {
      const model = await getModel();
      const method = (model as any)[prop];
      if (typeof method === 'function') {
        return method.apply(model, args);
      }
      return method;
    };
  }
});

export default VoteModel;
