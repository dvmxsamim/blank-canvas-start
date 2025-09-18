import { Button } from '@/components/ui/button';

interface SectionContainerProps {
  title: string;
  viewAllLink?: string;
  onViewAll?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: 'grid' | 'list';
}

const SectionContainer = ({ 
  title, 
  viewAllLink, 
  onViewAll, 
  children, 
  className = "",
  variant = 'grid'
}: SectionContainerProps) => {
  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else if (viewAllLink) {
      // This would typically be handled by navigation
      console.log(`Navigate to: ${viewAllLink}`);
    }
  };

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        {(viewAllLink || onViewAll) && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-muted-foreground hover:text-foreground"
            onClick={handleViewAll}
          >
            View All
          </Button>
        )}
      </div>
      <div className={
        variant === 'list' 
          ? "space-y-2" 
          : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      }>
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;
export type { SectionContainerProps };