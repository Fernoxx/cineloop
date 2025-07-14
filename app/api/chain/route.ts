import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to fetch movie chain' 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      chain: data || [] 
    })
  } catch (error) {
    console.error('Chain API error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
