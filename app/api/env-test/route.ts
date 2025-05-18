import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    europe: {
      currency: process.env.NEXT_PUBLIC_EUROPE_CURRENCY || 'not set',
      monthlyPrice: process.env.NEXT_PUBLIC_EUROPE_MONTHLY_PRICE || 'not set',
      weeklyPrice: process.env.NEXT_PUBLIC_EUROPE_WEEKLY_PRICE || 'not set',
      lifetimePrice: process.env.NEXT_PUBLIC_EUROPE_LIFETIME_PRICE || 'not set',
    },
    africa: {
      currency: process.env.NEXT_PUBLIC_AFRICA_CURRENCY || 'not set',
      monthlyPrice: process.env.NEXT_PUBLIC_AFRICA_MONTHLY_PRICE || 'not set',
      weeklyPrice: process.env.NEXT_PUBLIC_AFRICA_WEEKLY_PRICE || 'not set',
      lifetimePrice: process.env.NEXT_PUBLIC_AFRICA_LIFETIME_PRICE || 'not set',
    },
    asia: {
      currency: process.env.NEXT_PUBLIC_ASIA_CURRENCY || 'not set',
      monthlyPrice: process.env.NEXT_PUBLIC_ASIA_MONTHLY_PRICE || 'not set',
      weeklyPrice: process.env.NEXT_PUBLIC_ASIA_WEEKLY_PRICE || 'not set',
      lifetimePrice: process.env.NEXT_PUBLIC_ASIA_LIFETIME_PRICE || 'not set',
    },
    northAmerica: {
      currency: process.env.NEXT_PUBLIC_NORTH_AMERICA_CURRENCY || 'not set',
      monthlyPrice: process.env.NEXT_PUBLIC_NORTH_AMERICA_MONTHLY_PRICE || 'not set',
      weeklyPrice: process.env.NEXT_PUBLIC_NORTH_AMERICA_WEEKLY_PRICE || 'not set',
      lifetimePrice: process.env.NEXT_PUBLIC_NORTH_AMERICA_LIFETIME_PRICE || 'not set',
    },
    default: {
      currency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'not set',
      monthlyPrice: process.env.NEXT_PUBLIC_DEFAULT_MONTHLY_PRICE || 'not set',
      weeklyPrice: process.env.NEXT_PUBLIC_DEFAULT_WEEKLY_PRICE || 'not set',
      lifetimePrice: process.env.NEXT_PUBLIC_DEFAULT_LIFETIME_PRICE || 'not set',
    }
  };

  return NextResponse.json(envVars);
} 