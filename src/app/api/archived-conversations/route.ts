import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // For now, just return an empty array
    // In the future, this could fetch archived conversations from the database
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching archived conversations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch archived conversations' },
      { status: 500 }
    );
  }
}
