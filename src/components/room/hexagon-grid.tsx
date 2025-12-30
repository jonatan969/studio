'use client';
import { Character } from "@/lib/game-data";
import { HexagonTile } from "./hexagon-tile";

interface HexagonGridProps {
    characters: Character[];
    bannedCharacters: string[];
    onPick: (character: Character) => void;
}

export function HexagonGrid({ characters, bannedCharacters, onPick }: HexagonGridProps) {
    const rows: Character[][] = [];
    // A more visually appealing symmetrical layout
    const layout = [3, 4, 3];
    let charIndex = 0;

    for (const count of layout) {
        const row: Character[] = [];
        for (let i = 0; i < count; i++) {
            if (charIndex < characters.length) {
                row.push(characters[charIndex]);
                charIndex++;
            }
        }
        rows.push(row);
    }
    // Add remaining characters to new rows
    while(charIndex < characters.length) {
        const row: Character[] = [];
        for (let i = 0; i < layout[1] && charIndex < characters.length; i++) {
             row.push(characters[charIndex]);
             charIndex++;
        }
        rows.push(row);
    }


    return (
        <div className="flex flex-col items-center gap-y-[-30px]">
            {rows.map((row, rowIndex) => (
                <div key={rowIndex} className="flex justify-center" style={{ marginLeft: rowIndex % 2 === 1 ? '65px' : '0' }}>
                    {row.map(char => (
                        <HexagonTile
                            key={char.id}
                            imageUrl={char.image}
                            alt={char.name}
                            characterName={char.name}
                            isPicked={bannedCharacters.includes(char.id)}
                            onClick={() => onPick(char)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}
