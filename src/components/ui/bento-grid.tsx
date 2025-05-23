
import React from 'react';
import { cn } from '@/lib/utils';

const BentoGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid w-full auto-rows-[22rem] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
BentoGrid.displayName = 'BentoGrid';

const BentoCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    name: string;
    description: string;
    href?: string;
    cta: string;
    background?: React.ReactNode;
    Icon: React.ElementType;
    onCtaClick?: () => void;
  }
>(({ className, name, description, href, cta, background, Icon, onCtaClick, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-xl',
        'bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300',
        'dark:bg-gray-800 dark:border-gray-700',
        className,
      )}
      {...props}
    >
      <div className="flex-1">{background}</div>
      <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 p-6 transition-all duration-300 group-hover:-translate-y-2">
        <Icon className="h-8 w-8 origin-left transform-gpu text-gray-600 transition-all duration-300 ease-in-out group-hover:scale-110" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 flex w-full translate-y-10 transform-gpu items-center justify-center p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100',
        )}
      >
        <button 
          className="pointer-events-auto rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 transition-colors"
          onClick={onCtaClick}
        >
          {cta}
        </button>
      </div>
      <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-gray-700/10" />
    </div>
  );
});
BentoCard.displayName = 'BentoCard';

export { BentoGrid, BentoCard };
