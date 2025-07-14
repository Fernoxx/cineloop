import { NextResponse } from 'next/server'

export async function GET() {
  // CRITICAL: Following 2024+ Farcaster Mini Apps specification
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjI0MjU5NywidHlwZSI6ImF1dGgiLCJrZXkiOiIweDNjRjg3Qjc2ZDJBMUQzNkY5NTQyQjREYTJhNkI0QjNEYzBmMEJiMmUifQ",
      payload: "eyJkb21haW4iOiJjaW5lbG9vcC52ZXJjZWwuYXBwIn0",
      signature: "lUF/7l922s1o/Sv7sGFNk3EjLwfw5WI/PL40fxBuLWVab0M94yRY/uie6F7dqN0hcdjDuz3H1q8QYCj9vjFvQhs="
    },
    // CRITICAL: Use "miniapp" (not "miniapps" or "frame")
    miniapp: {
      version: "1", // CRITICAL: Must be "1", not "next"
      name: "CineLoop",
      iconUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icon.png`,
      homeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/mini`,
      imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`, 
      buttonTitle: "🎬 Start Chain",
      splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/splash.png`,
      splashBackgroundColor: "#1a1a2e"
    }
  }

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
    },
  })
}
