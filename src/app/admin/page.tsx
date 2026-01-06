
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { PageHeader } from '@/components/page-header';
import { Loader2, PlusCircle, Save, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import type { Character, SuperArt } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const characterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  role: z.string().min(1, 'El rol es obligatorio'),
  image: z.string().url('La URL de la imagen no es válida'),
  hint: z.string().optional(),
  description: z.string().optional(),
});

type CharacterFormData = z.infer<typeof characterSchema>;

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [isFormOpen, setFormOpen] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

    const gameDataRef = useMemoFirebase(() => firestore ? doc(firestore, 'game_data', 'static') : null, [firestore]);
    const { data: gameData, isLoading: isGameDataLoading } = useDoc<{ characters: Character[], super_arts: SuperArt[] }>(gameDataRef);
    
    const characters = gameData?.characters || [];
    const superArts = gameData?.super_arts || [];

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CharacterFormData>({
        resolver: zodResolver(characterSchema),
    });

    useEffect(() => {
        if (!isUserLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    const handleOpenForm = (character: Character | null) => {
        setEditingCharacter(character);
        reset(character || { id: '', name: '', role: '', image: '', hint: '', description: '' });
        setFormOpen(true);
    };

    const onSubmit = async (data: CharacterFormData) => {
        if (!firestore || !gameData) return;

        const updatedCharacters = [...characters];
        if (editingCharacter) { // Editing existing character
            const index = updatedCharacters.findIndex(c => c.id === editingCharacter.id);
            if (index > -1) {
                updatedCharacters[index] = { ...editingCharacter, ...data };
            }
        } else { // Adding new character
            updatedCharacters.push({ ...data, id: `char-${uuidv4()}` });
        }

        try {
            await updateDoc(gameDataRef!, { characters: updatedCharacters });
            toast({ title: `Personaje ${editingCharacter ? 'actualizado' : 'añadido'}` });
            setFormOpen(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
        }
    };
    
    const handleDeleteCharacter = async (characterId: string) => {
        if (!firestore || !gameData) return;
        const updatedCharacters = characters.filter(c => c.id !== characterId);
        try {
            await updateDoc(gameDataRef!, { characters: updatedCharacters });
            toast({ title: 'Personaje eliminado' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error al eliminar', description: error.message });
        }
    };

    if (isUserLoading || !user || user.role !== 'admin' || isGameDataLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    const getCharacterSuperArts = (characterId: string) => {
        return superArts.filter(sa => sa.characterId === characterId).sort((a,b) => a.roman.localeCompare(b.roman));
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <PageHeader />
            <main className="flex-1 container py-4 sm:py-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold">Panel de Administración</h1>
                    <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenForm(null)}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Personaje
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{editingCharacter ? 'Editar' : 'Añadir'} Personaje</DialogTitle>
                                <DialogDescription>
                                    Rellena los detalles del personaje.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" {...register('name')} />
                                    {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Rol</Label>
                                    <Input id="role" {...register('role')} />
                                     {errors.role && <p className="text-destructive text-sm">{errors.role.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="image">URL de Imagen</Label>
                                    <Input id="image" {...register('image')} />
                                    {errors.image && <p className="text-destructive text-sm">{errors.image.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hint">Pista de IA (ej. "cyborg soldier")</Label>
                                    <Input id="hint" {...register('hint')} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="description">Descripción</Label>
                                    <Input id="description" {...register('description')} />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">
                                        <Save className="mr-2 h-4 w-4" />
                                        Guardar
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Gestión de Personajes y Super Arts</CardTitle>
                        <CardDescription>
                            Aquí puedes ver, editar y eliminar los personajes y habilidades del juego.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {characters.length === 0 ? (
                             <div className="flex items-center justify-center p-8">
                                <p>No hay personajes definidos en la base de datos.</p>
                            </div>
                        ) : (
                            <Accordion type="single" collapsible className="w-full" defaultValue={characters[0]?.id}>
                                {characters.map(character => (
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
                                                    <div><p className="font-bold">Nombre:</p><p>{character.name}</p></div>
                                                    <div><p className="font-bold">Rol:</p><p>{character.role}</p></div>
                                                    <div className="md:col-span-2"><p className="font-bold">URL de Imagen:</p><p className="text-xs break-all">{character.image}</p></div>
                                                    <div className="md:col-span-2"><p className="font-bold">Pista de IA:</p><p>{character.hint}</p></div>
                                                    <div className="md:col-span-2"><p className="font-bold">Descripción:</p><p>{character.description}</p></div>
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
                                                <div className="flex gap-2 pt-4 border-t">
                                                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(character)}><Edit className="mr-2 h-3 w-3"/>Editar</Button>
                                                    <Button variant="destructive" size="sm" onClick={() => handleDeleteCharacter(character.id)}><Trash2 className="mr-2 h-3 w-3"/>Eliminar</Button>
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


    