import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import BottomNavigation from '@/components/BottomNavigation';
import MiniPlayer from '@/components/MiniPlayer';
import FullScreenPlayer from '@/components/FullScreenPlayer';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && <Sidebar />}
      <main className={isMobile ? "pb-32" : "pl-64 pb-32"}>
        {children}
      </main>
      {isMobile && <BottomNavigation />}
      <MiniPlayer onOpenFullScreen={() => setIsFullScreenPlayerOpen(true)} />
      {isMobile && (
        <FullScreenPlayer 
          isOpen={isFullScreenPlayerOpen} 
          onClose={() => setIsFullScreenPlayerOpen(false)} 
        />
      )}
    </div>
  );
};

export default Layout;