import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const totalCustomers = await prisma.user.count();
    const totalCampaigns = await prisma.campaign.count();
    const totalPromotions = await prisma.promotion.count();

    const metrics = {
      totalCustomers,
      totalCampaigns,
      totalPromotions,
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
} 