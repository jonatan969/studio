'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CHARACTERS, SUPER_ARTS } from '@/lib/game-data';
import type { Character, SuperArt } from '@/lib/types';
import Image from 'next/image';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { FileCode } from 'lucide-react';

export default function AdminPage() {
    const router = useRouter();
    const { user, isUserLoading } = useUser();

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
        return SUPER_ARTS.filter(sa => sa.characterId === characterId).sort((a,b) => a.roman.localeCompare(b.roman));
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <PageHeader />
            <main className="flex-1 container py-4 sm:py-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold">Panel de Administración</h1>
                </div>

                <Alert className="mb-6">
                    <FileCode className="h-4 w-4" />
                    <AlertTitle>Modo de Solo Lectura</AlertTitle>
                    <AlertDescription>
                        Los datos del juego ahora se gestionan directamente en el código para garantizar la estabilidad. Para editar personajes o Super Arts, por favor modifica el archivo: <code className="font-mono bg-muted px-1 py-0.5 rounded-sm">src/lib/game-data.ts</code>.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Visualización de Personajes y Super Arts</CardTitle>
                        <CardDescription>
                            Aquí puedes ver todos los personajes y habilidades actualmente configurados en el juego.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {CHARACTERS.length === 0 ? (
                             <div className="flex items-center justify-center p-8">
                                <p>No hay personajes definidos en <code className="font-mono">src/lib/game-data.ts</code>.</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full" defaultValue={CHARACTERS[0]?.id}>
                                {CHARACTERS.map(character => (
                                    <AccordionItem value={character.id} key={character.id}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-4 w-full">
                                                <Image src={character.image} alt={character.name} width={40} height={40} className="rounded-md object-cover" />
                                                <span className="font-bold">{character.name}</span>
                                                <span className="text-sm text-muted-foreground">({character.role})</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="font-bold">Nombre:</p>
                                                        <p>{character.name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold">Rol:</p>
                                                        <p>{character.role}</p>
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <p className="font-bold">URL de Imagen:</p>
                                                        <p className="text-xs break-all">{character.image}</p>
                                                    </div>
                                                     <div className="md:col-span-2">
                                                        <p className="font-bold">Pista de IA:</p>
                                                        <p>{character.hint}</p>
                                                    </div>
                                                </div>

                                                <h4 className="font-semibold pt-4 border-t">Super Arts:</h4>
                                                <div className="space-y-4">
                                                    {getCharacterSuperArts(character.id).map(art => (
                                                        <div key={art.id} className="p-3 border rounded-md space-y-2 bg-secondary/50">
                                                            <p className="font-mono font-bold text-accent">Super Art {art.roman}: {art.name}</p>
                                                            <p className="text-sm text-muted-foreground">{art.description}</p>
                                                        </div>
                                                    ))}
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
