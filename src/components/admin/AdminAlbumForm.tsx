import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Album, Search, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Genre {
  id: string;
  name: string;
}

interface Song {
  id: string;
  title: string;
  artist_name?: string;
  song_artists?: {
    artist: {
      name: string;
    };
  }[];
}

const AdminAlbumForm = ({ onAlbumAdded }: { onAlbumAdded?: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [showSongSearch, setShowSongSearch] = useState(false);
  
  const [albumForm, setAlbumForm] = useState({
    title: '',
    description: '',
    coverUrl: '',
    genreId: '',
    releaseDate: '',
    isFeatured: false,
  });

  useEffect(() => {
    fetchGenres();
    fetchSongs();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        fetchSongs(searchQuery);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      fetchSongs();
    }
  }, [searchQuery]);

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('genres')
        .select('id, name')
        .order('name');

      if (error) throw error;
      if (data) setGenres(data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  const fetchSongs = async (search?: string) => {
    try {
      let query = supabase
        .from('songs')
        .select(`
          id,
          title,
          song_artists(
            artist:artists(name)
          )
        `)
        .eq('is_public', true)
        .order('title');

      if (search) {
        query = query.ilike('title', `%${search}%`);
      }

      const { data, error } = await query.limit(50);

      if (error) throw error;
      if (data) setSongs(data);
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // First create the album
      const { data: albumData, error: albumError } = await supabase
        .from('albums')
        .insert({
          title: albumForm.title,
          description: albumForm.description || null,
          cover_url: albumForm.coverUrl || null,
          genre_id: albumForm.genreId || null,
          release_date: albumForm.releaseDate || null,
          is_featured: albumForm.isFeatured,
          slug: albumForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        })
        .select()
        .single();

      if (albumError) throw albumError;

      // Add selected songs to the album
      if (selectedSongs.length > 0 && albumData) {
        const albumSongs = selectedSongs.map((songId, index) => ({
          album_id: albumData.id,
          song_id: songId,
          track_number: index + 1
        }));

        const { error: songsError } = await supabase
          .from('album_songs')
          .insert(albumSongs);

        if (songsError) throw songsError;
      }

      toast({
        title: "Album added successfully",
        description: `"${albumForm.title}" has been added with ${selectedSongs.length} songs.`,
      });

      // Reset form
      setAlbumForm({
        title: '',
        description: '',
        coverUrl: '',
        genreId: '',
        releaseDate: '',
        isFeatured: false,
      });
      setSelectedSongs([]);
      setShowSongSearch(false);

      onAlbumAdded?.();
    } catch (error: any) {
      toast({
        title: "Error adding album",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  const filteredSongs = songs.filter(song => 
    song.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Album className="w-5 h-5" />
          Add New Album
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="albumTitle">Album Title *</Label>
              <Input
                id="albumTitle"
                value={albumForm.title}
                onChange={(e) => setAlbumForm({...albumForm, title: e.target.value})}
                placeholder="Enter album title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="releaseDate">Release Date</Label>
              <Input
                id="releaseDate"
                type="date"
                value={albumForm.releaseDate}
                onChange={(e) => setAlbumForm({...albumForm, releaseDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="albumCoverUrl">Album Cover URL</Label>
            <Input
              id="albumCoverUrl"
              value={albumForm.coverUrl}
              onChange={(e) => setAlbumForm({...albumForm, coverUrl: e.target.value})}
              placeholder="https://example.com/album-cover.jpg"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="albumGenre">Genre</Label>
            <Select value={albumForm.genreId} onValueChange={(value) => setAlbumForm({...albumForm, genreId: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map((genre) => (
                  <SelectItem key={genre.id} value={genre.id}>
                    {genre.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="albumDescription">Description</Label>
            <Textarea
              id="albumDescription"
              value={albumForm.description}
              onChange={(e) => setAlbumForm({...albumForm, description: e.target.value})}
              placeholder="Enter album description..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={albumForm.isFeatured}
              onCheckedChange={(checked) => setAlbumForm({...albumForm, isFeatured: checked})}
            />
            <Label htmlFor="featured">Featured Album (appears in "Made For You")</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Album Songs</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSongSearch(!showSongSearch)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Songs
              </Button>
            </div>

            {selectedSongs.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedSongs.length} song(s) selected
              </div>
            )}

            {showSongSearch && (
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search songs..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {filteredSongs.map((song) => (
                      <div key={song.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={song.id}
                          checked={selectedSongs.includes(song.id)}
                          onCheckedChange={() => toggleSongSelection(song.id)}
                        />
                        <Label htmlFor={song.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{song.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {song.song_artists?.[0]?.artist?.name || 'Unknown Artist'}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Adding Album...
              </>
            ) : (
              <>
                <Album className="w-4 h-4 mr-2" />
                Add Album
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminAlbumForm;