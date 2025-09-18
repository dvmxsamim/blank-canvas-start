-- Add is_admin column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create genres table
CREATE TABLE public.genres (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create languages table
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE, -- e.g., 'en', 'es', 'fr'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create artists table
CREATE TABLE public.artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  avatar_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create albums table
CREATE TABLE public.albums (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  release_date DATE,
  genre_id UUID REFERENCES public.genres(id),
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  duration INTEGER, -- in seconds
  genre_id UUID REFERENCES public.genres(id),
  language_id UUID REFERENCES public.languages(id),
  mood TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  play_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create song_artists junction table (many-to-many)
CREATE TABLE public.song_artists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES public.artists(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'main', -- 'main', 'featured', 'producer', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(song_id, artist_id, role)
);

-- Create album_songs junction table (many-to-many)
CREATE TABLE public.album_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID NOT NULL REFERENCES public.albums(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  track_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(album_id, song_id)
);

-- Create playlist_songs junction table (many-to-many)
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  added_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

-- Create likes table (polymorphic likes)
CREATE TABLE public.likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  likeable_type TEXT NOT NULL CHECK (likeable_type IN ('song', 'playlist', 'album', 'artist')),
  likeable_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, likeable_type, likeable_id)
);

-- Create shares table for sharing content
CREATE TABLE public.shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  shareable_type TEXT NOT NULL CHECK (shareable_type IN ('song', 'playlist', 'album', 'artist')),
  shareable_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create featured_content table for admin home page control
CREATE TABLE public.featured_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN ('album', 'artist', 'playlist')),
  content_id UUID NOT NULL,
  section TEXT NOT NULL, -- 'made_for_you', 'popular_artists', 'trending'
  position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(user_id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(content_type, content_id, section)
);

-- Enable RLS on all tables
ALTER TABLE public.genres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.album_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_content ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.profiles WHERE user_id = _user_id),
    FALSE
  );
$$;

-- Create function to generate unique slug
CREATE OR REPLACE FUNCTION public.generate_unique_slug(title TEXT, table_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
  slug_exists BOOLEAN;
BEGIN
  -- Generate base slug from title
  base_slug := lower(regexp_replace(trim(title), '[^a-zA-Z0-9\s-]', '', 'g'));
  base_slug := regexp_replace(base_slug, '\s+', '-', 'g');
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(base_slug, '-');
  
  final_slug := base_slug;
  
  -- Check if slug exists and increment counter if needed
  LOOP
    EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
    USING final_slug
    INTO slug_exists;
    
    IF NOT slug_exists THEN
      EXIT;
    END IF;
    
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$;

-- RLS Policies for genres
CREATE POLICY "Anyone can view genres" ON public.genres FOR SELECT USING (true);
CREATE POLICY "Only admins can insert genres" ON public.genres FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update genres" ON public.genres FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete genres" ON public.genres FOR DELETE USING (public.is_admin());

-- RLS Policies for languages
CREATE POLICY "Anyone can view languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Only admins can insert languages" ON public.languages FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update languages" ON public.languages FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete languages" ON public.languages FOR DELETE USING (public.is_admin());

-- RLS Policies for artists
CREATE POLICY "Anyone can view artists" ON public.artists FOR SELECT USING (true);
CREATE POLICY "Only admins can insert artists" ON public.artists FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update artists" ON public.artists FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete artists" ON public.artists FOR DELETE USING (public.is_admin());

-- RLS Policies for albums
CREATE POLICY "Anyone can view albums" ON public.albums FOR SELECT USING (true);
CREATE POLICY "Only admins can insert albums" ON public.albums FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update albums" ON public.albums FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete albums" ON public.albums FOR DELETE USING (public.is_admin());

-- RLS Policies for songs
CREATE POLICY "Anyone can view public songs" ON public.songs FOR SELECT USING (is_public = true OR public.is_admin() OR created_by = auth.uid());
CREATE POLICY "Only admins can insert songs" ON public.songs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update songs" ON public.songs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete songs" ON public.songs FOR DELETE USING (public.is_admin());

-- RLS Policies for playlists
CREATE POLICY "Users can view public playlists and their own" ON public.playlists FOR SELECT USING (is_public = true OR user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can create their own playlists" ON public.playlists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own playlists, admins can update any" ON public.playlists FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "Users can delete their own playlists, admins can delete any" ON public.playlists FOR DELETE USING (user_id = auth.uid() OR public.is_admin());

-- RLS Policies for junction tables
CREATE POLICY "Anyone can view song_artists" ON public.song_artists FOR SELECT USING (true);
CREATE POLICY "Only admins can insert song_artists" ON public.song_artists FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update song_artists" ON public.song_artists FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete song_artists" ON public.song_artists FOR DELETE USING (public.is_admin());

CREATE POLICY "Anyone can view album_songs" ON public.album_songs FOR SELECT USING (true);
CREATE POLICY "Only admins can insert album_songs" ON public.album_songs FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update album_songs" ON public.album_songs FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete album_songs" ON public.album_songs FOR DELETE USING (public.is_admin());

CREATE POLICY "Users can view playlist_songs for accessible playlists" ON public.playlist_songs FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.playlists p 
    WHERE p.id = playlist_id AND (p.is_public = true OR p.user_id = auth.uid() OR public.is_admin())
  )
);
CREATE POLICY "Users can insert playlist_songs for their playlists" ON public.playlist_songs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.playlists p 
    WHERE p.id = playlist_id AND (p.user_id = auth.uid() OR public.is_admin())
  )
);
CREATE POLICY "Users can update playlist_songs for their playlists" ON public.playlist_songs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.playlists p 
    WHERE p.id = playlist_id AND (p.user_id = auth.uid() OR public.is_admin())
  )
);
CREATE POLICY "Users can delete playlist_songs for their playlists" ON public.playlist_songs FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.playlists p 
    WHERE p.id = playlist_id AND (p.user_id = auth.uid() OR public.is_admin())
  )
);

-- RLS Policies for likes
CREATE POLICY "Users can view their own likes" ON public.likes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their own likes" ON public.likes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own likes" ON public.likes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own likes" ON public.likes FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for shares
CREATE POLICY "Anyone can view active shares" ON public.shares FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));
CREATE POLICY "Users can insert their own shares" ON public.shares FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own shares" ON public.shares FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own shares" ON public.shares FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for featured_content
CREATE POLICY "Anyone can view active featured content" ON public.featured_content FOR SELECT USING (is_active = true);
CREATE POLICY "Only admins can insert featured content" ON public.featured_content FOR INSERT WITH CHECK (public.is_admin());
CREATE POLICY "Only admins can update featured content" ON public.featured_content FOR UPDATE USING (public.is_admin());
CREATE POLICY "Only admins can delete featured content" ON public.featured_content FOR DELETE USING (public.is_admin());

-- Create triggers for updated_at columns
CREATE TRIGGER update_genres_updated_at BEFORE UPDATE ON public.genres FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_languages_updated_at BEFORE UPDATE ON public.languages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_artists_updated_at BEFORE UPDATE ON public.artists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON public.albums FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_playlists_updated_at BEFORE UPDATE ON public.playlists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_shares_updated_at BEFORE UPDATE ON public.shares FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_featured_content_updated_at BEFORE UPDATE ON public.featured_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default genres
INSERT INTO public.genres (name, slug) VALUES 
('Pop', 'pop'),
('Rock', 'rock'),
('Hip-Hop', 'hip-hop'),
('Electronic', 'electronic'),
('Jazz', 'jazz'),
('Classical', 'classical'),
('Country', 'country'),
('R&B', 'rb'),
('Folk', 'folk'),
('Reggae', 'reggae');

-- Insert default languages
INSERT INTO public.languages (name, code) VALUES 
('English', 'en'),
('Spanish', 'es'),
('French', 'fr'),
('German', 'de'),
('Italian', 'it'),
('Portuguese', 'pt'),
('Japanese', 'ja'),
('Korean', 'ko'),
('Chinese', 'zh'),
('Hindi', 'hi');

-- Create indexes for better performance
CREATE INDEX idx_songs_genre_id ON public.songs(genre_id);
CREATE INDEX idx_songs_language_id ON public.songs(language_id);
CREATE INDEX idx_songs_is_public ON public.songs(is_public);
CREATE INDEX idx_songs_play_count ON public.songs(play_count DESC);
CREATE INDEX idx_playlists_user_id ON public.playlists(user_id);
CREATE INDEX idx_playlists_is_public ON public.playlists(is_public);
CREATE INDEX idx_likes_user_id ON public.likes(user_id);
CREATE INDEX idx_likes_likeable ON public.likes(likeable_type, likeable_id);
CREATE INDEX idx_shares_token ON public.shares(share_token);
CREATE INDEX idx_shares_shareable ON public.shares(shareable_type, shareable_id);
CREATE INDEX idx_featured_content_section ON public.featured_content(section, is_active);