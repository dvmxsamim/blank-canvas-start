import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Album {
  id: string;
  title: string;
  artist: string;
  cover: string;
  year: number;
  trackCount?: number;
}

interface AlbumCardProps {
  album: Album;
  onPlay?: (albumId: string) => void;
}

const AlbumCard = ({ album, onPlay }: AlbumCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/album/${album.id}`);
  };
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.(album.id);
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow bg-gradient-card border-border/50" onClick={handleCardClick}>
      <CardContent className="p-3">
        <div className="relative">
          <img
            src={album.cover}
            alt={album.title}
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
          <h3 className="font-medium text-sm text-foreground truncate">{album.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{album.artist}</p>
          <p className="text-xs text-muted-foreground">{album.year}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AlbumCard;
export type { Album, AlbumCardProps };