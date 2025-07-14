import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      movies: {
        Row: {
          id: number
          tmdb_id: number
          title: string
          username: string
          fid: number
          created_at: string
          rating: number
          poster_path: string | null
          position: number
        }
        Insert: {
          tmdb_id: number
          title: string
          username: string
          fid: number
          rating: number
          poster_path?: string | null
          position: number
        }
        Update: {
          tmdb_id?: number
          title?: string
          username?: string
          fid?: number
          rating?: number
          poster_path?: string | null
          position?: number
        }
      }
    }
  }
}
