'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface HexagonTileProps {
  imageUrl: string;
  alt: string;
  isPicked: boolean;
  onClick: () => void;
  characterName: string;
}

export function HexagonTile({ imageUrl, alt, isPicked, onClick, characterName }: HexagonTileProps) {
  return (
    <div
      className={cn(
        'relative w-[120px] h-[138px] flex items-center justify-center group transition-all duration-200 ease-in-out',
        isPicked ? 'cursor-not-allowed' : 'cursor-pointer'
      )}
      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
      onClick={!isPicked ? onClick : undefined}
    >
      <div className="relative w-[114px] h-[132px]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
        <Image src={imageUrl} alt={alt} fill className="object-cover" />
        <div className={cn(
          'absolute inset-0 bg-black/50 transition-all duration-300',
          isPicked ? 'opacity-100' : 'opacity-0 group-hover:opacity-20'
        )} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           {!isPicked && <p className="text-white font-bold text-lg drop-shadow-lg">{characterName}</p>}
        </div>
      </div>
       <div className={cn(
        'absolute inset-0 transition-all duration-300',
         isPicked ? 'bg-black/70' : 'bg-transparent group-hover:bg-primary/30',
      )}>
      </div>
    </div>
  );
}
