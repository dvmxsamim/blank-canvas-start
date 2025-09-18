import { useState } from 'react';
import { X, Copy, Share, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'song' | 'album' | 'artist' | 'playlist';
  id: string;
}

const ShareModal = ({ isOpen, onClose, title, type, id }: ShareModalProps) => {
  const { toast } = useToast();
  const shareUrl = `${window.location.origin}/${type}/${id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "Share link has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const text = `Check out this ${type}: ${title}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out this ${type}: ${title}`;
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}`;
        break;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Share {type}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Share "{title}"</p>
            <div className="flex items-center gap-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyLink} size="sm">
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">Share via</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handleWhatsAppShare}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('twitter')}
                className="flex items-center gap-2"
              >
                𝕏 Twitter
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('facebook')}
                className="flex items-center gap-2"
              >
                📘 Facebook
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialShare('telegram')}
                className="flex items-center gap-2"
              >
                ✈️ Telegram
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;