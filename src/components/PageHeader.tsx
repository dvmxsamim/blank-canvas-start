import { ReactNode } from 'react';

interface PageHeaderProps {
  children: ReactNode;
  className?: string;
}

const PageHeader = ({ children, className = "" }: PageHeaderProps) => {
  return (
    <div className={`w-full bg-background/95 backdrop-blur-sm border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        {children}
      </div>
    </div>
  );
};

export default PageHeader;