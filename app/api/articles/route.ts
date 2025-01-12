import { NextResponse } from 'next/server'
import webPush from 'web-push'

export async function GET() {
  try {
    const vapidKeys = {
      publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      privateKey: process.env.VAPID_PRIVATE_KEY!
    }

    webPush.setVapidDetails(
      'mailto:your-email@example.com',
      vapidKeys.publicKey,
      vapidKeys.privateKey
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Articles API error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
} 