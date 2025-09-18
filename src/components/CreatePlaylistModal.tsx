import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface CreatePlaylistFormData {
  name: string;
  description: string;
  isPublic: boolean;
}

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songToAdd?: {
    id: string;
    title: string;
    artist: string;
  };
}

const CreatePlaylistModal = ({ isOpen, onClose, songToAdd }: CreatePlaylistModalProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors }
  } = useForm<CreatePlaylistFormData>({
    defaultValues: {
      name: '',
      description: '',
      isPublic: false
    }
  });

  const isPublic = watch('isPublic');

  const onSubmit = async (data: CreatePlaylistFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Create the playlist
      const { data: playlist, error: playlistError } = await supabase
        .from('playlists')
        .insert({
          title: data.name,
          description: data.description,
          is_public: data.isPublic,
          user_id: user.id,
          slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        })
        .select()
        .single();

      if (playlistError) throw playlistError;

      // If a song was provided, add it to the playlist
      if (songToAdd && playlist) {
        const { error: songError } = await supabase
          .from('playlist_songs')
          .insert({
            playlist_id: playlist.id,
            song_id: songToAdd.id,
            position: 1,
            added_by: user.id
          });

        if (songError) throw songError;
      }
      
      toast({
        title: "Playlist created!",
        description: songToAdd 
          ? `"${data.name}" has been created with "${songToAdd.title}" added.`
          : `"${data.name}" has been created successfully.`,
      });
      
      reset();
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast({
        title: "Error",
        description: "Failed to create playlist. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Create New Playlist
          </DialogTitle>
          <DialogDescription>
            Create a new playlist to organize your favorite songs.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {/* Playlist Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Playlist Name *</Label>
              <Input
                id="name"
                placeholder="My Awesome Playlist"
                {...register('name', { 
                  required: 'Playlist name is required',
                  minLength: {
                    value: 1,
                    message: 'Playlist name must be at least 1 character'
                  }
                })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Tell others what this playlist is about..."
                rows={3}
                maxLength={150}
                {...register('description', {
                  maxLength: {
                    value: 150,
                    message: 'Description must be 150 characters or less'
                  }
                })}
                className={errors.description ? 'border-destructive' : ''}
              />
              <div className="flex justify-between items-center">
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {watch('description')?.length || 0}/150
                </p>
              </div>
            </div>

            {/* Privacy Setting */}
            <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/20">
              <div className="space-y-1">
                <Label htmlFor="privacy" className="font-medium">
                  {isPublic ? 'Public Playlist' : 'Private Playlist'}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {isPublic 
                    ? 'Anyone can see and follow this playlist'
                    : 'Only you can see this playlist'
                  }
                </p>
              </div>
              <Switch
                id="privacy"
                checked={isPublic}
                onCheckedChange={(checked) => setValue('isPublic', checked)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-primary hover:opacity-90"
            >
              {isLoading ? 'Creating...' : 'Create Playlist'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePlaylistModal;