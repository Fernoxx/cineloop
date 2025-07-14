import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.TMDB_API_KEY!
const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')

  if (!title || title.trim().length === 0) {
    return NextResponse.json({ success: false, error: 'Title is required' })
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title.trim())}&language=en-US&page=1&include_adult=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    )

    if (!response.ok) {
      throw new Error(`TMDb API responded with status: ${response.status}`)
    }

    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const movie = data.results[0]
      
      // Validate required fields
      if (!movie.id || !movie.title) {
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid movie data from TMDb' 
        })
      }
      
      return NextResponse.json({
        success: true,
        movie: {
          id: movie.id,
          title: movie.title,
          vote_average: movie.vote_average || 0,
          poster_path: movie.poster_path,
          release_date: movie.release_date
        }
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Movie not found in TMDb database' 
      })
    }
  } catch (error) {
    console.error('TMDb API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to search movie database' 
    }, { status: 500 })
  }
}
