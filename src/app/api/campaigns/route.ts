import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  const { name, userId } = await request.json();

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name,
        userId,
        status: 'draft',
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json({ error: 'Failed to create campaign' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
  }
} 