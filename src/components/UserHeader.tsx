import { Link } from 'react-router-dom';
import { Music, Search, Bell, Settings, Music2, Heart, TrendingUp, Clock, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import ThemeToggle from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserHeaderProps {
  showSearch?: boolean;
  title?: string;
  subtitle?: string;
  showGreeting?: boolean;
  hideNavigation?: boolean;
}

const UserHeader = ({ showSearch = false, title, subtitle, showGreeting = false, hideNavigation = false }: UserHeaderProps) => {
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="w-full bg-background">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {isMobile ? (
          // Mobile Layout
          <div className="space-y-6">
            {/* Top row - Logo and avatar */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col space-y-1">
                <Link to="/home" className="flex items-center space-x-2 group">
                  <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-primary/50 transition-all duration-300">
                    <Music className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    XoMusic
                  </span>
                </Link>
                {showGreeting && user && (
                  <p className="text-xs font-medium text-foreground ml-10">
                    {getGreeting()}, {user.profile?.full_name || user.email?.split('@')[0]}
                  </p>
                )}
              </div>
              
              <div className="flex items-center">
                {user && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile?.avatar_url || undefined} alt={user.profile?.full_name || user.email} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(user.profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
                      <div className="px-2 py-1.5 text-sm">
                        <div className="font-medium">{user.profile?.full_name || user.email?.split('@')[0]}</div>
                        <div className="text-muted-foreground">{user.email}</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="w-full">Settings</Link>
                      </DropdownMenuItem>
                      {user?.profile?.is_admin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Navigation Cards */}
            {!hideNavigation && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/liked">
                    <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-pink-500/30 hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="p-4 flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-pink-400" />
                        <span className="text-sm font-medium text-foreground">Liked</span>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/search?filter=featured">
                    <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30 hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="p-4 flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5 text-purple-400" />
                        <span className="text-sm font-medium text-foreground">Featured</span>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link to="/search?filter=recent">
                    <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30 hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="p-4 flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-green-400" />
                        <span className="text-sm font-medium text-foreground">Recent</span>
                      </CardContent>
                    </Card>
                  </Link>
                  <Link to="/community">
                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30 hover:scale-105 transition-transform cursor-pointer">
                      <CardContent className="p-4 flex items-center space-x-3">
                        <Search className="h-5 w-5 text-blue-400" />
                        <span className="text-sm font-medium text-foreground">Browse</span>
                      </CardContent>
                    </Card>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Desktop Layout
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              {/* Left: Logo with XoMusic branding and greeting */}
              <div className="flex flex-col space-y-1">
                <Link to="/home" className="flex items-center space-x-2 group">
                  <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:shadow-primary/50 transition-all duration-300">
                    <Music className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    XoMusic
                  </span>
                </Link>
                {showGreeting && user && (
                  <p className="text-sm font-medium text-foreground ml-12">
                    {getGreeting()}, {user.profile?.full_name || user.email?.split('@')[0]}
                  </p>
                )}
              </div>
              
              {/* Right: User avatar */}
              <div className="flex items-center">
                {user && (
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.profile?.avatar_url || undefined} alt={user.profile?.full_name || user.email} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {(user.profile?.full_name || user.email)?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover border border-border shadow-lg z-50">
                      <div className="px-2 py-1.5 text-sm">
                        <div className="font-medium">{user.profile?.full_name || user.email?.split('@')[0]}</div>
                        <div className="text-muted-foreground">{user.email}</div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/profile" className="w-full">Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/settings" className="w-full">Settings</Link>
                      </DropdownMenuItem>
                      {user?.profile?.is_admin && (
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-destructive">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Navigation Tabs - Horizontal Layout */}
            {!hideNavigation && (
              <div className="flex justify-center">
                <div className="flex items-center space-x-4">
                  <Link to="/community">
                    <Button 
                      variant="secondary" 
                      className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400 hover:from-blue-500/30 hover:to-blue-600/30 rounded-full px-6 py-2 transition-all duration-300 animate-fade-in"
                    >
                      <Music2 className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </Link>
                  <Link to="/liked">
                    <Button 
                      variant="secondary" 
                      className="bg-gradient-to-r from-pink-500/20 to-pink-600/20 border-pink-500/30 text-pink-400 hover:from-pink-500/30 hover:to-pink-600/30 rounded-full px-6 py-2 transition-all duration-300 animate-fade-in"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      Liked
                    </Button>
                  </Link>
                  <Link to="/search?filter=featured">
                    <Button 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-400 hover:from-purple-500/30 hover:to-purple-600/30 rounded-full px-6 py-2 transition-all duration-300 animate-fade-in"
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Featured
                    </Button>
                  </Link>
                  <Link to="/search?filter=recent">
                    <Button 
                      variant="secondary" 
                      className="bg-gradient-to-r from-green-500/20 to-green-600/20 border-green-500/30 text-green-400 hover:from-green-500/30 hover:to-green-600/30 rounded-full px-6 py-2 transition-all duration-300 animate-fade-in"
                    >
                      <Clock className="h-4 w-4 mr-2" />
                      Recent
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
        
        {(title || subtitle) && (
          <div className="space-y-2">
            {title && (
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default UserHeader;