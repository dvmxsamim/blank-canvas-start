import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminArtistForm = ({ onArtistAdded }: { onArtistAdded?: () => void }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [artistForm, setArtistForm] = useState({
    name: '',
    bio: '',
    avatarUrl: '',
    isVerified: false,
    isFeatured: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('artists')
        .insert({
        name: artistForm.name,
        bio: artistForm.bio || null,
        avatar_url: artistForm.avatarUrl || null,
        is_verified: artistForm.isVerified,
        is_featured: artistForm.isFeatured,
        slug: artistForm.name.toLowerCase().replace(/[a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        });

      if (error) throw error;

      toast({
        title: "Artist added successfully",
        description: `"${artistForm.name}" has been added to the artists list.`,
      });

      // Reset form
      setArtistForm({
        name: '',
        bio: '',
        avatarUrl: '',
        isVerified: false,
        isFeatured: false,
      });

      onArtistAdded?.();
    } catch (error: any) {
      toast({
        title: "Error adding artist",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Add New Artist
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artistName">Artist Name *</Label>
            <Input
              id="artistName"
              value={artistForm.name}
              onChange={(e) => setArtistForm({...artistForm, name: e.target.value})}
              placeholder="Enter artist name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar Image URL</Label>
            <Input
              id="avatarUrl"
              value={artistForm.avatarUrl}
              onChange={(e) => setArtistForm({...artistForm, avatarUrl: e.target.value})}
              placeholder="https://example.com/avatar.jpg"
              type="url"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biography</Label>
            <Textarea
              id="bio"
              value={artistForm.bio}
              onChange={(e) => setArtistForm({...artistForm, bio: e.target.value})}
              placeholder="Enter artist biography..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isVerified"
              checked={artistForm.isVerified}
              onCheckedChange={(checked) => setArtistForm({...artistForm, isVerified: checked})}
            />
            <Label htmlFor="isVerified">Verified Artist</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={artistForm.isFeatured}
              onCheckedChange={(checked) => setArtistForm({...artistForm, isFeatured: checked})}
            />
            <Label htmlFor="featured">Featured Artist (appears in "Popular Artist")</Label>
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-primary hover:opacity-90"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Adding Artist...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Artist
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AdminArtistForm;