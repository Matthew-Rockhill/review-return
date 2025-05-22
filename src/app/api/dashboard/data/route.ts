import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const campaigns = await prisma.campaign.findMany({
      where: { status: 'active' },
      include: { responses: true },
    });

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const totalResponses = campaigns.reduce((sum, c) => sum + c.responses.length, 0);
    const averageRating = totalResponses > 0
      ? campaigns.reduce((sum, c) => sum + c.responses.reduce((s, r) => s + r.score, 0), 0) / totalResponses
      : 0;

    return NextResponse.json({
      totalCampaigns,
      activeCampaigns,
      totalResponses,
      averageRating,
      recentCampaigns: campaigns.slice(0, 5),
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 