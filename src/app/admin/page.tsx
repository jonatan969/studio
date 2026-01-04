'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { CHARACTERS, SUPER_ARTS } from '@/lib/game-data';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';

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

                 <Alert className="mb-8">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Gestión de Datos Estáticos</AlertTitle>
                    <AlertDescription>
                        La gestión de personajes y Super Arts ha sido movida directamente al código fuente en el archivo <code className="font-mono bg-muted px-1 py-0.5 rounded">src/lib/game-data.ts</code> para asegurar la estabilidad de la aplicación. Para editar los datos, por favor modifica ese archivo.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Personajes</CardTitle>
                        <CardDescription>Visualiza los personajes y Super Arts actualmente en el sistema.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {CHARACTERS.length === 0 ? (
                             <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p>No hay personajes definidos en <code className="font-mono bg-muted px-1 py-0.5 rounded">src/lib/game-data.ts</code>.</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full">
                                {CHARACTERS.map(character => (
                                    <AccordionItem value={character.id} key={character.id}>
                                        <AccordionTrigger>
                                            <div className="flex items-center gap-4">
                                                <Image src={character.image} alt={character.name} width={40} height={40} className="rounded-md object-cover" />
                                                <span className="font-bold">{character.name}</span>
                                                <span className="text-sm text-muted-foreground">({character.role})</span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div>
                                                <h4 className="font-semibold mb-2">Super Arts:</h4>
                                                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                                                    {getCharacterSuperArts(character.id).map(art => (
                                                        <li key={art.id}>{art.name}: {art.description}</li>
                                                    ))}
                                                </ul>
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
