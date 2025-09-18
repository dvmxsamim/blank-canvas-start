import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Playlist {
  id: string;
  name: string;
  cover: string;
  songCount: number;
  creator: string;
}

interface PlaylistCardProps {
  playlist: Playlist;
  onPlay?: (playlistId: string) => void;
}

const PlaylistCard = ({ playlist, onPlay }: PlaylistCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/playlist/${playlist.id}`);
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.(playlist.id);
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow bg-gradient-card border-border/50" onClick={handleCardClick}>
      <CardContent className="p-3">
        <div className="relative">
          <img
            src={playlist.cover}
            alt={playlist.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <Button
            size="sm"
            onClick={handlePlayClick}
            className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-primary hover:bg-primary/90 shadow-lg"
          >
            <Play className="w-3 h-3" />
          </Button>
        </div>
        <div className="mt-3 space-y-1">
          <h3 className="font-medium text-sm text-foreground truncate">{playlist.name}</h3>
          <p className="text-xs text-muted-foreground truncate">By {playlist.creator}</p>
          <p className="text-xs text-muted-foreground">{playlist.songCount} songs</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlaylistCard;
export type { Playlist, PlaylistCardProps };