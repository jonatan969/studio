'use client';

import { generateDramaticReveal, GenerateDramaticRevealInput } from '@/ai/flows/generate-dramatic-reveal';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Character, SuperArt } from '@/lib/game-data';
import { Card, CardContent } from '../ui/card';
import { SuperArtIcon } from './super-art-icon';
import { DraftPick } from '@/lib/types';
import Image from 'next/image';

interface DramaticRevealProps {
  team1SuperArt: SuperArt;
  team2SuperArt: SuperArt;
  allPicks: (DraftPick & { superArt: SuperArt | null })[];
  onComplete: () => void;
}

function TypingEffect({ text, onFinished }: { text: string; onFinished: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (text.length === 0) {
        onFinished();
        return;
    };

    setDisplayedText('');
    let i = 0;
    const intervalId = setInterval(() => {
      setDisplayedText(text.substring(0, i + 1));
      i++;
      if (i > text.length) {
        clearInterval(intervalId);
        setTimeout(onFinished, 1000); // Wait a bit after typing finishes
      }
    }, 50);

    return () => clearInterval(intervalId);
  }, [text, onFinished]);

  return <p className="text-xl sm:text-2xl md:text-4xl font-headline text-center italic text-slate-300 max-w-4xl">{displayedText}</p>;
}

export function DramaticReveal({ team1SuperArt, team2SuperArt, allPicks, onComplete }: DramaticRevealProps) {
  const [revealText, setRevealText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const getReveal = async () => {
      try {
        const input: GenerateDramaticRevealInput = {
          team1SuperArt: team1SuperArt.name,
          team2SuperArt: team2SuperArt.name,
        };
        const result = await generateDramaticReveal(input);
        setRevealText(result.revealText);
      } catch (error) {
        console.error('Failed to generate dramatic reveal:', error);
        setRevealText('Los dados están echados. Los poderes han sido elegidos. ¡Que comience la batalla!');
      } finally {
        setIsLoading(false);
      }
    };

    getReveal();
  }, [team1SuperArt, team2SuperArt]);

  if (showAll) {
    return (
        <div className="absolute inset-0 z-50 w-full h-full bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in-50 duration-500 overflow-y-auto">
            <h2 className="text-3xl sm:text-5xl font-headline font-bold text-accent mb-4 sm:mb-8">Selecciones Finales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 w-full max-w-6xl">
                {['team1', 'team2'].map(teamId => (
                    <div key={teamId}>
                        <h3 className={`text-2xl sm:text-3xl font-headline mb-4 ${teamId === 'team1' ? 'text-orange-400' : 'text-purple-400'}`}>{teamId === 'team1' ? allPicks.find(p => p.team === 'team1')?.teamName || 'Equipo 1' : allPicks.find(p => p.team === 'team2')?.teamName || 'Equipo 2'}</h3>
                        <div className="space-y-3 sm:space-y-4">
                            {allPicks.filter(p => p.team === teamId).map((pick, index) => (
                                <Card key={index} className="bg-card/80 p-3 sm:p-4 rounded-lg flex justify-between items-center">
                                    <div className='flex items-center gap-3 sm:gap-4'>
                                        <div className='relative w-10 h-10 sm:w-12 sm:h-12 rounded-md overflow-hidden'>
                                            <Image src={pick.image} alt={pick.name} fill className='object-cover' />
                                        </div>
                                        <p className="font-bold text-base sm:text-lg">{pick.name}</p>
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
            <Button onClick={onComplete} className="mt-8 sm:mt-12">Finalizar</Button>
        </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8">
      {isLoading ? (
        <p className="text-2xl text-white">Forjando destinos...</p>
      ) : (
        <div className="text-center animate-in fade-in-50 duration-1000">
          <TypingEffect text={revealText} onFinished={() => setIsTyping(false)} />
          {!isTyping && (
             <Button onClick={() => setShowAll(true)} className="mt-8 animate-in fade-in delay-500 duration-500">
                Revelar Todo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
