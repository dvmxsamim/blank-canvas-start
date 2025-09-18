import { Play, MoreVertical, Heart, Share, Plus, FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import CreatePlaylistModal from './CreatePlaylistModal';
import ShareModal from './ShareModal';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useLikes } from '@/hooks/useLikes';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  audio_url?: string;
}

interface SongCardProps {
  song: Song;
  onPlay?: (songId: string) => void;
  variant?: 'grid' | 'list';
  queue?: Song[];
  index?: number;
}

const SongCard = ({ song, onPlay, variant = 'grid', queue, index }: SongCardProps) => {
  const { toast } = useToast();
  const { playSong } = useMusicPlayer();
  const { toggleLike, isLiked } = useLikes();
  const { user } = useAuth();
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<any[]>([]);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  useEffect(() => {
    if (user && showPlaylistMenu) {
      fetchUserPlaylists();
    }
  }, [user, showPlaylistMenu]);

  const fetchUserPlaylists = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('id, title')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPlaylists(data || []);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('SongCard handlePlayClick called for:', song.title);
    console.log('Song data:', song);
    playSong(song, queue, index);
    onPlay?.(song.id);
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to add songs to playlists",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if song already exists in playlist
      const { data: existing } = await supabase
        .from('playlist_songs')
        .select('id')
        .eq('playlist_id', playlistId)
        .eq('song_id', song.id)
        .single();

      if (existing) {
        toast({
          title: "Already added",
          description: "This song is already in the playlist",
          variant: "destructive",
        });
        return;
      }

      // Get the next position
      const { data: maxPosition } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .single();

      const nextPosition = (maxPosition?.position || 0) + 1;

      // Add song to playlist
      const { error } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: song.id,
          position: nextPosition,
          added_by: user.id
        });

      if (error) throw error;

      toast({
        title: "Added to playlist",
        description: `${song.title} has been added to your playlist`,
      });
      
      setShowPlaylistMenu(false);
    } catch (error) {
      console.error('Error adding to playlist:', error);
      toast({
        title: "Error",
        description: "Failed to add song to playlist",
        variant: "destructive",
      });
    }
  };

  const handleShareSong = () => {
    setIsShareModalOpen(true);
  };

  const handleAddToLiked = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like songs",
        variant: "destructive",
      });
      return;
    }
    
    await toggleLike(song.id, 'song');
  };

  const handleCreatePlaylist = () => {
    setIsCreatePlaylistOpen(true);
  };

  const handleCloseCreatePlaylist = () => {
    setIsCreatePlaylistOpen(false);
  };

  // Grid layout (default)
  if (variant === 'grid') {
    return (
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow bg-gradient-card border-border/50">
        <CardContent className="p-3">
          <div className="relative">
            <img
              src={song.cover}
              alt={song.title}
              className="w-full aspect-square object-cover rounded-lg"
            />
            {/* More options (always visible) */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2 z-20 h-8 w-8 p-0 opacity-100 bg-background/60 hover:bg-accent transition-opacity rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-popover border border-border shadow-lg z-50"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setShowPlaylistMenu(true); fetchUserPlaylists();}}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add to Playlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleShareSong();}}>
                  <Share className="mr-2 h-4 w-4" />
                  Share Song
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleAddToLiked();}}>
                  <Heart className={`mr-2 h-4 w-4 ${isLiked(song.id) ? 'fill-current text-red-500' : ''}`} />
                  {isLiked(song.id) ? 'Remove from Liked' : 'Add to Liked'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleCreatePlaylist();}}>
                  <FolderPlus className="mr-2 h-4 w-4" />
                  Create Playlist
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Play button overlay */}
            <Button
              onClick={handlePlayClick}
              className="absolute inset-0 z-10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:pointer-events-auto transition-all duration-300 bg-primary/80 hover:bg-primary/90 rounded-lg flex items-center justify-center p-0 h-full w-full"
            >
              <Play className="w-6 h-6" />
            </Button>
          </div>
          <div className="mt-3 space-y-1">
            <h3 className="font-medium text-sm text-foreground truncate max-w-full" title={song.title}>
              {song.title.length > 25 ? `${song.title.substring(0, 25)}...` : song.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-full" title={song.artist}>
              {song.artist.length > 30 ? `${song.artist.substring(0, 30)}...` : song.artist}
            </p>
          </div>
        </CardContent>
        <CreatePlaylistModal 
          isOpen={isCreatePlaylistOpen} 
          onClose={handleCloseCreatePlaylist}
          songToAdd={song}
        />
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          title={song.title}
          type="song"
          id={song.id}
        />

        {/* Add to Playlist Menu */}
        {showPlaylistMenu && (
          <DropdownMenu open={showPlaylistMenu} onOpenChange={setShowPlaylistMenu}>
            <DropdownMenuTrigger asChild>
              <div />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {userPlaylists.length === 0 ? (
                <DropdownMenuItem disabled>
                  No playlists found
                </DropdownMenuItem>
              ) : (
                userPlaylists.map((playlist) => (
                  <DropdownMenuItem 
                    key={playlist.id} 
                    onClick={(e) => {e.stopPropagation(); handleAddToPlaylist(playlist.id);}}
                  >
                    {playlist.title}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Card>
    );
  }

  // List layout for mobile
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow bg-gradient-card border-border/50" onClick={handlePlayClick}>
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          {/* Cover Image */}
          <div className="relative flex-shrink-0">
            <img
              src={song.cover}
              alt={song.title}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <Button
              onClick={handlePlayClick}
              className="absolute inset-0 z-10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto focus:pointer-events-auto transition-all duration-300 bg-primary/80 hover:bg-primary/90 rounded-lg flex items-center justify-center p-0 h-full w-full"
            >
              <Play className="w-4 h-4" />
            </Button>
          </div>

          {/* Song Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm text-foreground truncate max-w-full" title={song.title}>
              {song.title.length > 20 ? `${song.title.substring(0, 20)}...` : song.title}
            </h3>
            <p className="text-xs text-muted-foreground truncate max-w-full" title={song.artist}>
              {song.artist.length > 25 ? `${song.artist.substring(0, 25)}...` : song.artist}
            </p>
          </div>

          {/* More Options */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-popover border border-border shadow-lg z-50"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); setShowPlaylistMenu(true); fetchUserPlaylists();}}>
                <Plus className="mr-2 h-4 w-4" />
                Add to Playlist
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleShareSong();}}>
                <Share className="mr-2 h-4 w-4" />
                Share Song
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleAddToLiked();}}>
                <Heart className={`mr-2 h-4 w-4 ${isLiked(song.id) ? 'fill-current text-red-500' : ''}`} />
                {isLiked(song.id) ? 'Remove from Liked' : 'Add to Liked'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => {e.stopPropagation(); handleCreatePlaylist();}}>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Playlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
      
      <CreatePlaylistModal 
        isOpen={isCreatePlaylistOpen} 
        onClose={handleCloseCreatePlaylist}
        songToAdd={song}
      />
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title={song.title}
        type="song"
        id={song.id}
      />

      {/* Add to Playlist Menu */}
      {showPlaylistMenu && (
        <DropdownMenu open={showPlaylistMenu} onOpenChange={setShowPlaylistMenu}>
          <DropdownMenuTrigger asChild>
            <div />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {userPlaylists.length === 0 ? (
              <DropdownMenuItem disabled>
                No playlists found
              </DropdownMenuItem>
            ) : (
              userPlaylists.map((playlist) => (
                <DropdownMenuItem 
                  key={playlist.id} 
                  onClick={(e) => {e.stopPropagation(); handleAddToPlaylist(playlist.id);}}
                >
                  {playlist.title}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </Card>
  );
};

export default SongCard;
export type { Song, SongCardProps };