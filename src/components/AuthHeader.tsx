import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from '@/components/ThemeToggle';

interface AuthHeaderProps {
  showLoginButton?: boolean;
}

const AuthHeader = ({ showLoginButton = true }: AuthHeaderProps) => {
  return (
    <header className="w-full bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-primary/50 transition-all duration-300">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              XoxPlay
            </span>
          </Link>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {showLoginButton && (
              <Button asChild variant="default" className="bg-gradient-primary hover:opacity-90">
                <Link to="/login">Login</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AuthHeader;