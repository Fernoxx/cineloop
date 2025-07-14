import './globals.css'
import type { Metadata } from 'next'

// CRITICAL: Following 2024+ Standards from Agents Checklist
const frameData = {
  version: "1", // MUST be "1", not "next"
  imageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`,
  button: {
    title: "🎬 Start Chain", // Max 32 characters
    action: {
      type: "launch_frame",
      name: "CineLoop",
      url: `${process.env.NEXT_PUBLIC_APP_URL}/mini`,
      splashImageUrl: `${process.env.NEXT_PUBLIC_APP_URL}/splash.png`,
      splashBackgroundColor: "#1a1a2e"
    }
  }
}

export const metadata: Metadata = {
  title: 'CineLoop - Movie Chain Game',
  description: 'Build the never-ending chain of movies on Farcaster',
  openGraph: {
    title: 'CineLoop - Movie Chain Game',
    description: 'Build the never-ending chain of movies on Farcaster',
    images: [`${process.env.NEXT_PUBLIC_APP_URL}/og-image.png`],
  },
  other: {
    'fc:miniapp': JSON.stringify(frameData),
    // Backward compatibility
    'fc:frame': JSON.stringify(frameData),
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="fc:miniapp" content={JSON.stringify(frameData)} />
        <meta name="fc:frame" content={JSON.stringify(frameData)} />
      </head>
      <body className="bg-gray-900 antialiased">{children}</body>
    </html>
  )
}
