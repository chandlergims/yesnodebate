import { NextRequest, NextResponse } from 'next/server';
import StateModel from '@/models/State';

export async function GET() {
  try {
    // Get the global state or create it if it doesn't exist
    let state = await StateModel.findOne({ name: 'global' });
    
    if (!state) {
      // Create a new global state with default values
      state = await StateModel.create({
        name: 'global',
        currentConversationIndex: 0,
        currentMessageIndex: 0,
        lastMessageTimestamp: new Date()
      });
    }
    
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error fetching state:', error);
    return NextResponse.json(
      { error: 'Failed to fetch state' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Update the global state
    const state = await StateModel.findOneAndUpdate(
      { name: 'global' },
      {
        $set: {
          currentConversationIndex: data.currentConversationIndex,
          currentMessageIndex: data.currentMessageIndex,
          lastMessageTimestamp: new Date()
        }
      },
      { upsert: true, new: true }
    );
    
    return NextResponse.json(state);
  } catch (error) {
    console.error('Error updating state:', error);
    return NextResponse.json(
      { error: 'Failed to update state' },
      { status: 500 }
    );
  }
}
