import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/protectedRoute';
import { ImageData } from '@nouns/assets';
import { keccak_256 } from '@noble/hashes/sha3';
import { bytesToHex } from '@noble/hashes/utils';

interface NounSeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

/**
 * Generate a random or deterministic Noun seed
 */
function generateNounSeed(identifier: string, random: boolean = false): NounSeed {
  if (random) {
    // Generate random seed
    const maxValues = {
      background: ImageData.bgcolors.length,
      body: ImageData.images.bodies.length,
      accessory: ImageData.images.accessories.length,
      head: ImageData.images.heads.length,
      glasses: ImageData.images.glasses.length,
    };

    return {
      background: Math.floor(Math.random() * maxValues.background),
      body: Math.floor(Math.random() * maxValues.body),
      accessory: Math.floor(Math.random() * maxValues.accessory),
      head: Math.floor(Math.random() * maxValues.head),
      glasses: Math.floor(Math.random() * maxValues.glasses),
    };
  } else {
    // Generate deterministic seed from identifier
    const encoder = new TextEncoder();
    const hash = keccak_256(encoder.encode(identifier));
    const hashHex = bytesToHex(hash);
    
    // Use different parts of the hash for each trait
    const maxValues = {
      background: ImageData.bgcolors.length,
      body: ImageData.images.bodies.length,
      accessory: ImageData.images.accessories.length,
      head: ImageData.images.heads.length,
      glasses: ImageData.images.glasses.length,
    };

    // Convert hex string to numbers for each trait
    const background = parseInt(hashHex.slice(0, 2), 16) % maxValues.background;
    const body = parseInt(hashHex.slice(2, 4), 16) % maxValues.body;
    const accessory = parseInt(hashHex.slice(4, 6), 16) % maxValues.accessory;
    const head = parseInt(hashHex.slice(6, 8), 16) % maxValues.head;
    const glasses = parseInt(hashHex.slice(8, 10), 16) % maxValues.glasses;

    return {
      background,
      body,
      accessory,
      head,
      glasses,
    };
  }
}

export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  session: any
) => {
  try {
    const { searchParams } = new URL(req.url);
    const deterministic = searchParams.get('deterministic') === 'true';
    
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate seed (random or deterministic based on user ID)
    const seed = generateNounSeed(userId, !deterministic);

    return NextResponse.json({ seed });
  } catch (error) {
    console.error('Error generating Noun seed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate seed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

