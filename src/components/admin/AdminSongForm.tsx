import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Genre {
  id: string;
  name: string;
}

interface Language {
  id: string;
  name: string;
}

interface Artist {
  id: string;
  name: string;
}

const AdminSongForm = ({ onSongAdded }: { onSongAdded?: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [newArtistName, setNewArtistName] = useState('');
  
  const [songForm, setSongForm] = useState({
    title: '',
    audioUrl: '',
    coverUrl: '',
    genreId: '',
    languageId: '',
    mood: 'happy',
    duration: '',
    isPublic: true,
    isFeatured: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [genresRes, languagesRes, artistsRes] = await Promise.all([
        supabase.from('genres').select('id, name').order('name'),
        supabase.from('languages').select('id, name').order('name'),
        supabase.from('artists').select('id, name').order('name')
      ]);

      if (genresRes.data) setGenres(genresRes.data);
      if (languagesRes.data) setLanguages(languagesRes.data);
      if (artistsRes.data) setArtists(artistsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create new artist if provided
      let newArtistId = null;
      if (newArtistName.trim()) {
        const { data: artistData, error: artistError } = await supabase
          .from('artists')
          .insert({
            name: newArtistName.trim(),
            slug: newArtistName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          })
          .select()
          .single();

        if (artistError) throw artistError;
        newArtistId = artistData.id;
      }

      // Create song
      const { data: song, error: songError } = await supabase
        .from('songs')
        .insert({
          title: songForm.title,
          audio_url: songForm.audioUrl,
          cover_url: songForm.coverUrl || null,
          genre_id: songForm.genreId || null,
          language_id: songForm.languageId || null,
          mood: songForm.mood || null,
          duration: songForm.duration ? parseDuration(songForm.duration) : null,
          is_public: songForm.isPublic,
          is_featured: songForm.isFeatured,
          slug: songForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        })
        .select()
        .single();

      if (songError) throw songError;

      // Create song-artist associations
      const songArtists = [];
      
      // Add selected existing artists
      selectedArtists.forEach(artistId => {
        songArtists.push({
          song_id: song.id,
          artist_id: artistId,
          role: 'main'
        });
      });

      // Add new artist if created
      if (newArtistId) {
        songArtists.push({
          song_id: song.id,
          artist_id: newArtistId,
          role: 'main'
        });
      }

      if (songArtists.length > 0) {
        const { error: artistError } = await supabase
          .from('song_artists')
          .insert(songArtists);

        if (artistError) throw artistError;
      }

      toast({
        title: "Song added successfully",
        description: `"${songForm.title}" has been added to the library.`,
      });

      // Reset form
      setSongForm({
        title: '',
        audioUrl: '',
        coverUrl: '',
        genreId: '',
        languageId: '',
        mood: 'happy',
        duration: '',
        isPublic: true,
        isFeatured: false,
      });
      setSelectedArtists([]);
      setNewArtistName('');

      onSongAdded?.();
    } catch (error: any) {
      toast({
        title: "Error adding song",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const parseDuration = (durationStr: string) => {
    const parts = durationStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      return minutes * 60 + seconds;
    }
    return 0;
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add New Song
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Song Title *</Label>
              <Input
                id="title"
                value={songForm.title}
                onChange={(e) => setSongForm({...songForm, title: e.target.value})}
                placeholder="Enter song title"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mood">Mood</Label>
              <Select value={songForm.mood} onValueChange={(value) => setSongForm({...songForm, mood: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="happy">Happy</SelectItem>
                  <SelectItem value="sad">Sad</SelectItem>
                  <SelectItem value="energetic">Energetic</SelectItem>
                  <SelectItem value="chill">Chill</SelectItem>
                  <SelectItem value="romantic">Romantic</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                  <SelectItem value="peaceful">Peaceful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audioUrl">Audio File URL *</Label>
            <Input
              id="audioUrl"
              value={songForm.audioUrl}
              onChange={(e) => setSongForm({...songForm, audioUrl: e.target.value})}
              placeholder="https://example.com/audio.mp3"
              type="url"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="coverUrl">Cover Image URL</Label>
            <Input
              id="coverUrl"
              value={songForm.coverUrl}
              onChange={(e) => setSongForm({...songForm, coverUrl: e.target.value})}
              placeholder="https://example.com/cover.jpg"
              type="url"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Select value={songForm.genreId} onValueChange={(value) => setSongForm({...songForm, genreId: value})}>
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
              <Label htmlFor="language">Language</Label>
              <Select value={songForm.languageId} onValueChange={(value) => setSongForm({...songForm, languageId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((language) => (
                    <SelectItem key={language.id} value={language.id}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (MM:SS)</Label>
              <Input
                id="duration"
                value={songForm.duration}
                onChange={(e) => setSongForm({...songForm, duration: e.target.value})}
                placeholder="3:45"
                pattern="[0-9]:[0-5][0-9]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label>Artists *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {artists.map((artist) => (
                <div key={artist.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={artist.id}
                    checked={selectedArtists.includes(artist.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedArtists([...selectedArtists, artist.id]);
                      } else {
                        setSelectedArtists(selectedArtists.filter(id => id !== artist.id));
                      }
                    }}
                  />
                  <Label 
                    htmlFor={artist.id} 
                    className="text-sm cursor-pointer"
                  >
                    {artist.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newArtist">Or add new artist</Label>
              <div className="flex gap-2">
                <Input
                  id="newArtist"
                  value={newArtistName}
                  onChange={(e) => setNewArtistName(e.target.value)}
                  placeholder="Enter new artist name"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPublic"
              checked={songForm.isPublic}
              onCheckedChange={(checked) => setSongForm({...songForm, isPublic: checked})}
            />
            <Label htmlFor="isPublic">Make song public</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={songForm.isFeatured}
              onCheckedChange={(checked) => setSongForm({...songForm, isFeatured: checked})}
            />
            <Label htmlFor="featured">Featured Song (appears in "Trending Now")</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Adding Song...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Add Song
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminSongForm;