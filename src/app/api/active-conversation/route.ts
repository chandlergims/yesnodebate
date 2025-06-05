import { NextResponse } from 'next/server';
import StateModel from '@/models/State';
import { conversationData } from '@/data/conversations';

// Constants
const MESSAGE_INTERVAL = 30; // 30 seconds between messages

export async function GET() {
  try {
    // Get the global state
    const state = await StateModel.findOne({ name: 'global' });
    
    if (!state) {
      return NextResponse.json(
        { error: 'State not found' },
        { status: 404 }
      );
    }
    
    // Get the start time from the state
    const startTime = new Date(state.lastMessageTimestamp);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    // Calculate how many messages should be visible based on the current time
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    const currentMessageIndex = Math.floor(elapsedSeconds / MESSAGE_INTERVAL) + 1; // +1 for the initial message
    
    // Update the state with the current message index
    await StateModel.findOneAndUpdate(
      { name: 'global' },
      { $set: { currentMessageIndex } }
    );
    
    // Always use the AI takeover debate scenario
    const scenarioName = 'Will AI eventually take over the world?';
    const scenarioMessages = conversationData[scenarioName];
    
    // Create messages with timestamps - one message every 30 seconds
    const messages = scenarioMessages.map((message: { role: string; content: string }, index: number) => ({
      ...message,
      timestamp: new Date(startTime.getTime() + (index * MESSAGE_INTERVAL * 1000)),
      isTyping: false,
    }));
    
    // Create the active conversation object
    const activeConversation = {
      _id: startTime.getTime().toString(),
      title: `debate_1.txt`,
      scenario: scenarioName,
      status: 'in_progress',
      startedAt: startTime,
      messages: messages
    };
    
    return NextResponse.json(activeConversation);
  } catch (error) {
    console.error('Error fetching active conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active conversation' },
      { status: 500 }
    );
  }
}
