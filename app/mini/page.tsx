
'use client'

import { useEffect, useState } from 'react'
import { Search, Share2, Film, Users, ChevronRight, ExternalLink, Star, ArrowLeft, Play, Disc } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Movie, TMDbMovie, User, FarcasterContext } from '@/types'

export default function MiniApp() {
  const [currentView, setCurrentView] = useState<'main' | 'chain' | 'submitted'>('main')
  const [movieInput, setMovieInput] = useState('')
  const [currentUser, setCurrentUser] = useState<User>({ fid: 12345, username: 'you' })
  const [movieChain, setMovieChain] = useState<Movie[]>([])
  const [lastSubmission, setLastSubmission] = useState<Movie | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showAnimation, setShowAnimation] = useState(false)
  const [isMiniApp, setIsMiniApp] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize Farcaster SDK and load data
  useEffect(() => {
    const initializeApp = async () => {
      const url = new URL(window.location.href)
      const miniAppMode = url.pathname.startsWith('/mini') || url.searchParams.get('miniApp') === 'true'
      setIsMiniApp(miniAppMode)

      if (miniAppMode) {
        try {
          const { sdk } = await import('@farcaster/miniapp-sdk')
          
          // Get user context - CRITICAL: Following latest SDK standards
          const context: FarcasterContext = await sdk.context
          if (context?.user) {
            setCurrentUser({
              fid: context.user.fid,
              username: context.user.username || `user${context.user.fid}`,
              displayName: context.user.displayName,
              pfpUrl: context.user.pfpUrl
            })
          }

          // CRITICAL: Must call ready() to hide splash screen
          await sdk.actions.ready()
        } catch (error) {
          console.error('Farcaster SDK initialization failed:', error)
        }
      }

      await loadMovieChain()
      setIsLoading(false)
    }

    initializeApp()
  }, [])

  const loadMovieChain = async () => {
    try {
      const { data, error } = await supabase
        .from('movies')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error
      setMovieChain(data || [])
    } catch (error) {
      console.error('Failed to load chain:', error)
    }
  }

  const validateMovie = async (title: string): Promise<TMDbMovie | null> => {
    setIsValidating(true)
    setValidationError('')

    try {
      const response = await fetch(`/api/search-movie?title=${encodeURIComponent(title)}`)
      const data = await response.json()

      if (!data.success) {
        setValidationError(data.error || 'Movie not found')
        return null
      }

      const movie = data.movie
      
      if (!isValidChainMatch(title)) {
        const requiredLetter = getNextRequiredLetter()
        setValidationError(`Movie must start with "${requiredLetter}"`)
        return null
      }

      if (movieChain.some(m => m.tmdb_id === movie.id)) {
        setValidationError('Movie already exists in the chain')
        return null
      }

      if (hasSubmittedToday()) {
        setValidationError('You can only submit one movie per day')
        return null
      }

      return movie
    } catch (error) {
      setValidationError('Failed to validate movie')
      return null
    } finally {
      setIsValidating(false)
    }
  }

  const submitMovie = async () => {
    const movieData = await validateMovie(movieInput)
    if (!movieData) return

    try {
      const { data, error } = await supabase
        .from('movies')
        .insert([
          {
            tmdb_id: movieData.id,
            title: movieData.title,
            username: currentUser.username,
            fid: currentUser.fid,
            rating: movieData.vote_average,
            poster_path: movieData.poster_path,
            position: movieChain.length + 1
          }
        ])
        .select()
        .single()

      if (error) throw error

      const newEntry: Movie = data
      setMovieChain(prev => [...prev, newEntry])
      setLastSubmission(newEntry)
      setShowAnimation(true)
      setMovieInput('')
      setCurrentView('submitted')
      
      setTimeout(() => setShowAnimation(false), 2000)
    } catch (error) {
      setValidationError('Failed to submit movie')
      console.error('Submit error:', error)
    }
  }

  const shareToFarcaster = async () => {
  if (!lastSubmission) return

  // Fix: Handle undefined environment variable
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cineloop.vercel.app'
  const shareText = `🎬 Added "${lastSubmission.title}" to the CineLoop chain!\n⭐ Rating: ${lastSubmission.rating.toFixed(1)}/10\n\nKeep the chain going! 🔗`
  
  if (isMiniApp) {
    try {
      const { sdk } = await import('@farcaster/miniapp-sdk')
      // Fix: Add optional chaining for composeCast
      if (sdk.actions?.composeCast) {
        await sdk.actions.composeCast({
          text: shareText,
          embeds: [appUrl] // Fixed: now guaranteed to be string
        })
      } else {
        await sdk.actions.openUrl(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds%5B%5D=${appUrl}`)
      }
    } catch (error) {
      console.error('Failed to share:', error)
    }
  } else {
    window.open(`https://warpcast.com/~/compose?text=${encodeURIComponent(shareText)}&embeds%5B%5D=${appUrl}`, '_blank')
  }
}

  // Helper functions
  const getLastLetters = (title: string): string => {
    const cleanTitle = title.replace(/[^a-zA-Z]/g, '').toLowerCase()
    return cleanTitle.slice(-1)
  }

  const isValidChainMatch = (newTitle: string): boolean => {
    if (movieChain.length === 0) return true
    const lastMovie = movieChain[movieChain.length - 1]
    const requiredLetter = getLastLetters(lastMovie.title)
    const newTitleStart = newTitle.replace(/[^a-zA-Z]/g, '').toLowerCase().charAt(0)
    return newTitleStart === requiredLetter
  }

  const getNextRequiredLetter = (): string => {
    if (movieChain.length === 0) return 'Any letter'
    return getLastLetters(movieChain[movieChain.length - 1].title).toUpperCase()
  }

  const hasSubmittedToday = (): boolean => {
    const today = new Date().toDateString()
    return movieChain.some(movie => 
      movie.fid === currentUser.fid && 
      new Date(movie.created_at).toDateString() === today
    )
  }

  const getPosterUrl = (posterPath: string | null) => {
    if (!posterPath) return '/placeholder-movie.jpg'
    return `https://image.tmdb.org/3/t/p/w500${posterPath}`
  }

  // Movie Disk Component with enhanced styling
const MovieDisk = ({ movie, index, isRecent = false }: { movie: Movie; index: number; isRecent?: boolean }) => (
  <div className={`relative group ${isRecent ? 'transform hover:scale-105 transition-all duration-300' : ''}`}>
    <div className="relative">
      {/* Disk Case */}
      <div className="w-20 h-28 bg-gradient-to-b from-gray-800 to-gray-900 rounded-sm shadow-xl transform perspective-1000 rotate-y-12">
        {/* Movie Poster */}
        <div className="w-full h-full overflow-hidden rounded-sm border border-gray-700">
          <img
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.currentTarget as HTMLImageElement;
              target.src = '/placeholder-movie.jpg';
            }}
          />
        </div>
        
        {/* Spine Label */}
        <div className="absolute -right-1 top-0 w-2 h-full bg-gradient-to-b from-yellow-600 to-yellow-800 rounded-r-sm">
          <div className="text-[6px] text-white font-bold writing-mode-vertical text-center mt-1 truncate">
            {movie.title.slice(0, 8)}
          </div>
        </div>
      </div>

      {/* DVD Disc (partially visible) */}
      <div className="absolute -right-3 top-6 w-16 h-16">
        <div className="w-full h-full bg-gradient-conic from-gray-300 via-gray-100 to-gray-300 rounded-full shadow-lg border-2 border-gray-400">
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-20 rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-gray-800 rounded-full"></div>
          <Disc className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-gray-600" />
        </div>
      </div>

      {/* Movie Info Overlay */}
      {isRecent && (
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 rounded-sm flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div className="text-center text-white p-2">
            <div className="text-xs font-bold mb-1 truncate">{movie.title}</div>
            <div className="text-[10px] text-gray-300">@{movie.username}</div>
            <div className="text-[10px] text-yellow-400 flex items-center justify-center mt-1">
              <Star className="w-2 h-2 mr-1 fill-current" />
              {movie.rating.toFixed(1)}
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
)

  // Loading screen with cinematic styling
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-conic from-yellow-600 via-yellow-400 to-yellow-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-light">Loading CineLoop...</p>
        </div>
      </div>
    )
  }

  // Render main interface with movie collection aesthetic
  const renderMainView = () => (
    <div className="space-y-6">
      {/* Header with cinematic feel */}
      <div className="text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/10 to-transparent rounded-lg blur-3xl"></div>
        <div className="relative">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center shadow-lg">
              <Film className="w-6 h-6 text-black" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-wider">CineLoop</h1>
          </div>
          <p className="text-gray-300 font-light">Build the never-ending movie collection</p>
        </div>
      </div>

      {/* Chain Stats */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-lg p-4 border border-yellow-600/20 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{movieChain.length}</div>
            <div className="text-sm text-gray-400 uppercase tracking-wider">Movies Collected</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-yellow-400 bg-gray-800 px-3 py-1 rounded-full border border-yellow-600/30">
              Next: {getNextRequiredLetter()}
            </div>
            <div className="text-xs text-gray-400 mt-1">Required Letter</div>
          </div>
        </div>
      </div>

      {/* Recent Movie Collection */}
      <div className="bg-gradient-to-b from-gray-900 to-black rounded-lg p-6 border border-gray-700 shadow-2xl">
        <h3 className="text-white font-semibold mb-4 flex items-center text-lg">
          <Disc className="w-5 h-5 mr-2 text-yellow-600" />
          Latest Collection
        </h3>
        
        {movieChain.length > 0 ? (
          <div className="relative h-40 overflow-hidden">
            {movieChain.slice(-6).map((movie, index) => (
              <div
                key={movie.id}
                className="absolute"
                style={{
                  left: `${10 + index * 15}%`,
                  top: `${20 + (index % 2) * 30}px`,
                  transform: `rotate(${-15 + index * 8}deg)`,
                  zIndex: 10 - index
                }}
              >
                <MovieDisk movie={movie} index={index} isRecent={true} />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-radial from-yellow-600/10 to-transparent"></div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Disc className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Start your movie collection</p>
          </div>
        )}
      </div>

      {/* Movie Input */}
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 p-[1px] rounded-lg">
          <div className="bg-gray-900 rounded-lg p-4">
            <label className="block text-white font-medium mb-3 text-center">
              🎬 Add Your Movie {movieChain.length > 0 && `(starts with "${getNextRequiredLetter()}")`}
            </label>
            <div className="relative">
              <input
                type="text"
                value={movieInput}
                onChange={(e) => setMovieInput(e.target.value)}
                placeholder="Enter movie title..."
                className="w-full px-4 py-3 bg-black border border-yellow-600/30 rounded-lg text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-600/20"
                disabled={hasSubmittedToday() || isValidating}
              />
              <Search className="absolute right-3 top-3 w-5 h-5 text-yellow-600" />
            </div>
          </div>
        </div>

        {validationError && (
          <div className="text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-600/30">
            ❌ {validationError}
          </div>
        )}

        {hasSubmittedToday() && (
          <div className="text-yellow-400 text-sm bg-yellow-900/20 p-3 rounded-lg border border-yellow-600/30">
            ⏰ You've already submitted a movie today. Come back tomorrow!
          </div>
        )}

        <button
          onClick={submitMovie}
          disabled={!movieInput.trim() || hasSubmittedToday() || isValidating}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-black font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg"
        >
          {isValidating ? '🔍 Validating...' : '🎬 Add to Collection'}
        </button>
      </div>

      {/* View Collection Button */}
      <button
        onClick={() => setCurrentView('chain')}
        className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 border border-gray-600"
      >
        <Users className="w-4 h-4" />
        <span>View Full Collection</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )

  // Chain view with grid layout
  const renderChainView = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentView('main')}
          className="text-yellow-400 hover:text-yellow-300 flex items-center space-x-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h2 className="text-xl font-bold text-white">Movie Collection</h2>
        <div className="text-yellow-400">{movieChain.length} movies</div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {movieChain.map((movie, index) => (
          <div key={movie.id} className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-3 border border-gray-700 shadow-lg">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-20 flex-shrink-0">
                <img
                  src={getPosterUrl(movie.poster_path)}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded border border-gray-600"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-movie.jpg'
                  }}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <span className="text-yellow-400 font-semibold text-sm">#{index + 1}</span>
                </div>
                <h3 className="text-white font-medium text-sm leading-tight mb-1 truncate">
                  {movie.title}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <button className="text-yellow-400 hover:text-yellow-300 flex items-center space-x-1">
                    <span>@{movie.username}</span>
                    <ExternalLink className="w-2 h-2" />
                  </button>
                </div>
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-300">{movie.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Success view with animation
  const renderSubmittedView = () => (
    <div className="text-center space-y-6">
      <div className={`transition-all duration-1000 ${showAnimation ? 'scale-110 opacity-100' : 'scale-100 opacity-90'}`}>
        <div className="relative w-24 h-24 mx-auto mb-4">
          <div className="w-full h-full bg-gradient-conic from-yellow-600 via-yellow-400 to-yellow-600 rounded-full shadow-2xl border-4 border-yellow-500">
            <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black opacity-30 rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-gray-900 rounded-full border-2 border-yellow-600"></div>
            <Film className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-yellow-600" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Movie Added to Collection!</h2>
        <p className="text-gray-300">
          "{lastSubmission?.title}" is now part of the CineLoop
        </p>
      </div>

      {lastSubmission && (
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 border border-yellow-600/30">
          <div className="text-white font-semibold text-lg mb-1">{lastSubmission.title}</div>
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span>Rating: {lastSubmission.rating.toFixed(1)}/10</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={shareToFarcaster}
        className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg"
      >
        <Share2 className="w-4 h-4" />
        <span>✅ Keep the Chain Going</span>
      </button>

      <button
        onClick={() => setCurrentView('main')}
        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
      >
        Back to Collection
      </button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900/20">
      <div className="max-w-md mx-auto p-4 py-8">
        {currentView === 'main' && renderMainView()}
        {currentView === 'chain' && renderChainView()}
        {currentView === 'submitted' && renderSubmittedView()}
      </div>
    </div>
  )
}
