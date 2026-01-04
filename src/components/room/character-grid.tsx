'use client';

import { Character } from '@/lib/types';
import { ScrollArea } from '../ui/scroll-area';
import { CharacterSquare } from './character-square';
import { Button } from '../ui/button';
import { Ban } from 'lucide-react';

interface CharacterGridProps {
    characters: Character[];
    bannedCharacterIds: string[];
    preselectedCharacter: Character | null;
    onPreselect: (character: Character) => void;
    onConfirmPick: (character: Character) => void;
    canPick: boolean;
}

export function CharacterGrid({
    characters,
    bannedCharacterIds,
    preselectedCharacter,
    onPreselect,
    onConfirmPick,
    canPick
}: CharacterGridProps) {
    const handleConfirm = () => {
        if (preselectedCharacter) {
            onConfirmPick(preselectedCharacter);
        }
    };
    
    return (
        <div className="w-full h-full p-1 sm:p-2 border rounded-lg bg-card/50 flex flex-col">
            <ScrollArea className="flex-grow">
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2 p-1">
                    {(characters || []).map(char => (
                        <CharacterSquare
                            key={char.id}
                            character={char}
                            isPicked={bannedCharacterIds.includes(char.id)}
                            isPreselected={preselectedCharacter?.id === char.id}
                            onClick={() => onPreselect(char)}
                        />
                    ))}
                </div>
            </ScrollArea>
            <div className="p-2 flex-shrink-0">
                <Button
                    onClick={handleConfirm}
                    disabled={!preselectedCharacter || !canPick}
                    className="w-full font-bold"
                >
                    {canPick ? 'Confirmar Elección' : 'No es tu turno para elegir'}
                </Button>
            </div>
        </div>
    );
}
