'use client';

import { Character } from '@/lib/game-data';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { User, ShieldCheck } from 'lucide-react';
import { RoomPlayer, DraftPick, Room } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


interface TeamDisplayProps {
  teamName: string;
  teamId: 'team1' | 'team2';
  teamLogo?: string | null;
  players: RoomPlayer[];
  picks: DraftPick[];
  isPicking: boolean;
  maxPlayers: number;
}

export function TeamDisplay({ teamName, teamId, teamLogo, players, picks, isPicking, maxPlayers }: TeamDisplayProps) {
  const teamColor = teamId === 'team1' ? 'border-orange-500' : 'border-purple-500';
  const teamTextColor = teamId === 'team1' ? 'text-orange-500' : 'text-purple-500';

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '';
  }

  return (
    <Card className={cn('flex flex-col h-full transition-all duration-300 border-2 bg-card/50', isPicking ? teamColor : 'border-transparent', isPicking ? 'shadow-lg shadow-primary/20' : '')}>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-6">
        <CardTitle className={cn('font-headline text-lg sm:text-2xl', teamTextColor)}>{teamName}</CardTitle>
        {teamLogo && <Image src={teamLogo} alt={`${teamName} logo`} width={40} height={40} className="rounded-md" />}
      </CardHeader>
      <CardContent className="flex-grow space-y-2 p-2 sm:p-6">
        {Array.from({ length: maxPlayers }).map((_, index) => {
          const player = players[index];
          const pick = player ? picks.find(p => p.pickedBy === player.uid) : null;
          
          return (
            <div key={index} className={cn("flex items-center gap-2 sm:gap-4 p-2 rounded-md bg-secondary/50 transition-all", pick ? 'h-16 sm:h-20' : 'h-14 sm:h-16')}>
              {player ? (
                <>
                 <Avatar className="h-10 w-10 sm:h-12 sm:w-12 flex-shrink-0 border-2 border-transparent group-hover:border-primary">
                    <AvatarImage src={player.photoURL || undefined} />
                    <AvatarFallback>{getInitials(player.nickname || '')}</AvatarFallback>
                  </Avatar>
                  <div className="relative h-full aspect-square flex-shrink-0 rounded-md overflow-hidden bg-muted animate-in fade-in duration-500">
                    {pick ? (
                      <Image src={pick.image} alt={pick.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/30">
                        <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-bold font-headline truncate">{pick ? pick.name : player.nickname}</p>
                    {pick && <p className="text-sm text-muted-foreground truncate">{player.nickname}</p>}
                    {!pick && <p className="text-sm text-muted-foreground">Esperando para elegir...</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-muted/30">
                     <User className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base">Espacio Vacío</p>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
