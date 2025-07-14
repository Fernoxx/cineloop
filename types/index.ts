export interface Movie {
  id: number;
  tmdb_id: number;
  title: string;
  username: string;
  fid: number;
  created_at: string;
  rating: number;
  poster_path?: string;
  position: number;
}

export interface TMDbMovie {
  id: number;
  title: string;
  vote_average: number;
  poster_path: string;
  release_date: string;
}

export interface User {
  fid: number;
  username: string;
  displayName?: string;
  pfpUrl?: string;
}

export interface FarcasterContext {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
  cast?: {
    hash: string;
    fid: number;
  };
}
