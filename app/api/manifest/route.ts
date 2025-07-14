import { NextResponse } from 'next/server'

export async function GET() {
  // CRITICAL: Following 2024+ Farcaster Mini Apps specification
  const manifest = {
    accountAssociation: {
      // TODO: Generate this using Warpcast Developer Tools
      // Go to: https://warpcast.com/~/developers/mini-apps/manifest
      header: "PLACEHOLDER_HEADER",
      payload: "PLACEHOLDER_PAYLOAD", 
      signature: "PLACEHOLDER_SIGNATURE"
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
