import { conversationData, ConversationMessage, MessageRole, ScenarioName } from '@/data/conversations';

// Define extended message type with timestamp and typing status
interface ConversationMessageWithStatus extends ConversationMessage {
  timestamp: Date;
  isTyping: boolean;
}

// Constants
const MESSAGE_INTERVAL = 30; // 30 seconds between messages

// We'll use localStorage to persist the start time across refreshes
let globalStartTime: Date | null = null;

/**
 * Get the current live conversation with synchronized message visibility
 */
export function getLiveConversation() {
  // Try to get the start time from localStorage first
  if (!globalStartTime && typeof window !== 'undefined') {
    const storedStartTime = localStorage.getItem('conversationStartTime');
    if (storedStartTime) {
      globalStartTime = new Date(storedStartTime);
    }
  }
  
  // If we still don't have a start time, initialize it
  if (!globalStartTime) {
    const now = new Date();
    
    // Just use the current time, but reset seconds and milliseconds
    globalStartTime = new Date(now);
    globalStartTime.setSeconds(0);
    globalStartTime.setMilliseconds(0);
    
    // Store it in localStorage for persistence across refreshes
    if (typeof window !== 'undefined') {
      localStorage.setItem('conversationStartTime', globalStartTime.toISOString());
    }
  }
  
  // Always use the AI takeover debate scenario
  const scenarioName = 'Will AI eventually take over the world?' as ScenarioName;
  const scenarioMessages = conversationData[scenarioName];
  
  // Create messages with timestamps - one message every 30 seconds
  const messages = scenarioMessages.map((message: ConversationMessage, index: number) => ({
    ...message,
    timestamp: new Date(globalStartTime!.getTime() + (index * MESSAGE_INTERVAL * 1000)),
    isTyping: false,
  }));
  
  return {
    _id: globalStartTime!.getTime().toString(),
    title: `debate_1.txt`,
    scenario: scenarioName,
    status: 'in_progress',
    startedAt: globalStartTime,
    messages: messages
  };
}

/**
 * Get recent finished conversations - simplified to return empty array
 */
export function getFinishedConversations() {
  return [];
}

/**
 * Get visible messages for a conversation based on the current time
 * This ensures all users see the same messages at the same time
 */
export function getVisibleMessages(conversation: any) {
  if (!conversation || !conversation.messages || !conversation.startedAt) {
    return [];
  }
  
  const now = new Date();
  const startTime = new Date(conversation.startedAt);
  
  // Calculate how many seconds have passed since the conversation started
  const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
  
  // Calculate how many messages should be visible (one message every MESSAGE_INTERVAL seconds)
  const visibleMessageCount = Math.min(
    Math.floor(elapsedSeconds / MESSAGE_INTERVAL) + 1, // +1 for the initial message
    conversation.messages.length
  );
  
  // Get the visible messages
  const visibleMessages = conversation.messages.slice(0, visibleMessageCount);
  
  // If we're in the middle of displaying a new message, mark it as typing
  if (visibleMessageCount > 0 && visibleMessageCount <= conversation.messages.length) {
    const lastMessageIndex = visibleMessageCount - 1;
    const secondsSinceLastMessage = elapsedSeconds - (lastMessageIndex * MESSAGE_INTERVAL);
    
    // If we're in the first 5 seconds of the message interval, show typing animation
    if (secondsSinceLastMessage < 5 && lastMessageIndex < conversation.messages.length) {
      const result = [...visibleMessages];
      result[lastMessageIndex] = {
        ...result[lastMessageIndex],
        isTyping: true
      };
      return result;
    }
  }
  
  return visibleMessages;
}
