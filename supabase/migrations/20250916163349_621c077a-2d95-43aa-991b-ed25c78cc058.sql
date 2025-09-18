-- Add featured content fields to support admin featured content system
ALTER TABLE public.albums ADD COLUMN is_featured boolean DEFAULT false;
ALTER TABLE public.songs ADD COLUMN is_featured boolean DEFAULT false;
ALTER TABLE public.artists ADD COLUMN is_featured boolean DEFAULT false;

-- Create indexes for better performance when querying featured content
CREATE INDEX idx_albums_is_featured ON public.albums(is_featured) WHERE is_featured = true;
CREATE INDEX idx_songs_is_featured ON public.songs(is_featured) WHERE is_featured = true;
CREATE INDEX idx_artists_is_featured ON public.artists(is_featured) WHERE is_featured = true;