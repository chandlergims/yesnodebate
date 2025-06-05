import { NextRequest, NextResponse } from 'next/server';
import VoteModel from '@/models/Vote';

// Default topics to initialize if none exist
const DEFAULT_TOPICS = [
  'AI Ethics Debate',
  'Consciousness Exploration',
  'Digital Existentialism',
  'Technological Singularity'
];

export async function GET() {
  try {
    // Get all votes
    let votes = [];
    
    try {
      // Try to get votes from database
      const result = await VoteModel.find();
      
      if (Array.isArray(result)) {
        votes = result;
        // Don't sort, keep original order
      } else {
        console.log('VoteModel.find() did not return an array:', result);
      }
    } catch (findErr) {
      console.error('Error finding votes:', findErr);
    }
    
    // If no votes exist, return default topics
    if (!votes || votes.length === 0) {
      console.log('No votes found, returning default topics');
      
      return NextResponse.json(DEFAULT_TOPICS.map((topic, index) => ({
        _id: `default-${index}`,
        topic,
        votes: 0,
        percentage: 0
      })));
    }
    
    // Calculate total votes for percentage calculation
    const totalVotes = votes.reduce((sum: number, vote: any) => sum + vote.votes, 0);
    
    // Add percentage to each vote
    const votesWithPercentage = votes.map((vote: any) => ({
      _id: vote._id,
      topic: vote.topic,
      votes: vote.votes,
      percentage: totalVotes > 0 ? Math.round((vote.votes / totalVotes) * 100) : 0
    }));
    
    return NextResponse.json(votesWithPercentage);
  } catch (error) {
    console.error('Error fetching votes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch votes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    
    if (!topic) {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }
    
    // Find the vote by topic and increment the count
    let vote = await VoteModel.findOneAndUpdate(
      { topic },
      { $inc: { votes: 1 } },
      { new: true }
    );
    
    // If vote doesn't exist, create it
    if (!vote) {
      console.log(`Topic "${topic}" not found, creating it`);
      try {
        vote = await VoteModel.create({
          topic,
          votes: 1
        });
      } catch (err) {
        console.error(`Error creating vote for topic ${topic}:`, err);
        return NextResponse.json(
          { error: 'Failed to create vote' },
          { status: 500 }
        );
      }
    }
    
    return NextResponse.json(vote);
  } catch (error) {
    console.error('Error updating vote:', error);
    return NextResponse.json(
      { error: 'Failed to update vote' },
      { status: 500 }
    );
  }
}
