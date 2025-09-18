import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentType: 'songs' | 'artists' | 'albums' | 'playlists';
  item: any;
  onUpdated: () => void;
}

const AdminEditModal = ({ isOpen, onClose, contentType, item, onUpdated }: AdminEditModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title || item.name || '',
        description: item.description || item.bio || '',
        cover_url: item.cover_url || item.avatar_url || '',
        audio_url: item.audio_url || '',
        duration: item.duration || '',
        mood: item.mood || '',
        is_public: item.is_public ?? true,
        is_verified: item.is_verified ?? false,
        is_featured: item.is_featured ?? false,
      });
    }
  }, [item]);

  const handleSave = async () => {
    if (!item) return;

    setLoading(true);
    try {
      let updateData: any = {};
      
      switch (contentType) {
        case 'songs':
          updateData = {
            title: formData.title,
            audio_url: formData.audio_url,
            cover_url: formData.cover_url,
            duration: formData.duration ? parseInt(formData.duration) : null,
            mood: formData.mood,
            is_public: formData.is_public,
            is_featured: formData.is_featured,
          };
          break;
        case 'artists':
          updateData = {
            name: formData.title,
            bio: formData.description,
            avatar_url: formData.cover_url,
            is_verified: formData.is_verified,
            is_featured: formData.is_featured,
          };
          break;
        case 'albums':
          updateData = {
            title: formData.title,
            description: formData.description,
            cover_url: formData.cover_url,
            is_featured: formData.is_featured,
          };
          break;
        case 'playlists':
          updateData = {
            title: formData.title,
            description: formData.description,
            cover_url: formData.cover_url,
            is_public: formData.is_public,
          };
          break;
      }

      const tableName = contentType;
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `${contentType.slice(0, -1)} updated successfully`,
      });

      onUpdated();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {contentType.slice(0, -1)}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">
              {contentType === 'artists' ? 'Name' : 'Title'}
            </Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder={`Enter ${contentType === 'artists' ? 'name' : 'title'}`}
            />
          </div>

          {(contentType === 'artists' || contentType === 'albums' || contentType === 'playlists') && (
            <div>
              <Label htmlFor="description">
                {contentType === 'artists' ? 'Bio' : 'Description'}
              </Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={`Enter ${contentType === 'artists' ? 'bio' : 'description'}`}
              />
            </div>
          )}

          <div>
            <Label htmlFor="cover_url">
              {contentType === 'artists' ? 'Avatar URL' : 'Cover Image URL'}
            </Label>
            <Input
              id="cover_url"
              value={formData.cover_url || ''}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {contentType === 'songs' && (
            <>
              <div>
                <Label htmlFor="audio_url">Audio URL</Label>
                <Input
                  id="audio_url"
                  value={formData.audio_url || ''}
                  onChange={(e) => setFormData({ ...formData, audio_url: e.target.value })}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>
              <div>
                <Label htmlFor="duration">Duration (seconds)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="180"
                />
              </div>
              <div>
                <Label htmlFor="mood">Mood</Label>
                <Input
                  id="mood"
                  value={formData.mood || ''}
                  onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                  placeholder="Happy, Sad, Energetic..."
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            {(contentType === 'songs' || contentType === 'playlists') && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_public"
                  checked={formData.is_public || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_public: checked })}
                />
                <Label htmlFor="is_public">Public</Label>
              </div>
            )}

            {contentType === 'artists' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_verified"
                  checked={formData.is_verified || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_verified: checked })}
                />
                <Label htmlFor="is_verified">Verified</Label>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_featured"
                checked={formData.is_featured || false}
                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
              />
              <Label htmlFor="is_featured">Featured</Label>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminEditModal;