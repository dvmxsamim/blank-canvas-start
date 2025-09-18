import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useLikes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchLikedItems();
    }
  }, [user]);

  const fetchLikedItems = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('likes')
        .select('likeable_id')
        .eq('user_id', user.id);

      if (error) throw error;

      setLikedItems(new Set(data?.map(item => item.likeable_id) || []));
    } catch (error) {
      console.error('Error fetching liked items:', error);
    }
  };

  const toggleLike = async (itemId: string, itemType: 'song' | 'album' | 'artist' | 'playlist') => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to like items",
        variant: "destructive",
      });
      return;
    }

    const isLiked = likedItems.has(itemId);

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('likeable_id', itemId)
          .eq('likeable_type', itemType);

        if (error) throw error;

        setLikedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });

        toast({
          title: "Removed from liked",
          description: `${itemType} removed from your liked items`,
        });
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            likeable_id: itemId,
            likeable_type: itemType,
          });

        if (error) throw error;

        setLikedItems(prev => new Set(prev).add(itemId));

        toast({
          title: "Added to liked",
          description: `${itemType} added to your liked items`,
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const isLiked = (itemId: string) => likedItems.has(itemId);

  return { toggleLike, isLiked, likedItems };
};