import { NextResponse } from 'next/server'
import { db } from '@/db/db'
import { promptUsage } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  try {
    // Test database connection by trying to query the table
    const testQuery = await db
      .select()
      .from(promptUsage)
      .limit(1)

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tableExists: true,
      recordCount: testQuery.length
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      tableExists: false
    }, { status: 500 })
  }
} 