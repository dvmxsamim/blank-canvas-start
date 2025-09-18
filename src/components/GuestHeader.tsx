import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GuestHeader = () => {
  return (
    <header className="w-full bg-background border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-glow group-hover:shadow-primary/50 transition-all duration-300">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              XoMusic
            </span>
          </Link>
          
          {/* Login Button */}
          <Link to="/login">
            <Button className="bg-gradient-primary hover:opacity-90">
              Login
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default GuestHeader;