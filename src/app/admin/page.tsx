
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Loader2, PlusCircle, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Character, SuperArt } from '@/lib/types';
import { CHARACTERS, SUPER_ARTS } from '@/lib/game-data';
import Image from 'next/image';

export default function AdminPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();

    const [characters] = useState<Character[]>(CHARACTERS);
    const [superArts] = useState<SuperArt[]>(SUPER_ARTS);

    useEffect(() => {
        if (!isUserLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    if (isUserLoading || !user || user.role !== 'admin') {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const getCharacterSuperArts = (characterId: string) => {
        if (!superArts) return [];
        return superArts.filter(sa => sa.characterId === characterId).sort((a,b) => a.roman.localeCompare(b.roman));
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <PageHeader />
            <main className="flex-1 container py-4 sm:py-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold">Panel de Administración</h1>
                    <p className="text-sm text-muted-foreground">La gestión de datos ahora está en el código.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Personajes</CardTitle>
                        <CardDescription>
                            Los personajes y Super Arts ahora se gestionan directamente en el archivo <code className="font-mono text-sm bg-muted p-1 rounded-md">src/lib/game-data.ts</code>.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {characters.length === 0 ? (
                             <div className="flex items-center justify-center p-8">
                                <p>No hay personajes definidos en el archivo de datos del juego.</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {characters?.map(character => (
                                    <AccordionItem value={character.id} key={character.id}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-4">
                                                <Image src={character.image} alt={character.name} width={40} height={40} className="rounded-md object-cover" />
                                                <span className="font-bold">{character.name}</span>
                                                <span className="text-sm text-muted-foreground">({character.role})</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold mb-2">Super Arts:</h4>
                                                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                        {getCharacterSuperArts(character.id).map(art => (
                                                            <li key={art.id}>{art.name}: {art.description}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
