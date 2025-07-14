import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'CineLoop'
  const rating = searchParams.get('rating') || '8.0'

  try {
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(45deg, #1a1a2e, #16213e, #0f3460)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
            position: 'relative'
          }}
        >
          {/* Film strip decoration */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 50
          }}>
            <div style={{ fontSize: 24, color: '#000', fontWeight: 'bold' }}>
              🎬 CineLoop
            </div>
          </div>

          <div style={{ 
            fontSize: 80, 
            color: 'white', 
            marginBottom: 30,
            textAlign: 'center',
            maxWidth: '80%'
          }}>
            {title}
          </div>
          
          <div style={{ 
            fontSize: 36, 
            color: '#FFD700',
            display: 'flex',
            alignItems: 'center'
          }}>
            ⭐ {rating}/10
          </div>

          {/* Bottom decoration */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 60,
            background: '#FFD700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ fontSize: 20, color: '#000', fontWeight: 'bold' }}>
              Keep the Chain Going!
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  } catch (error) {
    console.error('OG Image generation error:', error)
    return new Response('Failed to generate image', { status: 500 })
  }
}
