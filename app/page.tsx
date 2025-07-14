import Link from 'next/link'
import { Film, Play, Star } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900/20 flex items-center justify-center">
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-600/20 to-transparent rounded-full blur-3xl"></div>
          <div className="relative w-24 h-24 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-full flex items-center justify-center mx-auto shadow-2xl">
            <Film className="w-12 h-12 text-black" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4 tracking-wider">
          CineLoop
        </h1>
        <p className="text-gray-300 mb-8 text-lg font-light">
          Build the never-ending chain of movies on Farcaster!
        </p>
        
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Star className="w-5 h-5 fill-current" />
            <span>Connect movies by last letter</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Play className="w-5 h-5 fill-current" />
            <span>One movie per day per user</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-yellow-400">
            <Film className="w-5 h-5 fill-current" />
            <span>Build the ultimate collection</span>
          </div>
        </div>
        
        <Link 
          href="/mini"
          className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-black font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          Launch CineLoop
        </Link>
      </div>
    </div>
  )
}
