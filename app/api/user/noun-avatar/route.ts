import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/protectedRoute';
import { prisma } from '@/prisma/prisma';

interface NounSeed {
  background: number;
  body: number;
  accessory: number;
  head: number;
  glasses: number;
}

/**
 * PUT /api/user/noun-avatar
 * Update user's Noun avatar seed and enabled status
 */
export const PUT = withAuth(async (
  req: NextRequest,
  context: any,
  session: any
) => {
  try {
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { seed, enabled } = body as { seed: NounSeed; enabled: boolean };

    if (!seed) {
      return NextResponse.json(
        { error: 'Seed is required' },
        { status: 400 }
      );
    }

    // Validate seed structure
    if (
      typeof seed.background !== 'number' ||
      typeof seed.body !== 'number' ||
      typeof seed.accessory !== 'number' ||
      typeof seed.head !== 'number' ||
      typeof seed.glasses !== 'number'
    ) {
      return NextResponse.json(
        { error: 'Invalid seed structure' },
        { status: 400 }
      );
    }

    // Update user with noun avatar data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        noun_avatar_seed: seed as any,
        noun_avatar_enabled: enabled ?? false,
      },
      select: {
        id: true,
        noun_avatar_seed: true,
        noun_avatar_enabled: true,
      },
    });

    return NextResponse.json({
      seed: updatedUser.noun_avatar_seed,
      enabled: updatedUser.noun_avatar_enabled,
    });
  } catch (error) {
    console.error('Error updating Noun avatar:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

/**
 * GET /api/user/noun-avatar
 * Get user's current Noun avatar seed and enabled status
 */
export const GET = withAuth(async (
  req: NextRequest,
  context: any,
  session: any
) => {
  try {
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        noun_avatar_seed: true,
        noun_avatar_enabled: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      seed: user.noun_avatar_seed as NounSeed | null,
      enabled: user.noun_avatar_enabled ?? false,
    });
  } catch (error) {
    console.error('Error fetching Noun avatar:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch avatar',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
});

