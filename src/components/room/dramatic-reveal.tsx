
'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { SuperArtIcon } from './super-art-icon';
import { DraftPick, SuperArt } from '@/lib/types';
import { ImgurImage } from '../imgur-image';

interface DramaticRevealProps {
  team1Name: string;
  team2Name: string;
  allPicks: (DraftPick & { superArt: SuperArt | null })[];
  onComplete: () => void;
}

export function DramaticReveal({ team1Name, team2Name, allPicks, onComplete }: DramaticRevealProps) {
  const [showAll, setShowAll] = useState(false);

  if (showAll) {
    return (
        <div className="absolute inset-0 z-50 w-full h-full bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in-50 duration-500 overflow-y-auto">
            <h2 className="text-3xl sm:text-5xl font-headline font-bold text-accent mb-4 sm:mb-8">Selecciones Finales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full max-w-6xl">
                {['team1', 'team2'].map(teamId => (
                    <div key={teamId}>
                        <h3 className={`text-2xl sm:text-3xl font-headline mb-4 ${teamId === 'team1' ? 'text-orange-400' : 'text-purple-400'}`}>{teamId === 'team1' ? team1Name : team2Name}</h3>
                        <div className="space-y-3 sm:space-y-4">
                            {allPicks.filter(p => p.team === teamId).map((pick, index) => (
                                <Card key={index} className="bg-card/80 p-3 sm:p-4 rounded-lg flex justify-between items-center">
                                    <div className='flex items-center gap-3 sm:gap-4'>
                                        <div className='relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden flex-shrink-0'>
                                            <ImgurImage src={pick.image} alt={pick.name} fill className='object-cover img-pixelated' />
                                        </div>
                                        <div>
                                            <p className="font-bold text-base sm:text-lg">{pick.name}</p>
                                            <p className="text-xs text-muted-foreground">{pick.nickname}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {pick.superArt && (
                                            <>
                                                <p className="text-accent font-semibold hidden sm:block">{pick.superArt.name}</p>
                                                <SuperArtIcon art={pick.superArt} />
                                            </>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={onComplete} className="mt-8 sm:mt-12">Finalizar y Volver al Lobby</Button>
        </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="text-center animate-in fade-in-50 duration-1000">
          <p className="text-xl sm:text-2xl md:text-3xl font-headline text-center italic text-slate-300 max-w-4xl">Las elecciones han sido tomadas. Los poderes han sido elegidos. ¡Que comience la batalla!</p>
          <Button onClick={() => setShowAll(true)} className="mt-8 animate-in fade-in delay-500 duration-500">
              Revelar Todo
          </Button>
        </div>
    </div>
  );
}
