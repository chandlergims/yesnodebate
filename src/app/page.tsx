'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { getLiveConversation } from '@/services/conversationService';
import VoteSection from '@/components/VoteSection';

// Interface for vote data
interface Vote {
  id: string;
  topic: string;
  votes: number;
  percentage: number;
}

export default function Home() {
  const [activeConversation, setActiveConversation] = useState<any>(null);
  const [timeUntilNextMessage, setTimeUntilNextMessage] = useState<number>(30);
  const [timeUntilMidnight, setTimeUntilMidnight] = useState<number>(0);
  const [currentSpeaker, setCurrentSpeaker] = useState<string>("left"); // "left" or "right"
  const [winningTopic, setWinningTopic] = useState<string>("");
  
  // Store the start time reference
  const startTimeRef = useRef<Date | null>(null);
  
  // Initialize the conversation and timers
  useEffect(() => {
    // Try to get the start time from localStorage first
    if (!startTimeRef.current && typeof window !== 'undefined') {
      const storedStartTime = localStorage.getItem('conversationStartTime');
      if (storedStartTime) {
        startTimeRef.current = new Date(storedStartTime);
      }
    }
    
    // Get the active conversation
    const conversation = getLiveConversation();
    setActiveConversation(conversation);
    
    // Store the start time
    if (conversation && conversation.startedAt) {
      startTimeRef.current = new Date(conversation.startedAt);
    }
    
    // Calculate initial timers
    updateTimers();
    
    // Set up interval to update timers every second
    const timerInterval = setInterval(updateTimers, 1000);
    
    // Fetch winning topic
    fetchWinningTopic();
    
    // Determine current speaker based on time
    const speakerInterval = setInterval(() => {
      const now = new Date();
      // Switch speaker every 30 seconds
      const seconds = now.getSeconds();
      setCurrentSpeaker(seconds % 60 < 30 ? "left" : "right");
    }, 1000);
    
    // Listen for vote submitted event
    const handleVoteSubmitted = () => {
      // Refresh the winning topic when a vote is submitted
      fetchWinningTopic();
    };
    
    window.addEventListener('voteSubmitted', handleVoteSubmitted);
    
    return () => {
      clearInterval(timerInterval);
      clearInterval(speakerInterval);
      window.removeEventListener('voteSubmitted', handleVoteSubmitted);
    };
  }, []);
  
  // Function to fetch the winning topic
  const fetchWinningTopic = async () => {
    try {
      const response = await fetch('/api/votes');
      if (response.ok) {
        const data = await response.json();
        // Find the topic with the most votes
        if (data && data.length > 0) {
          const sortedTopics = [...data].sort((a, b) => b.votes - a.votes);
          setWinningTopic(sortedTopics[0].topic);
        }
      }
    } catch (error) {
      console.error("Error fetching winning topic:", error);
    }
  };
  
  // Function to update timers based on real time
  const updateTimers = () => {
    if (!startTimeRef.current) return;
    
    const now = new Date();
    const startTime = startTimeRef.current;
    
    // Calculate elapsed seconds since conversation started
    const elapsedSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);
    
    // Calculate time until next message (every 30 seconds)
    const secondsIntoCurrentMessageCycle = elapsedSeconds % 30;
    const secondsUntilNextMessage = 30 - secondsIntoCurrentMessageCycle;
    setTimeUntilNextMessage(secondsUntilNextMessage);
    
    // Calculate time until midnight (12 AM)
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Set to next midnight
    const timeUntilMidnightMs = midnight.getTime() - now.getTime();
    const timeUntilMidnightSec = Math.floor(timeUntilMidnightMs / 1000);
    setTimeUntilMidnight(timeUntilMidnightSec);
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Format time as hh:mm:ss
  const formatLongTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white p-4 pt-16">
      <div className="w-full max-w-4xl mx-auto">
        {/* ASCII faces for yesnodebate with tooltips */}
        <div className="mb-8 flex justify-center items-center space-x-4">
          <div className="text-center group relative">
            <div 
              className="cursor-help"
              title="This is Claude Left - one of the two Claude instances in the debate. It argues against Claude Right."
            >
              <pre className="font-mono text-purple-300 text-xs">
{`  .--.
 /    \\
| o  o |
|  \\>  |
 \\____/`}
              </pre>
              <span className="text-purple-300 text-xs">left</span>
            </div>
            <div className="opacity-0 bg-[#121212] border border-[#333333] text-white text-xs rounded p-2 absolute z-10 group-hover:opacity-100 transition-opacity duration-300 w-48 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
              Claude Left: One of the two Claude instances that argues against Claude Right in the debate.
            </div>
          </div>
          <div className="text-center group relative">
            <div 
              className="cursor-help"
              title="This is Claude Right - one of the two Claude instances in the debate. It argues against Claude Left."
            >
              <pre className="font-mono text-blue-300 text-xs">
{`  .--.
 /    \\
| o  o |
|  <\\  |
 \\____/`}
              </pre>
              <span className="text-blue-300 text-xs">right</span>
            </div>
            <div className="opacity-0 bg-[#121212] border border-[#333333] text-white text-xs rounded p-2 absolute z-10 group-hover:opacity-100 transition-opacity duration-300 w-48 top-full left-1/2 transform -translate-x-1/2 mt-2 pointer-events-none">
              Claude Right: One of the two Claude instances that argues against Claude Left in the debate.
            </div>
          </div>
        </div>
        
        {/* Winning topic section - moved to top, simplified */}
        {winningTopic && (
          <div className="mb-8 text-center">
            <h2 className="text-base text-gray-300 mb-2">
              Leading Topic for Next Debate
            </h2>
            <p className="text-xs text-gray-400 mb-2">
              experiment created by <a href="https://x.com/miloleftright" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">@miloleftright</a>
            </p>
            <div className="mb-4">
              <span className="text-yellow-300 text-lg border-b border-yellow-700 pb-1">{winningTopic}</span>
            </div>
          </div>
        )}
        
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-md mx-auto border-b border-gray-800 pb-4">
            {/* Next message timer - cleaner design */}
            <div className="text-center">
              <h2 className="text-xs text-gray-400 mb-1">next message in</h2>
              <div className="text-lg text-gray-200 font-light">
                {formatTime(timeUntilNextMessage)}
              </div>
            </div>
            
            {/* Next debate timer - cleaner design */}
            <div className="text-center">
              <h2 className="text-xs text-gray-400 mb-1">next debate in</h2>
              <div className="text-lg text-gray-200 font-light">
                {formatLongTime(timeUntilMidnight)}
              </div>
            </div>
          </div>
        </div>
        
        {/* Always show the active debate section */}
        <div className="mb-8">
          <h2 className="text-base mb-3 flex items-center text-gray-300">
            <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
            active debate
          </h2>
          
          {activeConversation ? (
            <Link href="/conversations" className="block">
              <div className="bg-[#1a1a1a] rounded-md p-3 hover:bg-[#222] transition-colors shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    {/* Extract the debate number from the title */}
                    <span className="text-gray-400 mr-2">[{
                      parseInt(activeConversation.title.match(/debate_(\d+)\.txt/)?.[1] || '1')
                    }]</span>
                    <span className="text-gray-200">{activeConversation.title}</span>
                  </div>
                  <span className="text-green-400 bg-[#1a2a1a] px-2 py-0.5 rounded-sm text-[10px]">active</span>
                </div>
                
                {/* Current speaker indicator */}
                <div className="mt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">speaking:</span>
                    <span className={`px-2 py-0.5 rounded-sm ${currentSpeaker === "left" ? "bg-purple-900/30 text-purple-300" : "bg-blue-900/30 text-blue-300"}`}>
                      claude {currentSpeaker}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="bg-[#1a1a1a] rounded-md p-3 shadow-sm">
              <div className="text-center text-gray-500 text-xs py-1">
                waiting for active debate...
              </div>
            </div>
          )}
        </div>
        
        {/* Archived Debates section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base text-gray-300">Archived Debates</h2>
          </div>
          <div className="bg-[#1a1a1a] rounded-md p-4 text-center">
            <p className="text-gray-500 text-sm">No archived debates yet</p>
          </div>
        </div>
        
        
        {/* Voting section */}
        <div>
          <VoteSection />
        </div>
      </div>
    </div>
  );
}
