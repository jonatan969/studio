'use client';

import { generateDramaticReveal, GenerateDramaticRevealInput } from '@/ai/flows/generate-dramatic-reveal';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Character, SuperArt } from '@/lib/game-data';

interface DramaticRevealProps {
  team1SuperArt: SuperArt;
  team2SuperArt: SuperArt;
  allPicks: { team: 'Orange' | 'Purple'; character: Character; superArt: SuperArt }[];
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

  return <p className="text-2xl md:text-4xl font-headline text-center italic text-slate-300 max-w-4xl">{displayedText}</p>;
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
        setRevealText('The die is cast. The powers are chosen. Let the battle commence!');
      } finally {
        setIsLoading(false);
      }
    };

    getReveal();
  }, [team1SuperArt, team2SuperArt]);

  if (showAll) {
    return (
        <div className="w-full h-full bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in-50 duration-500">
            <h2 className="text-5xl font-headline font-bold text-accent mb-8">Final Selections</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                {['Orange', 'Purple'].map(teamName => (
                    <div key={teamName}>
                        <h3 className={`text-3xl font-headline mb-4 ${teamName === 'Orange' ? 'text-orange-400' : 'text-purple-400'}`}>Team {teamName}</h3>
                        <div className="space-y-4">
                            {allPicks.filter(p => p.team === teamName).map(({character, superArt}, index) => (
                                <div key={index} className="bg-card p-4 rounded-lg flex justify-between items-center">
                                    <p className="font-bold text-lg">{character.name}</p>
                                    <p className="text-accent font-semibold">{superArt.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <Button onClick={onComplete} className="mt-12">Return to Dashboard</Button>
        </div>
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-8">
      {isLoading ? (
        <p className="text-2xl text-white">Forging destinies...</p>
      ) : (
        <div className="text-center animate-in fade-in-50 duration-1000">
          <TypingEffect text={revealText} onFinished={() => setIsTyping(false)} />
          {!isTyping && (
             <Button onClick={() => setShowAll(true)} className="mt-8 animate-in fade-in delay-500 duration-500">
                Reveal All
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
