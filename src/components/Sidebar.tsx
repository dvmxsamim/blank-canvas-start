import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import CreatePlaylistModal from '@/components/CreatePlaylistModal';
import { useState } from 'react';

const navigationItems = [
  { name: 'Home', icon: Home, path: '/home' },
  { name: 'Search', icon: Search, path: '/search' },
  { name: 'Library', icon: Library, path: '/library' },
  { name: 'Profile', icon: User, path: '/profile' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isCreatePlaylistOpen, setIsCreatePlaylistOpen] = useState(false);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card/50 backdrop-blur-md border-r border-border">
      <div className="flex flex-col h-full p-4">
        {/* Main Navigation */}
        <nav className="space-y-2 mb-8">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive && "text-primary"
                )} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="w-1 h-1 bg-primary rounded-full ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="space-y-3 mb-8">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Quick Actions
          </h3>
          <Button 
            variant="ghost" 
            className="w-full justify-start" 
            size="sm"
            onClick={() => setIsCreatePlaylistOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Playlist
          </Button>
        </div>

        {/* Admin Link */}
        <div className="mt-auto pt-4">
          {user?.profile?.is_admin && (
            <Link
              to="/admin"
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
              <span>Admin Dashboard</span>
            </Link>
          )}
        </div>
      </div>
      
      <CreatePlaylistModal 
        isOpen={isCreatePlaylistOpen}
        onClose={() => setIsCreatePlaylistOpen(false)}
      />
    </aside>
  );
};

export default Sidebar;