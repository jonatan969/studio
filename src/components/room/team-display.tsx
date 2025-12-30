'use client';

import { Character } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { User } from 'lucide-react';
import { RoomPlayer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


interface TeamDisplayProps {
  teamName: string;
  teamId: 'team1' | 'team2';
  players: RoomPlayer[];
  picks: (Character & { pickedBy: string })[];
  isPicking: boolean;
  maxPlayers: number;
}

export function TeamDisplay({ teamName, teamId, players, picks, isPicking, maxPlayers }: TeamDisplayProps) {
  const teamColor = teamId === 'team1' ? 'border-orange-500' : 'border-purple-500';
  const teamTextColor = teamId === 'team1' ? 'text-orange-500' : 'text-purple-500';

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '';
  }

  return (
    <Card className={cn('flex flex-col h-full transition-all duration-300 border-2', isPicking ? teamColor : 'border-transparent', isPicking ? 'shadow-lg shadow-primary/20' : '')}>
      <CardHeader>
        <CardTitle className={cn('font-headline text-2xl', teamTextColor)}>{teamName}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        {Array.from({ length: maxPlayers }).map((_, index) => {
          const player = players[index];
          const pick = player ? picks.find(p => p.pickedBy === player.uid) : null;
          
          return (
            <div key={index} className={cn("flex items-center gap-4 p-2 rounded-md bg-secondary/50", pick ? 'h-20' : 'h-16')}>
              {player ? (
                <>
                 <Avatar className="h-12 w-12 flex-shrink-0">
                    <AvatarImage src={player.photoURL || undefined} />
                    <AvatarFallback>{getInitials(player.nickname || '')}</AvatarFallback>
                  </Avatar>
                  <div className="relative h-full w-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                    {pick ? (
                      <Image src={pick.image} alt={pick.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold font-headline">{pick ? pick.name : player.nickname}</p>
                    {pick && <p className="text-sm text-muted-foreground">{player.nickname}</p>}
                    {!pick && <p className="text-sm text-muted-foreground">Waiting to pick...</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                     <User className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">Empty Slot</p>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
