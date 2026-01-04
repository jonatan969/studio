'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftPick, SuperArt, Character } from "@/lib/types";
import { SuperArtIcon } from "./super-art-icon";
import { SUPER_ARTS, CHARACTERS } from "@/lib/game-data";

type CombinedPick = DraftPick & Partial<Character> & { superArt: SuperArt | null };

interface SuperArtSpectatorViewProps {
    allPicks: CombinedPick[];
    team1Name: string;
    team2Name: string;
}

export function SuperArtSpectatorView({ allPicks, team1Name, team2Name }: SuperArtSpectatorViewProps) {

    const getTeamPicks = (teamId: 'team1' | 'team2'): CombinedPick[] => {
        return allPicks.filter(p => p.team === teamId).map(pick => {
            const character = CHARACTERS.find(c => c.id === pick.characterId);
            const superArt = pick.superArtId ? SUPER_ARTS.find(sa => sa.id === pick.superArtId) : null;
            return {
                ...pick,
                name: character?.name || 'Unknown',
                superArt: superArt || null,
            };
        });
    };

    const team1Picks = getTeamPicks('team1');
    const team2Picks = getTeamPicks('team2');

    return (
        <Card className="w-full h-full flex flex-col items-center justify-center p-4">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Selecciones de Super Art</CardTitle>
                <CardDescription>Los jugadores están eligiendo sus habilidades. Las selecciones se revelarán al final.</CardDescription>
            </CardHeader>
            <CardContent className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-lg text-orange-400 mb-2">{team1Name}</h3>
                    <div className="space-y-2">
                        {team1Picks.map((pick) => (
                            <div key={pick.id || pick.characterId} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                <span className="font-semibold">{pick.name}</span>
                                {pick.superArtId ? <span className="text-xs font-bold text-green-400">LISTO</span> : <span className="text-xs text-muted-foreground">Eligiendo...</span>}
                            </div>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-purple-400 mb-2">{team2Name}</h3>
                     <div className="space-y-2">
                        {team2Picks.map((pick) => (
                           <div key={pick.id || pick.characterId} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                               <span className="font-semibold">{pick.name}</span>
                               {pick.superArtId ? <span className="text-xs font-bold text-green-400">LISTO</span> : <span className="text-xs text-muted-foreground">Eligiendo...</span>}
                           </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}