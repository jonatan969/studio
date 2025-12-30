'use client';

import { Character } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { User } from 'lucide-react';

interface TeamDisplayProps {
  teamName: 'Orange' | 'Purple';
  picks: (Character | null)[];
  isPicking: boolean;
}

export function TeamDisplay({ teamName, picks, isPicking }: TeamDisplayProps) {
  const teamColor = teamName === 'Orange' ? 'border-orange-500' : 'border-purple-500';
  const teamTextColor = teamName === 'Orange' ? 'text-orange-500' : 'text-purple-500';

  return (
    <Card className={cn('flex flex-col h-full transition-all duration-300', isPicking ? teamColor : 'border-transparent', isPicking ? 'shadow-lg shadow-primary/20' : '')}>
      <CardHeader>
        <CardTitle className={cn('font-headline text-2xl', teamTextColor)}>Team {teamName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        {Array.from({ length: 6 }).map((_, index) => {
          const pick = picks[index];
          return (
            <div key={index} className={cn("flex items-center gap-4 p-2 rounded-md bg-secondary/50", pick ? 'h-20' : 'h-12')}>
              {pick ? (
                <>
                  <div className="relative h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                    <Image src={pick.image} alt={pick.name} fill className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold font-headline">{pick.name}</p>
                    <p className="text-sm text-muted-foreground">{pick.role}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted/50">
                     <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Player {index + 1}</p>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
