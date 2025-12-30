'use client';
import { Character } from "@/lib/game-data";
import { CharacterSquare } from "./character-square";

interface HexagonGridProps {
    characters: Character[];
    bannedCharacters: string[];
    onPick: (character: Character) => void;
}

export function HexagonGrid({ characters, bannedCharacters, onPick }: HexagonGridProps) {
    return (
        <div className="grid grid-cols-4 gap-4 p-4">
            {characters.map(char => (
                <CharacterSquare
                    key={char.id}
                    character={char}
                    isPicked={bannedCharacters.includes(char.id)}
                    onClick={() => onPick(char)}
                />
            ))}
        </div>
    );
}
