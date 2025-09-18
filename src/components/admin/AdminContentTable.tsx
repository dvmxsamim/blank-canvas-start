import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, EyeOff, Search, Music, Users, Album, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminEditModal from './AdminEditModal';

interface ContentItem {
  id: string;
  title?: string;
  name?: string;
  cover_url?: string;
  avatar_url?: string;
  is_public?: boolean;
  is_verified?: boolean;
  created_at: string;
  play_count?: number;
  artist_name?: string;
  genre_name?: string;
}

const AdminContentTable = ({ refreshTrigger }: { refreshTrigger?: number }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState<'songs' | 'artists' | 'albums' | 'playlists'>('songs');
  const [searchQuery, setSearchQuery] = useState('');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchContent();
  }, [contentType, refreshTrigger]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      let query;
      
      switch (contentType) {
        case 'songs':
          query = supabase
            .from('songs')
            .select(`
              id, title, cover_url, is_public, created_at, play_count,
              genres!inner(name),
              song_artists!inner(
                artists!inner(name)
              )
            `)
            .order('created_at', { ascending: false });
          break;
        case 'artists':
          query = supabase
            .from('artists')
            .select('id, name, avatar_url, is_verified, created_at')
            .order('created_at', { ascending: false });
          break;
        case 'albums':
          query = supabase
            .from('albums')
            .select(`
              id, title, cover_url, created_at,
              genres(name)
            `)
            .order('created_at', { ascending: false });
          break;
        case 'playlists':
          query = supabase
            .from('playlists')
            .select('id, title, cover_url, is_public, created_at')
            .order('created_at', { ascending: false });
          break;
        default:
          return;
      }

      const { data, error } = await query;
      if (error) throw error;

      // Transform data to include nested field values
      const transformedData = data?.map((item: any) => ({
        ...item,
        genre_name: item.genres?.name || null,
        artist_name: item.song_artists?.[0]?.artists?.name || null
      })) || [];

      setContent(transformedData);
    } catch (error: any) {
      toast({
        title: "Error fetching content",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: string, currentStatus: boolean) => {
    try {
      const updates = contentType === 'artists' 
        ? { is_verified: !currentStatus }
        : { is_public: !currentStatus };

      const { error } = await supabase
        .from(contentType)
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status updated",
        description: `${contentType.slice(0, -1)} status has been updated.`,
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from(contentType)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Item deleted",
        description: `${contentType.slice(0, -1)} has been deleted.`,
      });

      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error deleting item",
      description: error.message,
      variant: "destructive",
    });
  }
};

const handleEdit = (item: ContentItem) => {
  setEditingItem(item);
  setEditModalOpen(true);
};

  const filteredContent = content.filter(item => {
    const searchableText = (item.title || item.name || '').toLowerCase();
    return searchableText.includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (item: ContentItem) => {
    if (contentType === 'artists') {
      return (
        <Badge variant={item.is_verified ? 'default' : 'secondary'}>
          {item.is_verified ? 'Verified' : 'Unverified'}
        </Badge>
      );
    }
    return (
      <Badge variant={item.is_public ? 'default' : 'secondary'}>
        {item.is_public ? 'Public' : 'Private'}
      </Badge>
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'songs': return <Music className="w-4 h-4" />;
      case 'artists': return <Users className="w-4 h-4" />;
      case 'albums': return <Album className="w-4 h-4" />;
      case 'playlists': return <List className="w-4 h-4" />;
      default: return <Music className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getIcon(contentType)}
            Manage Content
          </CardTitle>
          <div className="flex gap-2">
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="songs">Songs</SelectItem>
                <SelectItem value="artists">Artists</SelectItem>
                <SelectItem value="albums">Albums</SelectItem>
                <SelectItem value="playlists">Playlists</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${contentType}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name/Title</TableHead>
                {contentType === 'songs' && (
                  <>
                    <TableHead>Artist</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Plays</TableHead>
                  </>
                )}
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <img
                      src={item.cover_url || item.avatar_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=50&h=50&fit=crop'}
                      alt={item.title || item.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.title || item.name}
                  </TableCell>
                  {contentType === 'songs' && (
                    <>
                      <TableCell>{item.artist_name || 'Unknown'}</TableCell>
                      <TableCell>{item.genre_name || 'Unknown'}</TableCell>
                      <TableCell>{item.play_count?.toLocaleString() || 0}</TableCell>
                    </>
                  )}
                  <TableCell>{getStatusBadge(item)}</TableCell>
                  <TableCell>
                    {new Date(item.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleVisibility(item.id, contentType === 'artists' ? item.is_verified! : item.is_public!)}
                      >
                        {(contentType === 'artists' ? item.is_verified : item.is_public) ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteContent(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      
      <AdminEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        contentType={contentType}
        item={editingItem}
        onUpdated={fetchContent}
      />
    </Card>
  );
};

export default AdminContentTable;