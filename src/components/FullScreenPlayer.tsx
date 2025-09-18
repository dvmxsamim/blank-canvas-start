import { X, Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, MoreVertical, Heart, Share, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { cn } from '@/lib/utils';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
}

const FullScreenPlayer = ({ isOpen, onClose }: FullScreenPlayerProps) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    isShuffled,
    isRepeated,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    seekTo,
    toggleShuffle,
    toggleRepeat,
  } = useMusicPlayer();

  if (!isOpen || !currentSong) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    seekTo(value[0]);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 w-10 rounded-full"
        >
          <ChevronDown className="h-5 w-5" />
        </Button>
        
        <div className="text-center">
          <p className="text-sm font-medium">Playing from</p>
          <p className="text-xs text-muted-foreground">Your Library</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <Heart className="mr-2 h-4 w-4" />
              Add to Liked
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Share className="mr-2 h-4 w-4" />
              Share Song
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-6">
        {/* Album Cover */}
        <div className="flex justify-center mb-8">
          <img
            src={currentSong.cover}
            alt={currentSong.title}
            className="w-80 h-80 rounded-xl object-cover shadow-2xl"
          />
        </div>

        {/* Song Info */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {currentSong.title}
          </h1>
          <p className="text-lg text-muted-foreground">
            {currentSong.artist}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full mb-2"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleShuffle}
            className={cn("h-12 w-12 rounded-full", isShuffled && "text-primary")}
          >
            <Shuffle className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={previousSong}
            className="h-12 w-12 rounded-full"
          >
            <SkipBack className="h-6 w-6" />
          </Button>
          
          <Button
            variant="default"
            size="lg"
            onClick={handlePlayPause}
            className="h-16 w-16 rounded-full"
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={nextSong}
            className="h-12 w-12 rounded-full"
          >
            <SkipForward className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={toggleRepeat}
            className={cn("h-12 w-12 rounded-full", isRepeated && "text-primary")}
          >
            <Repeat className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FullScreenPlayer;