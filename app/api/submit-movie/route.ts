import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { movie, user } = body

    // Validate input
    if (!movie || !user || !movie.id || !movie.title || !user.fid || !user.username) {
      return NextResponse.json({
        success: false,
        error: 'Missing required movie or user data'
      }, { status: 400 })
    }

    // Get current chain length for position
    const { count, error: countError } = await supabase
      .from('movies')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    const position = (count || 0) + 1

    // Insert movie
    const { data, error } = await supabase
      .from('movies')
      .insert([
        {
          tmdb_id: movie.id,
          title: movie.title,
          username: user.username,
          fid: user.fid,
          rating: movie.vote_average || 0,
          poster_path: movie.poster_path,
          position: position
        }
      ])
      .select()
      .single()

    if (error) {
      // Handle unique constraint errors
      if (error.code === '23505') {
        return NextResponse.json({
          success: false,
          error: 'Movie already exists in the chain'
        }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ 
      success: true, 
      entry: data 
    })
  } catch (error) {
    console.error('Submit movie error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to submit movie' 
    }, { status: 500 })
  }
}
