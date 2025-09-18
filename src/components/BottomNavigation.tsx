import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Library, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationItems = [
  { name: 'Home', icon: Home, path: '/home' },
  { name: 'Search', icon: Search, path: '/search' },
  { name: 'Library', icon: Library, path: '/library' },
  { name: 'Profile', icon: User, path: '/profile' },
];

const BottomNavigation = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-40">
      <div className="flex items-center justify-around h-16 px-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 px-1 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className={cn(
                "relative p-1 rounded-lg transition-all duration-200",
                isActive && "bg-primary/10"
              )}>
                <Icon className="w-5 h-5" />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
              <span className="mt-1 font-medium truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;