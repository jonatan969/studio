
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
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import type { Character, SuperArt } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

const superArtSchema = z.object({
  id: z.string(),
  characterId: z.string(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().min(1, 'La descripción es obligatoria'),
  image: z.string().url('La URL de la imagen no es válida'),
  color: z.enum(['red', 'yellow', 'blue']),
  roman: z.string(),
});

const characterSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'El nombre es obligatorio'),
  role: z.enum(['Atacante', 'Defensor', 'Apoyo'], { required_error: 'El rol es obligatorio' }),
  image: z.string().url('La URL de la imagen no es válida'),
  superArts: z.array(superArtSchema).length(3),
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

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CharacterFormData>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
          superArts: [
            { id: '', characterId: '', name: '', description: '', image: '', color: 'red', roman: 'I' },
            { id: '', characterId: '', name: '', description: '', image: '', color: 'yellow', roman: 'II' },
            { id: '', characterId: '', name: '', description: '', image: '', color: 'blue', roman: 'III' },
          ]
        }
    });

    const { fields } = useFieldArray({
      control,
      name: "superArts",
    });

    useEffect(() => {
        if (!isUserLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    const handleOpenForm = (character: Character | null) => {
        setEditingCharacter(character);
        if (character) {
            const characterSuperArts = superArts.filter(sa => sa.characterId === character.id).sort((a,b) => a.roman.localeCompare(b.roman));
            reset({
                id: character.id,
                name: character.name,
                role: character.role,
                image: character.image,
                superArts: characterSuperArts.length === 3 ? characterSuperArts : [
                  { id: `sa-${uuidv4()}`, characterId: character.id, name: '', description: '', image: '', color: 'red', roman: 'I' },
                  { id: `sa-${uuidv4()}`, characterId: character.id, name: '', description: '', image: '', color: 'yellow', roman: 'II' },
                  { id: `sa-${uuidv4()}`, characterId: character.id, name: '', description: '', image: '', color: 'blue', roman: 'III' },
                ],
            });
        } else {
            reset({
                id: '',
                name: '',
                role: undefined,
                image: '',
                superArts: [
                  { id: `sa-${uuidv4()}`, characterId: '', name: '', description: '', image: '', color: 'red', roman: 'I' },
                  { id: `sa-${uuidv4()}`, characterId: '', name: '', description: '', image: '', color: 'yellow', roman: 'II' },
                  { id: `sa-${uuidv4()}`, characterId: '', name: '', description: '', image: '', color: 'blue', roman: 'III' },
                ]
            });
        }
        setFormOpen(true);
    };

    const onSubmit = async (data: CharacterFormData) => {
        if (!firestore || !gameDataRef) return;

        let currentCharacters = gameData?.characters || [];
        let currentSuperArts = gameData?.super_arts || [];

        const characterId = editingCharacter?.id || `char-${uuidv4()}`;

        const characterData: Character = {
            id: characterId,
            name: data.name,
            role: data.role,
            image: data.image,
        };
        
        const newSuperArts = data.superArts.map((sa, index) => ({ 
            ...sa, 
            id: sa.id || `sa-${uuidv4()}`, // Ensure ID exists
            characterId 
        }));
        
        let updatedCharacters;
        let updatedSuperArts;

        if (editingCharacter) { // Editing existing character
            updatedCharacters = currentCharacters.map(c => c.id === characterId ? characterData : c);
            
            // Remove old super arts of this character and add the new/updated ones
            updatedSuperArts = currentSuperArts.filter(sa => sa.characterId !== characterId);
            updatedSuperArts.push(...newSuperArts);
            
        } else { // Adding new character
            updatedCharacters = [...currentCharacters, characterData];
            updatedSuperArts = [...currentSuperArts, ...newSuperArts];
        }

        try {
            await setDoc(gameDataRef, { characters: updatedCharacters, super_arts: updatedSuperArts }, { merge: true });
            toast({ title: `Personaje ${editingCharacter ? 'actualizado' : 'añadido'}` });
            setFormOpen(false);
        } catch (error: any) {
            console.error("Error saving character:", error);
            toast({ variant: 'destructive', title: 'Error al guardar', description: error.message });
        }
    };
    
    const handleDeleteCharacter = async (characterId: string) => {
        if (!firestore || !gameDataRef || !gameData) return;
        const updatedCharacters = characters.filter(c => c.id !== characterId);
        const updatedSuperArts = superArts.filter(sa => sa.characterId !== characterId);
        try {
            await setDoc(gameDataRef, { characters: updatedCharacters, super_arts: updatedSuperArts }, { merge: true });
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
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle>{editingCharacter ? 'Editar' : 'Añadir'} Personaje</DialogTitle>
                                <DialogDescription>
                                    Rellena los detalles del personaje y sus Super Arts.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)}>
                                <ScrollArea className="h-[60vh] p-4">
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nombre del Personaje</Label>
                                        <Input id="name" {...register('name')} autoComplete="off" />
                                        {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="role">Rol</Label>
                                            <Controller
                                                name="role"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Selecciona un rol" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Atacante">Atacante</SelectItem>
                                                            <SelectItem value="Defensor">Defensor</SelectItem>
                                                            <SelectItem value="Apoyo">Apoyo</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            />
                                            {errors.role && <p className="text-destructive text-sm">{errors.role.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="image">URL de Imagen del Personaje</Label>
                                            <Input id="image" {...register('image')} autoComplete="off" />
                                            {errors.image && <p className="text-destructive text-sm">{errors.image.message}</p>}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-semibold border-t pt-4">Super Arts</h3>
                                    
                                    <div className="space-y-6">
                                      {fields.map((field, index) => (
                                        <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                                            <h4 className="font-bold text-accent">Super Art {field.roman}</h4>
                                            <div className="space-y-2">
                                                <Label htmlFor={`superArts.${index}.name`}>Título</Label>
                                                <Input {...register(`superArts.${index}.name`)} autoComplete="off" />
                                                {errors.superArts?.[index]?.name && <p className="text-destructive text-sm">{errors.superArts[index]?.name?.message}</p>}
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor={`superArts.${index}.description`}>Descripción</Label>
                                                <Input {...register(`superArts.${index}.description`)} autoComplete="off" />
                                                {errors.superArts?.[index]?.description && <p className="text-destructive text-sm">{errors.superArts[index]?.description?.message}</p>}
                                            </div>
                                             <div className="space-y-2">
                                                <Label htmlFor={`superArts.${index}.image`}>URL de Imagen</Label>
                                                <Input {...register(`superArts.${index}.image`)} autoComplete="off" />
                                                {errors.superArts?.[index]?.image && <p className="text-destructive text-sm">{errors.superArts[index]?.image?.message}</p>}
                                            </div>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                                </ScrollArea>
                                <DialogFooter className="pt-4 border-t mt-4">
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
                                                <Image src={character.image} alt={character.name} width={40} height={40} className="rounded-md object-cover img-pixelated" />
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
                                                </div>

                                                <h4 className="font-semibold pt-4 border-t">Super Arts:</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    {getCharacterSuperArts(character.id).map(art => (
                                                        <div key={art.id} className="p-3 border rounded-md space-y-2 bg-secondary/50">
                                                            <div className="relative h-24 w-full mb-2 rounded-md overflow-hidden">
                                                                <Image src={art.image} alt={art.name} fill className="object-cover img-pixelated" />
                                                            </div>
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

    