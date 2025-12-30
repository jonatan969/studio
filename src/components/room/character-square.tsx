'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { Character } from '@/lib/game-data';

interface CharacterSquareProps {
  character: Character;
  isPicked: boolean;
  onClick: () => void;
}

export function CharacterSquare({ character, isPicked, onClick }: CharacterSquareProps) {
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
           {!isPicked && <p className="text-white font-bold text-lg drop-shadow-lg">{character.name}</p>}
        </div>
       <div className={cn(
        'absolute inset-0 transition-all duration-300 border-2 border-transparent',
         isPicked ? 'bg-black/70 border-destructive' : 'group-hover:bg-primary/30 group-hover:border-primary',
      )}>
      </div>
    </div>
  );
}
