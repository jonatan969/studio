'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DraftPick, SuperArt } from "@/lib/types";
import { SuperArtIcon } from "./super-art-icon";

interface SuperArtSpectatorViewProps {
    allPicks: (DraftPick & { superArt: SuperArt | null })[];
    team1Name: string;
    team2Name: string;
}

export function SuperArtSpectatorView({ allPicks, team1Name, team2Name }: SuperArtSpectatorViewProps) {
    return (
        <Card className="w-full h-full flex flex-col items-center justify-center p-4">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Selecciones de Super Art</CardTitle>
                <CardDescription>Los jugadores están eligiendo sus Super Arts.</CardDescription>
            </CardHeader>
            <CardContent className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-lg text-orange-400 mb-2">{team1Name}</h3>
                    <div className="space-y-2">
                        {allPicks.filter(p => p.team === 'team1').map((pick) => {
                            return (
                                <div key={pick.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                    <span className="font-semibold">{pick.name}</span>
                                    {pick.superArt ? <SuperArtIcon art={pick.superArt} /> : <span className="text-xs text-muted-foreground">Eligiendo...</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-lg text-purple-400 mb-2">{team2Name}</h3>
                     <div className="space-y-2">
                        {allPicks.filter(p => p.team === 'team2').map((pick) => {
                           return (
                               <div key={pick.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                                   <span className="font-semibold">{pick.name}</span>
                                   {pick.superArt ? <SuperArtIcon art={pick.superArt} /> : <span className="text-xs text-muted-foreground">Eligiendo...</span>}
                               </div>
                           );
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
