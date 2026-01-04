'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useDoc, updateDocumentNonBlocking, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Loader2, PlusCircle, Trash2, Edit, Save, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Character, SuperArt, GameData } from '@/lib/types';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from '@/hooks/use-toast';

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const gameDataRef = useMemoFirebase(() => firestore ? doc(firestore, 'game_data', 'static') : null, [firestore]);
    const { data: gameData, isLoading: isGameDataLoading, error } = useDoc<GameData>(gameDataRef);

    const [characters, setCharacters] = useState<Character[]>([]);
    const [superArts, setSuperArts] = useState<SuperArt[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    
    useEffect(() => {
        if (!isUserLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    useEffect(() => {
        if (gameData) {
            setCharacters(gameData.characters || []);
            setSuperArts(gameData.super_arts || []);
        }
    }, [gameData]);

    if (isUserLoading || !user || user.role !== 'admin' || isGameDataLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const handleCharacterChange = (charId: string, field: keyof Character, value: string) => {
        setCharacters(prev => prev.map(c => c.id === charId ? { ...c, [field]: value } : c));
    };

    const handleSuperArtChange = (artId: string, field: keyof SuperArt, value: string) => {
        setSuperArts(prev => prev.map(sa => sa.id === artId ? { ...sa, [field]: value } : sa));
    };
    
    const addNewCharacter = () => {
        const newCharId = `char-${uuidv4()}`;
        const newChar: Character = {
            id: newCharId,
            name: 'Nuevo Personaje',
            role: 'DAMAGE',
            image: 'https://picsum.photos/seed/new/200/200',
            hint: 'new character'
        };
        const newSuperArts: SuperArt[] = [
            { id: `sa-${uuidv4()}`, characterId: newCharId, name: 'Super I', description: '', color: 'blue', roman: 'I' },
            { id: `sa-${uuidv4()}`, characterId: newCharId, name: 'Super II', description: '', color: 'red', roman: 'II' },
            { id: `sa-${uuidv4()}`, characterId: newCharId, name: 'Super III', description: '', color: 'yellow', roman: 'III' },
        ];
        setCharacters(prev => [...prev, newChar]);
        setSuperArts(prev => [...prev, ...newSuperArts]);
    };

    const deleteCharacter = (charId: string) => {
        if(confirm('¿Estás seguro de que quieres eliminar este personaje y todos sus Super Arts?')) {
            setCharacters(prev => prev.filter(c => c.id !== charId));
            setSuperArts(prev => prev.filter(sa => sa.characterId !== charId));
        }
    };
    
    const handleSaveChanges = async () => {
        if (!gameDataRef) return;
        setIsSaving(true);
        try {
            await updateDocumentNonBlocking(gameDataRef, {
                characters: characters,
                super_arts: superArts
            });
            toast({ title: '¡Guardado!', description: 'Los datos del juego han sido actualizados.' });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: `No se pudo guardar: ${e.message}` });
        } finally {
            setIsSaving(false);
        }
    };

    const getCharacterSuperArts = (characterId: string) => {
        return superArts.filter(sa => sa.characterId === characterId).sort((a,b) => a.roman.localeCompare(b.roman));
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <PageHeader />
            <main className="flex-1 container py-4 sm:py-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold">Panel de Administración</h1>
                    <div className="flex gap-2">
                        <Button onClick={addNewCharacter}><PlusCircle /> Añadir Personaje</Button>
                        <Button onClick={handleSaveChanges} disabled={isSaving} variant="secondary">
                            {isSaving ? <Loader2 className="animate-spin" /> : <Save />} Guardar Cambios
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Personajes y Super Arts</CardTitle>
                        <CardDescription>
                            Añade, edita o elimina personajes y sus habilidades. No olvides guardar los cambios.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {characters.length === 0 ? (
                             <div className="flex items-center justify-center p-8">
                                <p>No hay personajes. ¡Añade uno para empezar!</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full" defaultValue={characters[0]?.id}>
                                {characters?.map(character => (
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
                                                <div className="flex justify-end">
                                                    <Button variant="destructive" size="sm" onClick={() => deleteCharacter(character.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4"/> Eliminar Personaje
                                                    </Button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor={`name-${character.id}`}>Nombre del Personaje</Label>
                                                        <Input id={`name-${character.id}`} value={character.name} onChange={e => handleCharacterChange(character.id, 'name', e.target.value)} />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`role-${character.id}`}>Rol</Label>
                                                        <Input id={`role-${character.id}`} value={character.role} onChange={e => handleCharacterChange(character.id, 'role', e.target.value)} />
                                                    </div>
                                                    <div className="md:col-span-2">
                                                        <Label htmlFor={`image-${character.id}`}>URL de la Imagen</Label>
                                                        <Input id={`image-${character.id}`} value={character.image} onChange={e => handleCharacterChange(character.id, 'image', e.target.value)} />
                                                    </div>
                                                     <div className="md:col-span-2">
                                                        <Label htmlFor={`hint-${character.id}`}>Pista de IA (2 palabras max)</Label>
                                                        <Input id={`hint-${character.id}`} value={character.hint || ''} onChange={e => handleCharacterChange(character.id, 'hint', e.target.value)} />
                                                    </div>
                                                </div>

                                                <h4 className="font-semibold pt-4 border-t">Super Arts:</h4>
                                                <div className="space-y-4">
                                                    {getCharacterSuperArts(character.id).map(art => (
                                                        <div key={art.id} className="p-3 border rounded-md space-y-2">
                                                            <p className="font-mono font-bold text-accent">Super Art {art.roman}</p>
                                                            <div>
                                                                <Label htmlFor={`sa-name-${art.id}`}>Nombre</Label>
                                                                <Input id={`sa-name-${art.id}`} value={art.name} onChange={e => handleSuperArtChange(art.id, 'name', e.target.value)} />
                                                            </div>
                                                            <div>
                                                                <Label htmlFor={`sa-desc-${art.id}`}>Descripción</Label>
                                                                <Input id={`sa-desc-${art.id}`} value={art.description} onChange={e => handleSuperArtChange(art.id, 'description', e.target.value)} />
                                                            </div>
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
