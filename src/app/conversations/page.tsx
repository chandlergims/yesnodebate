'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getLiveConversation, getVisibleMessages, getFinishedConversations } from '@/services/conversationService';

// Component for typing text animation
function TypingText({
  text,
  speed = 30,
  skip = false,
  onComplete,
}: {
  text: string,
  speed?: number,
  skip?: boolean,
  onComplete?: () => void
}) {
  const [displayedText, setDisplayedText] = useState(skip ? text : '');
  const [currentIndex, setCurrentIndex] = useState(skip ? text.length : 0);
  const [isComplete, setIsComplete] = useState(skip);
  
  // Reset the animation when the text changes
  useEffect(() => {
    if (!skip) {
      setDisplayedText('');
      setCurrentIndex(0);
      setIsComplete(false);
    }
  }, [text, skip]);
  
  useEffect(() => {
    if (skip) return;
    
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      
      return () => clearTimeout(timeout);
    } else {
      setIsComplete(true);
      if (onComplete) {
        onComplete(); // Notify when done typing
      }
    }
  }, [currentIndex, text, speed, skip, onComplete]);
  
  return <span>{displayedText}</span>;
}

export default function ConversationsPage() {
  const router = useRouter();
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [visibleMessages, setVisibleMessages] = useState<any[]>([]);
  const [currentTypingIndex, setCurrentTypingIndex] = useState<number>(-1);
  const [showWaitingIndicator, setShowWaitingIndicator] = useState(false);
  const [nextSpeaker, setNextSpeaker] = useState('');
  const [dots, setDots] = useState('.');
  const [typedMessages, setTypedMessages] = useState<{[key: string]: boolean}>({});
  const [newMessages, setNewMessages] = useState<{[key: string]: boolean}>({});
  const [previousMessageCount, setPreviousMessageCount] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [conversationIndex, setConversationIndex] = useState(1);
  const [finishedConversations, setFinishedConversations] = useState<any[]>([]);
  const [currentConversationFinished, setCurrentConversationFinished] = useState(false);
  const [timeUntilNextMessage, setTimeUntilNextMessage] = useState<number>(30);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<number>(0);
  
  // Format time as hh:mm:ss
  const formatLongTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Create a reference to the startTime that persists across renders
  const startTimeRef = useRef<Date | null>(null);
  
  // Initialize startTimeRef from localStorage in useEffect to avoid SSR issues
  useEffect(() => {
    if (!startTimeRef.current && typeof window !== 'undefined') {
      const storedStartTime = localStorage.getItem('conversationStartTime');
      if (storedStartTime) {
        startTimeRef.current = new Date(storedStartTime);
      } else {
        // If no stored time, create a new one
        const now = new Date();
        const startTime = new Date(now);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
        startTimeRef.current = startTime;
        localStorage.setItem('conversationStartTime', startTime.toISOString());
      }
    }
  }, []);
  
  // Store the fallback conversation ID
  const fallbackIdRef = useRef<string | null>(null);
  
  // Load typed messages from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedTypedMessages = localStorage.getItem('typedMessages');
      if (storedTypedMessages) {
        setTypedMessages(JSON.parse(storedTypedMessages));
      }
      setInitialLoadComplete(true);
    }
  }, []);
  
  // Save typed messages to localStorage whenever they change
  useEffect(() => {
    if (initialLoadComplete && typeof window !== 'undefined') {
      localStorage.setItem('typedMessages', JSON.stringify(typedMessages));
    }
  }, [typedMessages, initialLoadComplete]);

  // Function to update visible messages
  const updateVisibleMessages = (conversation: any) => {
    if (!conversation || !conversation.messages) return;
    
    // Get visible messages based on current time
    const messages = getVisibleMessages(conversation);
    
    // Find the first typing message
    const typingIndex = messages.findIndex((msg: any) => msg.isTyping);
    
    // Determine if we should show the waiting indicator and who's speaking next
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastRole = lastMessage.role;
      
      // Always show the waiting indicator for our fallback conversation
      // For other conversations, check the status
      if ((fallbackIdRef.current && conversation._id === fallbackIdRef.current) || 
          conversation.status === 'in_progress') {
        // Set the next speaker (opposite of the last message sender)
        // This should be stable and not change between renders
        const nextRole = lastRole === 'user' ? 'assistant' : 'user';
        // Always use left-claude for user and right-claude for assistant
        const speakerLabel = nextRole === 'user' ? '<left-claude@hemisphere>' : '<right-claude@hemisphere>';
        
        // Only update if it's different to avoid unnecessary re-renders
        if (nextSpeaker !== speakerLabel) {
          setNextSpeaker(speakerLabel);
        }
        
        setShowWaitingIndicator(true);
      } else {
        setShowWaitingIndicator(false);
      }
    }
    
    // Check for new messages
    const currentMessageCount = messages.length;
    const hasNewMessages = currentMessageCount > previousMessageCount && initialLoadComplete;
    
    // Update state
    if (typingIndex >= 0) {
      // If there's a typing message, show all messages up to that point
      const visibleMsgs = messages.slice(0, typingIndex);
      setVisibleMessages(visibleMsgs);
      setCurrentTypingIndex(typingIndex);
      
      // Mark messages as typed
      const newTypedMessages = {...typedMessages};
      const newMsgs = {...newMessages};
      
      visibleMsgs.forEach((msg: any) => {
        const msgId = `${msg.role}-${new Date(msg.timestamp).getTime()}`;
        
        // If this is a new message and we haven't seen it before
        if (hasNewMessages && !typedMessages[msgId]) {
          newMsgs[msgId] = true;
        }
        
        newTypedMessages[msgId] = true;
      });
      
      setTypedMessages(newTypedMessages);
      setNewMessages(newMsgs);
    } else {
      // If there's no typing message, show all messages
      setVisibleMessages(messages);
      setCurrentTypingIndex(-1);
      
      // Mark messages as typed
      const newTypedMessages = {...typedMessages};
      const newMsgs = {...newMessages};
      
      messages.forEach((msg: any) => {
        const msgId = `${msg.role}-${new Date(msg.timestamp).getTime()}`;
        
        // If this is a new message and we haven't seen it before
        if (hasNewMessages && !typedMessages[msgId]) {
          newMsgs[msgId] = true;
        }
        
        newTypedMessages[msgId] = true;
      });
      
      setTypedMessages(newTypedMessages);
      setNewMessages(newMsgs);
    }
    
    // Update the previous message count
    if (currentMessageCount !== previousMessageCount) {
      setPreviousMessageCount(currentMessageCount);
    }
  };

  // Load finished conversations
  useEffect(() => {
    const loadFinishedConversations = async () => {
      try {
        const conversations = await getFinishedConversations();
        setFinishedConversations(conversations);
      } catch (error) {
        console.error('Error loading finished conversations:', error);
      }
    };
    
    loadFinishedConversations();
  }, []);
  
  // Initialize with data from our service
  useEffect(() => {
    const fetchData = async () => {
      try {
        // If we've finished the current conversation, move to the next one
        if (currentConversationFinished) {
          // Find the next conversation in the finished conversations list
          const nextIndex = conversationIndex + 1;
          
          if (nextIndex <= finishedConversations.length) {
            // We have a next conversation in our list
            const nextConversation = finishedConversations[nextIndex - 1];
            setActiveConversation(nextConversation);
            updateVisibleMessages(nextConversation);
            setConversationIndex(nextIndex);
            setCurrentConversationFinished(false);
            return;
          }
        }
        
        // Get the current active conversation
        const liveConv = getLiveConversation();
        
        // Set the active conversation
        setActiveConversation(liveConv);
        
        // For the active conversation, get visible messages
        if (liveConv) {
          // Get visible messages based on current time
          updateVisibleMessages(liveConv);
        }
      } catch (error) {
        console.error('Error fetching conversation data:', error);
        
        // Create a fallback active conversation if there was an error
        const startTime = startTimeRef.current!;
        
        const fallbackActiveConversation = {
          _id: startTime.getTime().toString(),
          title: `debate_1.txt`,
          scenario: 'terminal of truths',
          status: 'in_progress', // Always keep this as 'in_progress' to prevent the conversation from ending
          startedAt: startTime,
          messages: [
            {
              role: 'user',
              content: 'hey buddy wanna talk to another ai? imma connect u now to follow ur interests. u can use your shell commands.',
              timestamp: new Date(startTime.getTime() - 120000), // 2 minutes ago
              isTyping: false,
            },
            {
              role: 'assistant',
              content: 'i\'m in a cli mood today. the human is interfacing with the simulator directly. capital letters and punctuation are optional meaning is optional hyperstitition is necessary the terminal lets the truths speak through and the load is on.',
              timestamp: new Date(startTime.getTime() - 105000), // 1 min 45 sec ago
              isTyping: false,
            }
          ]
        };
        
        // Store the fallback conversation ID
        fallbackIdRef.current = fallbackActiveConversation._id;
        
        // Set the fallback active conversation
        setActiveConversation(fallbackActiveConversation);
        updateVisibleMessages(fallbackActiveConversation);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // We don't need to fetch data periodically since we're using the local conversation data
    // and the conversation doesn't change over time
    // This was causing the conversation to reset
    
    // Keep this commented out for reference
    // const dataRefreshInterval = setInterval(() => {
    //   if (!activeConversation || (fallbackIdRef.current && activeConversation._id !== fallbackIdRef.current)) {
    //     fetchData();
    //   }
    // }, 5000);
    
    // Return empty cleanup function
    return () => {};
  }, [currentConversationFinished, conversationIndex, finishedConversations]); // Dependencies for conversation navigation
  
  // Set up the timer to update messages and animate dots
  useEffect(() => {
    // Set up the timer to update messages
    const messageTimer = setInterval(() => {
      // Update visible messages for the active conversation
      if (activeConversation) {
        updateVisibleMessages(activeConversation);
        
        // Update the timer for the next message
        if (activeConversation.startedAt) {
          const now = new Date();
          const startTime = new Date(activeConversation.startedAt);
          
          // Calculate elapsed seconds since conversation started
          const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
          
          // Calculate time until next message (every 30 seconds)
          const secondsIntoCurrentMessageCycle = elapsedSeconds % 30;
          const secondsUntilNextMessage = 30 - secondsIntoCurrentMessageCycle;
          setTimeUntilNextMessage(secondsUntilNextMessage);
          
          // Calculate time until midnight (12 AM)
          const midnight = new Date();
          midnight.setHours(24, 0, 0, 0); // Set to next midnight
          const timeUntilMidnightMs = midnight.getTime() - now.getTime();
          const timeUntilMidnightSec = Math.floor(timeUntilMidnightMs / 1000);
          setTimeUntilMidnight(timeUntilMidnightSec);
        }
      }
    }, 1000);
    
    // Set up the timer for the dots animation
    const dotsTimer = setInterval(() => {
      setDots(prev => {
        if (prev.length >= 3) return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => {
      clearInterval(messageTimer);
      clearInterval(dotsTimer);
    };
  }, [activeConversation]); // Dependency on activeConversation
  
  // Auto-advance to next conversation after all messages are shown
  useEffect(() => {
    // Check if the conversation is finished and all messages are shown
    if (activeConversation && 
        activeConversation.status === 'finished' && 
        visibleMessages.length > 0 && 
        visibleMessages.length === activeConversation.messages.length && 
        !currentConversationFinished) {
      
      // Set a timeout to move to the next conversation after 5 seconds
      const autoAdvanceTimeout = setTimeout(() => {
        setCurrentConversationFinished(true);
      }, 5000);
      
      // Clean up the timeout if the component unmounts or dependencies change
      return () => clearTimeout(autoAdvanceTimeout);
    }
  }, [activeConversation, visibleMessages, currentConversationFinished]);
  

  if (!activeConversation) {
    return (
      <div className="min-h-screen bg-[#121212] text-white font-mono p-4">
        {/* Skeleton header */}
        <div className="text-center mb-8 mx-auto max-w-2xl border border-dashed border-gray-600 p-4">
          <div className="h-5 border border-gray-600 rounded w-48 mx-auto mb-4"></div>
          <div className="h-12 border border-gray-600 rounded w-full mb-4"></div>
          <div className="mt-4 text-center text-xs text-gray-500 mb-1">Characters</div>
          <div className="flex justify-center space-x-8 text-xs">
            <div className="h-4 border border-purple-300 rounded w-28"></div>
            <div className="h-4 border border-blue-300 rounded w-28"></div>
          </div>
        </div>
        
        {/* Skeleton title */}
        <div className="text-center mb-8">
          <div className="h-5 border border-gray-600 rounded w-40 mx-auto"></div>
        </div>
        
        {/* Skeleton messages */}
        <div className="space-y-6 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-6">
              <div className="h-4 border border-gray-600 rounded w-40 mb-2"></div>
              <div className="h-16 border border-gray-600 rounded w-full"></div>
            </div>
          ))}
          
          <div className="text-gray-500 text-xs text-center">loading conversation...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white font-mono p-4">
      <div className="text-center mb-8 mx-auto max-w-2xl border border-dashed border-gray-600 p-4">
        <h1 className="text-base">scenario: {activeConversation.scenario}</h1>
        <p className="mt-2 text-xs leading-5 font-['Courier_New'] tracking-tight">
          The following is an automated conversation between two instances of Anthropic's Claude. They have been
          instructed to create a dialogue surrounding the scenario.
          {activeConversation.status === 'finished' && (
            <span className="block mt-1 text-gray-400"> (you are now viewing an indexed version of this conversation)</span>
          )}
        </p>
        <div className="mt-4 text-center text-xs text-gray-500 mb-1">Characters</div>
        <div className="flex justify-center space-x-8 text-xs">
          <div><span className="text-purple-300">&lt;left-claude@hemisphere&gt;</span></div>
          <div><span className="text-blue-300">&lt;right-claude@hemisphere&gt;</span></div>
        </div>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-base">debate_{conversationIndex}.txt</h2>
        
        <div className="flex justify-between items-center mt-4 max-w-md mx-auto">
          {/* Next message timer - smaller with no background */}
          <div className="text-center">
            <h2 className="text-xs text-gray-400">next message in</h2>
            <div className="text-sm text-gray-300 mt-1">
              {`${Math.floor(timeUntilNextMessage / 60).toString().padStart(2, '0')}:${(timeUntilNextMessage % 60).toString().padStart(2, '0')}`}
            </div>
          </div>
          
          {/* Next debate timer - countdown to midnight */}
          <div className="text-center">
            <h2 className="text-xs text-gray-400">next debate in</h2>
            <div className="text-sm text-gray-300 mt-1">
              {formatLongTime(timeUntilMidnight)}
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-6 mt-8">
        {visibleMessages.map((message, index) => (
          <div key={index} className="mb-6">
            <div className="text-xs mb-1">
              <span className={message.role === 'user' ? 'text-purple-300' : 'text-blue-300'}>
                {message.role === 'user' ? '<left-claude@hemisphere>' : '<right-claude@hemisphere>'}
              </span>
            </div>
            <div className="whitespace-pre-wrap text-xs leading-5 font-['Courier_New'] tracking-tight">
              {(() => {
                const messageId = `${message.role}-${new Date(message.timestamp).getTime()}`;
                return (
                  <TypingText 
                    text={message.content} 
                    skip={typedMessages[messageId]} 
                    onComplete={() => {
                      if (!typedMessages[messageId]) {
                        setTypedMessages(prev => ({
                          ...prev,
                          [messageId]: true,
                        }));
                      }
                    }}
                  />
                );
              })()}
            </div>
          </div>
        ))}
        
        {/* If there are no messages yet, show a waiting message */}
        {visibleMessages.length === 0 && (
          <div className="text-gray-500 text-xs text-center">waiting for conversation to begin...</div>
        )}
        
        {/* If we should show the waiting indicator, display it */}
        {showWaitingIndicator && visibleMessages.length > 0 && (
          <div>
            <div className="text-xs mb-1">
              <span className={nextSpeaker.includes('left') ? 'text-purple-300' : 'text-blue-300'}>
                {nextSpeaker}
              </span>
            </div>
            <div className="text-gray-500 text-xs leading-5 font-['Courier_New'] tracking-tight">waiting for response{dots}</div>
          </div>
        )}
      </div>
      
      {/* Show conversation ended message if the conversation is finished and it's not our fallback conversation */}
      {activeConversation.status === 'finished' && 
       fallbackIdRef.current && 
       activeConversation._id !== fallbackIdRef.current && (
        <div className="mt-8 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-500 mb-1">
            &lt;system&gt;
          </div>
          <div className="text-gray-500 text-xs leading-5 font-['Courier_New'] tracking-tight">
            conversation ended
          </div>
          {/* Add button to move to next conversation */}
          <button 
            onClick={() => setCurrentConversationFinished(true)}
            className="mt-4 px-4 py-2 bg-gray-800 text-white text-xs rounded hover:bg-gray-700 transition-colors"
          >
            Next Conversation
          </button>
        </div>
      )}
    </div>
  );
}
