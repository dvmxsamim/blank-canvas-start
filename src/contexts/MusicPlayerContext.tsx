import { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface Song {
  id: string;
  title: string;
  artist: string;
  cover: string;
  duration: string;
  audio_url?: string;
}

interface MusicPlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffled: boolean;
  isRepeated: boolean;
  queue: Song[];
  currentIndex: number;
  
  // Actions
  playSong: (song: Song, queue?: Song[], index?: number) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  clearQueue: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextType | undefined>(undefined);

interface MusicPlayerProviderProps {
  children: ReactNode;
}

export const MusicPlayerProvider = ({ children }: MusicPlayerProviderProps) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isShuffled, setIsShuffled] = useState(false);
  const [isRepeated, setIsRepeated] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSong = (song: Song, newQueue?: Song[], index?: number) => {
    console.log('PlaySong called with:', song);
    console.log('Audio URL:', song.audio_url);
    
    if (!song.audio_url || song.audio_url.trim() === '') {
      console.error('No audio URL provided for song:', song.title);
      return;
    }
    
    setCurrentSong(song);
    if (newQueue) {
      setQueue(newQueue);
      setCurrentIndex(index || 0);
    }
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    // Create new audio element
    audioRef.current = new Audio(song.audio_url);
    
    audioRef.current.addEventListener('loadedmetadata', () => {
      setDuration(audioRef.current?.duration || 0);
    });
    
    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current?.currentTime || 0);
    });
    
    audioRef.current.addEventListener('ended', () => {
      if (isRepeated) {
        audioRef.current?.play();
      } else {
        nextSong();
      }
    });
    
    audioRef.current.volume = volume;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const resumeSong = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const nextSong = () => {
    if (queue.length === 0) return;
    
    let nextIndex;
    if (isShuffled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        nextIndex = 0;
      }
    }
    
    const nextSong = queue[nextIndex];
    if (nextSong) {
      playSong(nextSong, queue, nextIndex);
    }
  };

  const previousSong = () => {
    if (queue.length === 0) return;
    
    let prevIndex;
    if (isShuffled) {
      prevIndex = Math.floor(Math.random() * queue.length);
    } else {
      prevIndex = currentIndex - 1;
      if (prevIndex < 0) {
        prevIndex = queue.length - 1;
      }
    }
    
    const prevSong = queue[prevIndex];
    if (prevSong) {
      playSong(prevSong, queue, prevIndex);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (newVolume: number) => {
    setVolumeState(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    setIsRepeated(!isRepeated);
  };

  const clearQueue = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setCurrentSong(null);
    setIsPlaying(false);
    setQueue([]);
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const value: MusicPlayerContextType = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isShuffled,
    isRepeated,
    queue,
    currentIndex,
    playSong,
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    clearQueue,
  };

  return (
    <MusicPlayerContext.Provider value={value}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const context = useContext(MusicPlayerContext);
  if (context === undefined) {
    throw new Error('useMusicPlayer must be used within a MusicPlayerProvider');
  }
  return context;
};