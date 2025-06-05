'use client';

import { useState, useEffect } from 'react';

interface Vote {
  id: string;
  topic: string;
  votes: number;
  percentage: number;
}

// Default topics
const DEFAULT_TOPICS = [
  'AI Ethics Debate',
  'Consciousness Exploration',
  'Digital Existentialism',
  'Technological Singularity'
];

export default function VoteSection() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [votedTopic, setVotedTopic] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Initialize votes on component mount
  useEffect(() => {
    // Check if user has already voted
    const hasVoted = localStorage.getItem('hasVoted');
    const votedFor = localStorage.getItem('votedTopic');
    
    if (hasVoted && votedFor) {
      setVoted(true);
      setVotedTopic(votedFor);
    }
    
    // Fetch votes from API
    fetchVotes();
  }, []);

  // Function to fetch votes from API
  const fetchVotes = async () => {
    try {
      setLoading(true);
      setError('');
      
      try {
        const response = await fetch('/api/votes');
        
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched votes from API:', data);
          
          setVotes(data.map((vote: any) => ({
            id: vote._id || `topic-${Math.random()}`,
            topic: vote.topic,
            votes: vote.votes || 0,
            percentage: vote.percentage || 0
          })));
          return;
        } else {
          console.warn(`API error: ${response.status}`);
        }
      } catch (apiErr) {
        console.error('API fetch error:', apiErr);
      }
      
      // If we get here, the API call failed
      console.log('Using default topics as fallback');
      const defaultVotes = DEFAULT_TOPICS.map((topic, index) => ({
        id: `topic-${index}`,
        topic,
        votes: 0,
        percentage: 0
      }));
      
      setVotes(defaultVotes);
    } catch (err) {
      console.error('Unexpected error in fetchVotes:', err);
      
      // Last resort fallback
      const fallbackVotes = DEFAULT_TOPICS.map((topic, index) => ({
        id: `topic-${index}`,
        topic,
        votes: 0,
        percentage: 0
      }));
      
      setVotes(fallbackVotes);
    } finally {
      setLoading(false);
    }
  };

  // Function to vote for a topic
  const voteForTopic = async (topic: string) => {
    if (voted) return;
    
    try {
      setVoting(true);
      setError('');
      
      try {
        // Try to send vote to API
        const response = await fetch('/api/votes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ topic }),
        });
        
        if (response.ok) {
          console.log('Vote submitted to API successfully');
        } else {
          console.warn(`API vote error: ${response.status}`);
        }
      } catch (apiErr) {
        console.error('API vote error:', apiErr);
      }
      
      // Update local state regardless of API success
      // This ensures the UI updates even if the API fails
      const updatedVotes = votes.map(vote => {
        if (vote.topic === topic) {
          return { ...vote, votes: vote.votes + 1 };
        }
        return vote;
      });
      
      // Recalculate percentages
      const totalVotes = updatedVotes.reduce((sum, vote) => sum + vote.votes, 0);
      const votesWithPercentage = updatedVotes.map(vote => ({
        ...vote,
        percentage: totalVotes > 0 ? Math.round((vote.votes / totalVotes) * 100) : 0
      }));
      
      // Mark as voted in localStorage (only to track user's vote)
      localStorage.setItem('hasVoted', 'true');
      localStorage.setItem('votedTopic', topic);
      
      // Update state
      setVotes(votesWithPercentage);
      setVoted(true);
      setVotedTopic(topic);
      
      // Dispatch a custom event to notify the parent component that a vote was submitted
      const voteEvent = new CustomEvent('voteSubmitted', { 
        detail: { 
          topic,
          votes: votesWithPercentage
        } 
      });
      window.dispatchEvent(voteEvent);
      
      // Try to refresh votes from API
      try {
        await fetchVotes();
      } catch (fetchErr) {
        console.error('Failed to refresh votes after voting:', fetchErr);
      }
    } catch (err) {
      console.error('Unexpected error during vote:', err);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div>
      <h2 className="text-lg font-semibold mb-4 text-center">Vote for next debate</h2>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#1a1a1a] rounded-md p-3 animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-gray-700 rounded w-full mb-2"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-gray-700 rounded w-1/4"></div>
                <div className="h-5 bg-gray-700 rounded w-1/5"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1a1a1a] rounded-md p-4 text-center">
        <p className="text-red-400 text-sm">{error}</p>
        <button 
          onClick={fetchVotes}
          className="mt-2 px-3 py-1 bg-gray-800 text-xs rounded hover:bg-gray-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-center">Vote for next debate</h2>
      
      {voted && (
        <div className="text-center mb-4">
          <p className="text-green-400 text-xs">Your vote has been submitted successfully!</p>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-3">
        {votes.map((vote) => (
          <div 
            key={vote.id} 
            className={`bg-[#1a1a1a] rounded-md p-3 border ${votedTopic === vote.topic ? 'border-blue-500' : 'border-transparent'} transition-all hover:border-gray-700`}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-200">{vote.topic}</span>
              <span className="text-xs text-gray-400">{vote.percentage}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-900 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-500 h-2 rounded-full" 
                style={{ width: `${vote.percentage}%` }}
              ></div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{vote.votes} votes</span>
              
              {!voted ? (
                <button
                  onClick={() => voteForTopic(vote.topic)}
                  disabled={voting}
                  className="text-xs px-2 py-1 bg-blue-900 hover:bg-blue-800 rounded text-blue-100 disabled:opacity-50"
                >
                  {voting ? 'Voting...' : 'Vote'}
                </button>
              ) : votedTopic === vote.topic ? (
                <span className="text-xs text-green-500 bg-green-900/30 px-2 py-1 rounded">Your Vote</span>
              ) : (
                <span className="text-xs text-gray-500">-</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
