import mongoose, { Schema, Document } from 'mongoose';
import dbConnect from '@/lib/mongodb';

export interface IState extends Document {
  name: string; // Use this as a unique identifier instead of _id
  currentConversationIndex: number;
  currentMessageIndex: number;
  lastMessageTimestamp: Date;
}

const StateSchema = new Schema<IState>({
  name: { type: String, required: true, unique: true, default: 'global' },
  currentConversationIndex: { type: Number, required: true, default: 0 },
  currentMessageIndex: { type: Number, required: true, default: 0 },
  lastMessageTimestamp: { type: Date, required: true, default: Date.now }
});

// Set up JSON serialization
StateSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  }
});

// Create a model factory function to ensure we're using the same connection
const getModel = async () => {
  const conn = await dbConnect();
  return conn.models.State || conn.model('State', StateSchema);
};

// Export a proxy object that will lazily get the model when needed
const StateModel = new Proxy({} as any, {
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

export default StateModel;
