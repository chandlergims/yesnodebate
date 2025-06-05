import { getLiveConversation } from '@/services/conversationService';

// Constants
const MESSAGE_INTERVAL = 30; // 30 seconds between messages

/**
 * Get the active conversation
 */
export function getActiveConversation() {
  // Simply return the live conversation from conversationService
  return getLiveConversation();
}

/**
 * Get all archived conversations - simplified to return empty array
 */
export function getArchivedConversations() {
  return [];
}

/**
 * Update the state - no-op since we're not using a database
 */
export function updateState() {
  // No-op
  return;
}
