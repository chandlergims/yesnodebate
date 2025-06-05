// Script to initialize vote topics in the database
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

// Default topics to initialize
const DEFAULT_TOPICS = [
  'AI Ethics Debate',
  'Consciousness Exploration',
  'Digital Existentialism',
  'Technological Singularity'
];

async function initializeVotes() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      console.error('MONGODB_URI environment variable is not set');
      process.exit(1);
    }

    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const votesCollection = db.collection('votes');

    // Check if votes already exist
    const existingVotes = await votesCollection.countDocuments();
    console.log(`Found ${existingVotes} existing votes`);

    if (existingVotes > 0) {
      // Clear existing votes if requested
      if (process.argv.includes('--reset')) {
        console.log('Clearing existing votes...');
        await votesCollection.deleteMany({});
        console.log('Existing votes cleared');
      } else {
        console.log('Votes already exist. Use --reset flag to clear existing votes.');
        await client.close();
        return;
      }
    }

    // Insert default topics
    console.log('Inserting default topics...');
    const voteDocuments = DEFAULT_TOPICS.map(topic => ({
      topic,
      votes: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await votesCollection.insertMany(voteDocuments);
    console.log(`${result.insertedCount} vote topics inserted successfully`);

    // Close the connection
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error initializing votes:', error);
    process.exit(1);
  }
}

// Run the initialization function
initializeVotes();
