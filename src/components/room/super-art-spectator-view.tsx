'use client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Character, SuperArt } from "@/lib/game-data";
import { SuperArtIcon } from "./super-art-icon";

interface SuperArtSpectatorViewProps {
    allPicks: { team: 'Orange' | 'Purple'; character: Character; superArt: SuperArt }[];
}

export function SuperArtSpectatorView({ allPicks }: SuperArtSpectatorViewProps) {
    return (
        <Card className="w-full h-full flex flex-col items-center justify-center p-4">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Spectator View: Super Arts</CardTitle>
            </CardHeader>
            <CardContent className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-lg text-orange-400 mb-2">Team Orange</h3>
                    <div className="space-y-2">
                        {allPicks.filter(p => p.team === 'Orange').map(({ character, superArt }) => (
                            <div key={character.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                <span className="font-semibold">{character.name}</span>
                                <SuperArtIcon art={superArt} />
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-purple-400 mb-2">Team Purple</h3>
                     <div className="space-y-2">
                        {allPicks.filter(p => p.team === 'Purple').map(({ character, superArt }) => (
                            <div key={character.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                <span className="font-semibold">{character.name}</span>
                                <SuperArtIcon art={superArt} />
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
