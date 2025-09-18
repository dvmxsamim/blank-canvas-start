import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface GuestMiniPlayerProps {
  song: {
    id: string;
    title: string;
    audio_url: string;
    cover_url?: string | null;
    song_artists?: Array<{
      role: string;
      artists: {
        name: string;
      } | null;
    }>;
  };
}

const GuestMiniPlayer = ({ song }: GuestMiniPlayerProps) => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (song.audio_url) {
      audioRef.current = new Audio(song.audio_url);
      
      const audio = audioRef.current;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration || 0);
      });
      
      audio.addEventListener('timeupdate', () => {
        setCurrentTime(audio.currentTime || 0);
      });
      
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audio.volume = volume;
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentTime(0);
    };
  }, [song.id, song.audio_url]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleProgressChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const artist = song.song_artists?.find(sa => sa.role === 'main')?.artists?.name || 'Unknown Artist';

  return (
    <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t border-l-0 border-r-0 border-b-0 bg-card/95 backdrop-blur-md">
      <CardContent className="p-4">
        {/* Progress bar */}
        <div className="mb-4">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleProgressChange}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Song info */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <img
              src={song.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=60&h=60&fit=crop'}
              alt={song.title}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-foreground truncate">
                {song.title}
              </h4>
              <p className="text-xs text-muted-foreground truncate">
                {artist}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
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

            {/* Volume control */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="h-8 w-8"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <div className="w-20">
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Sign up prompt */}
            <Button
              onClick={() => navigate('/login')}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-xs px-3"
            >
              Sign Up
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestMiniPlayer;