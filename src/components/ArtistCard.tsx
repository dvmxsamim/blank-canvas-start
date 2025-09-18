import { Play, MoreVertical, Share, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface Artist {
  id: string;
  name: string;
  image: string;
  followers?: number;
  verified?: boolean;
  bio?: string;
}

interface ArtistCardProps {
  artist: Artist;
  onPlay?: (artistId: string) => void;
  variant?: 'grid' | 'carousel';
}

const ArtistCard = ({ artist, onPlay, variant = 'grid' }: ArtistCardProps) => {
  const navigate = useNavigate();
  
  const handleCardClick = () => {
    navigate(`/artist/${artist.id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlay?.(artist.id);
  };

  const handleShare = () => {
    console.log('Share artist:', artist.name);
    // Add share functionality here
  };

  const handleLike = () => {
    console.log('Add to liked:', artist.name);
    // Add like functionality here
  };

  const formatFollowers = (count?: number) => {
    if (!count) return '';
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`;
    }
    return `${count} followers`;
  };

  if (variant === 'carousel') {
    return (
      <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow bg-gradient-card border-border/50 w-64 flex-shrink-0" onClick={handleCardClick}>
        <CardContent className="p-4">
          <div className="relative">
            <img
              src={artist.image}
              alt={artist.name}
              className="w-20 h-20 object-cover rounded-full mx-auto"
            />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-0 right-0 z-20 h-8 w-8 p-0 opacity-100 bg-background/60 hover:bg-accent transition-opacity rounded-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border z-50">
                <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
                  <Share className="h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLike} className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Add to Liked
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {/* Play overlay */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 w-20 h-20 rounded-full bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
              <Button
                size="sm"
                onClick={handlePlayClick}
                className="bg-transparent hover:bg-transparent shadow-none p-2"
              >
                <Play className="w-4 h-4 text-white fill-white" />
              </Button>
            </div>
          </div>
          <div className="mt-4 space-y-2 text-center">
            <h3 className="font-medium text-sm text-foreground truncate">
              {artist.name}
              {artist.verified && (
                <span className="ml-1 text-primary text-xs">✓</span>
              )}
            </h3>
            {artist.bio && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {artist.bio}
              </p>
            )}
            {artist.followers && (
              <p className="text-xs text-muted-foreground">
                {formatFollowers(artist.followers)}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-glow bg-gradient-card border-border/50" onClick={handleCardClick}>
      <CardContent className="p-3">
        <div className="relative">
          <img
            src={artist.image}
            alt={artist.name}
            className="w-full aspect-square object-cover rounded-full"
          />
          {/* Play overlay */}
          <div className="absolute inset-0 rounded-full bg-primary/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <Button
              size="sm"
              onClick={handlePlayClick}
              className="bg-transparent hover:bg-transparent shadow-none p-2"
            >
              <Play className="w-4 h-4 text-white fill-white" />
            </Button>
          </div>
        </div>
        <div className="mt-3 space-y-1 text-center">
          <h3 className="font-medium text-sm text-foreground truncate">
            {artist.name}
            {artist.verified && (
              <span className="ml-1 text-primary text-xs">✓</span>
            )}
          </h3>
          {artist.bio && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {artist.bio}
            </p>
          )}
          {artist.followers && (
            <p className="text-xs text-muted-foreground">
              {formatFollowers(artist.followers)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">Artist</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ArtistCard;
export type { Artist, ArtistCardProps };