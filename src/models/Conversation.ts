import mongoose, { Schema, Document } from 'mongoose';
import dbConnect from '@/lib/mongodb';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IConversation extends Document {
  title: string;
  scenario: string;
  messages: IMessage[];
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  views: number;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ConversationSchema = new Schema<IConversation>({
  title: {
    type: String,
    required: true
  },
  scenario: {
    type: String,
    required: true
  },
  messages: [MessageSchema],
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  views: {
    type: Number,
    default: 0
  }
});

// Update the updatedAt field on save
ConversationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create a model factory function to ensure we're using the same connection
const getModel = async () => {
  const conn = await dbConnect();
  return conn.models.Conversation || conn.model('Conversation', ConversationSchema);
};

// Export a proxy object that will lazily get the model when needed
const ConversationModel = new Proxy({} as any, {
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

export default ConversationModel;
