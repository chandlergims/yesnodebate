import { NextResponse } from 'next/server';
import { getActiveConversation, getArchivedConversations } from '@/services/stateService';

export async function GET() {
  try {
    // Get the active conversation
    const activeConversation = await getActiveConversation();
    
    // Get archived conversations
    const archivedConversations = await getArchivedConversations();
    
    // Return both active and archived conversations
    return NextResponse.json({
      active: activeConversation,
      archived: archivedConversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}
