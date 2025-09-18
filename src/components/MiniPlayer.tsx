import { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, MoreVertical, Heart, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MiniPlayerProps {
  onOpenFullScreen?: () => void;
}

const MiniPlayer = ({ onOpenFullScreen }: MiniPlayerProps) => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffled,
    isRepeated,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
  } = useMusicPlayer();
  
  const isMobile = useIsMobile();
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  if (!currentSong) return null;

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressChange = (value: number[]) => {
    seekTo(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0] / 100);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseSong();
    } else {
      resumeSong();
    }
  };

  // Mobile mini player (clickable to open full screen)
  if (isMobile) {
    return (
      <Card 
        className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] left-0 right-0 z-50 rounded-none border-t border-l-0 border-r-0 border-b-0 bg-card/95 backdrop-blur-md cursor-pointer"
        onClick={onOpenFullScreen}
      >
        {/* Progress bar at top edge */}
        <div className="absolute top-0 left-0 right-0">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full h-1"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
        
        <CardContent className="p-3 pt-4">
          <div className="flex items-center gap-3">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">
                {currentSong.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {currentSong.artist}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handlePlayPause();
              }}
              className="h-10 w-10 rounded-full"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Desktop mini player (full controls)
  return (
    <Card className="fixed bottom-0 left-64 right-0 z-30 rounded-none border-t border-l-0 border-r-0 border-b-0 bg-card/95 backdrop-blur-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Song info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-14 h-14 rounded-lg object-cover"
            />
            <div className="min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate max-w-[200px]">
                {currentSong.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                {currentSong.artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleShuffle}
                className={cn("h-8 w-8", isShuffled && "text-primary")}
              >
                <Shuffle className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={previousSong}
                className="h-8 w-8"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={handlePlayPause}
                className="h-10 w-10 rounded-full"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={nextSong}
                className="h-8 w-8"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleRepeat}
                className={cn("h-8 w-8", isRepeated && "text-primary")}
              >
                <Repeat className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress bar */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                className="flex-1"
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Volume and actions */}
          <div className="flex items-center gap-2 min-w-0">
            <Button variant="ghost" size="sm" className="h-8 w-8">
              <Heart className="h-4 w-4" />
            </Button>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <Button variant="ghost" size="sm" className="h-8 w-8">
                <Volume2 className="h-4 w-4" />
              </Button>
              
              {showVolumeSlider && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-popover border rounded-lg shadow-lg">
                  <div className="h-20 flex items-center">
                    <Slider
                      value={[volume * 100]}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      orientation="vertical"
                      className="h-16"
                    />
                  </div>
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share className="mr-2 h-4 w-4" />
                  Share Song
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MiniPlayer;