'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { User, ShieldCheck } from 'lucide-react';
import { RoomPlayer } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface PickWithCharacterData {
    characterId: string;
    pickedBy: string;
    nickname: string;
    team: 'team1' | 'team2';
    pickOrder: number;
    turn: number;
    superArtId?: string | undefined;
    name: string;
    image: string;
}

interface TeamDisplayProps {
  teamName: string;
  teamId: 'team1' | 'team2';
  teamLogo?: string | null;
  players: RoomPlayer[];
  picks: PickWithCharacterData[];
  isPicking: boolean;
  maxPlayers: number;
}

export function TeamDisplay({ teamName, teamId, teamLogo, players, picks, isPicking, maxPlayers }: TeamDisplayProps) {
  const teamColor = teamId === 'team1' ? 'border-orange-500' : 'border-purple-500';
  const teamTextColor = teamId === 'team1' ? 'text-orange-400' : 'text-purple-400';

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  return (
    <Card className={cn('flex flex-col h-full transition-all duration-300 border-2 bg-card/50', isPicking ? teamColor : 'border-transparent')}>
      <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4">
        <CardTitle className={cn('font-headline text-lg sm:text-xl truncate', teamTextColor)}>{teamName}</CardTitle>
        {teamLogo && <Image src={teamLogo} alt={`${teamName} logo`} width={32} height={32} className="rounded-md object-contain" />}
      </CardHeader>
      <CardContent className="flex-grow space-y-2 p-2 sm:p-3">
        {Array.from({ length: maxPlayers }).map((_, index) => {
          const player = players[index];
          const pick = player ? picks.find(p => p.pickedBy === player.uid) : null;
          
          return (
            <div key={index} className={cn("flex items-center gap-2 sm:gap-3 p-2 rounded-md bg-secondary/50 transition-all h-14 sm:h-16")}>
              {player ? (
                <>
                 <Avatar className="h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 border-2 border-transparent">
                    <AvatarImage src={player.photoURL || undefined} />
                    <AvatarFallback>{getInitials(player.nickname || '')}</AvatarFallback>
                  </Avatar>
                  <div className="relative h-full aspect-square flex-shrink-0 rounded-md overflow-hidden bg-muted animate-in fade-in duration-500">
                    {pick ? (
                      <Image src={pick.image} alt={pick.name} fill className="object-cover img-pixelated" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted/30">
                        <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-grow overflow-hidden">
                    <p className="font-bold font-headline truncate text-sm sm:text-base">{pick ? pick.name : player.nickname}</p>
                    {pick && <p className="text-xs text-muted-foreground truncate">{player.nickname}</p>}
                    {!pick && <p className="text-xs text-muted-foreground">Esperando para elegir...</p>}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-muted/30 flex-shrink-0">
                     <User className="h-5 w-5 text-muted-foreground/50" />
                  </div>
                  <p className="text-muted-foreground text-sm">Espacio Vacío</p>
                </>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
