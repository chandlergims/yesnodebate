import { NextRequest, NextResponse } from 'next/server';
import { getActiveConversation } from '@/services/stateService';
import { getVisibleMessages } from '@/services/conversationService';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // For now, we only have one active conversation
    const conversation = await getActiveConversation();
    
    if (!conversation || conversation._id !== id) {
      return NextResponse.json(
        { error: 'Conversation not found' },
        { status: 404 }
      );
    }
    
    // Get visible messages for the conversation
    const visibleMessages = getVisibleMessages(conversation);
    
    // Return the conversation with visible messages
    return NextResponse.json({
      ...conversation,
      visibleMessages
    });
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversation' },
      { status: 500 }
    );
  }
}
