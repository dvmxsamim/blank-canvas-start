import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Music, Users, Album, List, BarChart3, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  totalSongs: number;
  totalArtists: number;
  totalAlbums: number;
  totalPlaylists: number;
  totalUsers: number;
  totalPlays: number;
}

const AdminStats = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const [stats, setStats] = useState<Stats>({
    totalSongs: 0,
    totalArtists: 0,
    totalAlbums: 0,
    totalPlaylists: 0,
    totalUsers: 0,
    totalPlays: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const [
        songsRes,
        artistsRes,
        albumsRes,
        playlistsRes,
        profilesRes,
        playsRes
      ] = await Promise.all([
        supabase.from('songs').select('id', { count: 'exact', head: true }),
        supabase.from('artists').select('id', { count: 'exact', head: true }),
        supabase.from('albums').select('id', { count: 'exact', head: true }),
        supabase.from('playlists').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('songs').select('play_count')
      ]);

      const totalPlays = playsRes.data?.reduce((sum, song) => sum + (song.play_count || 0), 0) || 0;

      setStats({
        totalSongs: songsRes.count || 0,
        totalArtists: artistsRes.count || 0,
        totalAlbums: albumsRes.count || 0,
        totalPlaylists: playlistsRes.count || 0,
        totalUsers: profilesRes.count || 0,
        totalPlays,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    description,
    colorClass = "text-primary"
  }: {
    title: string;
    value: number;
    icon: any;
    description: string;
    colorClass?: string;
  }) => (
    <Card className="bg-gradient-card border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {loading ? (
                <div className="w-8 h-6 bg-muted animate-pulse rounded" />
              ) : (
                value.toLocaleString()
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard
        title="Total Songs"
        value={stats.totalSongs}
        icon={Music}
        description="Songs in library"
        colorClass="text-primary"
      />
      <StatCard
        title="Total Artists"
        value={stats.totalArtists}
        icon={Users}
        description="Artists registered"
        colorClass="text-music-secondary"
      />
      <StatCard
        title="Total Albums"
        value={stats.totalAlbums}
        icon={Album}
        description="Albums created"
        colorClass="text-music-accent"
      />
      <StatCard
        title="Total Playlists"
        value={stats.totalPlaylists}
        icon={List}
        description="User playlists"
        colorClass="text-music-success"
      />
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={BarChart3}
        description="Registered users"
        colorClass="text-music-warning"
      />
      <StatCard
        title="Total Plays"
        value={stats.totalPlays}
        icon={TrendingUp}
        description="Total song plays"
        colorClass="text-destructive"
      />
    </div>
  );
};

export default AdminStats;