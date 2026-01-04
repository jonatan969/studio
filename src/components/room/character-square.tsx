'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Character } from '@/lib/types';
import { CheckCircle } from 'lucide-react';

interface CharacterSquareProps {
  character: Character;
  isPicked: boolean;
  isPreselected: boolean;
  onClick: () => void;
}

export function CharacterSquare({ character, isPicked, isPreselected, onClick }: CharacterSquareProps) {
  return (
    <div
      className={cn(
        'relative aspect-square flex items-center justify-center group transition-all duration-200 ease-in-out rounded-md overflow-hidden',
        isPicked ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      onClick={!isPicked ? onClick : undefined}
    >
        <Image src={character.image} alt={character.name} fill className="object-cover" />
        <div className={cn(
          'absolute inset-0 bg-black/50 transition-all duration-300',
          isPicked ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'
        )} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           {!isPicked && <p className="text-white font-bold text-lg drop-shadow-lg text-center px-1">{character.name}</p>}
        </div>
       <div className={cn(
        'absolute inset-0 transition-all duration-300 border-4 border-transparent',
         isPicked ? 'bg-black/70 border-destructive' : 'group-hover:bg-primary/30 group-hover:border-primary',
         isPreselected && !isPicked && 'border-accent bg-accent/30'
      )}>
      </div>
      {isPreselected && !isPicked && (
        <div className="absolute top-1 right-1 bg-accent rounded-full text-accent-foreground p-0.5">
            <CheckCircle className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
