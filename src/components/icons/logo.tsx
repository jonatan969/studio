import { cn } from '@/lib/utils';
import * as React from 'react';

export function VersusLogo({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-6 w-6', className)}
      {...props}
    >
      <path d="M3.5 4.5L12 2l8.5 2.5V12c0 4.5-3.5 8.5-8.5 8.5S3.5 16.5 3.5 12V4.5z" />
      <path d="M8 14l4-4 4 4" />
      <path d="M8 10l4 4 4-4" />
    </svg>
  );
}
