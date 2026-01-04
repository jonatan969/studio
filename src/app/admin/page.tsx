'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, deleteDoc } from 'firebase/firestore';
import { PageHeader } from '@/components/page-header';
import { Loader2, PlusCircle, Trash2, Edit, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Character, SuperArt } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const superArtSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    description: z.string().min(1, "La descripción es obligatoria"),
    color: z.enum(["yellow", "red", "blue"]),
    roman: z.string().min(1, "El número romano es obligatorio (I, II, III)"),
});

const characterSchema = z.object({
    name: z.string().min(1, "El nombre del personaje es obligatorio"),
    image: z.string().url("Debe ser una URL de imagen válida"),
    role: z.string().min(1, "El rol es obligatorio"),
    hint: z.string().optional(),
    description: z.string().optional(),
    superArts: z.array(superArtSchema).length(3, "Cada personaje debe tener exactamente 3 Super Arts"),
});

type CharacterFormData = z.infer<typeof characterSchema>;

export default function AdminPage() {
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);

    const charactersQuery = useMemoFirebase(() => firestore ? collection(firestore, 'characters') : null, [firestore]);
    const { data: characters, isLoading: isLoadingCharacters } = useCollection<Character>(charactersQuery);
    
    const superArtsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'super_arts') : null, [firestore]);
    const { data: superArts, isLoading: isLoadingSuperArts } = useCollection<SuperArt>(superArtsQuery);

    const { register, control, handleSubmit, reset, formState: { errors } } = useForm<CharacterFormData>({
        resolver: zodResolver(characterSchema),
        defaultValues: {
            name: '',
            image: '',
            role: 'Duelist',
            superArts: [
                { name: '', description: '', color: 'red', roman: 'I' },
                { name: '', description: '', color: 'yellow', roman: 'II' },
                { name: '', description: '', color: 'blue', roman: 'III' },
            ]
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "superArts"
    });

    useEffect(() => {
        if (!isUserLoading && (!user || user.role !== 'admin')) {
            router.push('/dashboard');
        }
    }, [user, isUserLoading, router]);

    const handleOpenDialog = (character: Character | null = null) => {
        setEditingCharacter(character);
        if (character) {
            const relatedSuperArts = superArts?.filter(sa => sa.characterId === character.id) || [];
            reset({
                name: character.name,
                image: character.image,
                role: character.role,
                description: character.description,
                hint: character.hint,
                superArts: relatedSuperArts.length === 3 ? relatedSuperArts.map(sa => ({...sa})) : [ // Ensure we have 3, even if DB is inconsistent
                    { name: '', description: '', color: 'red', roman: 'I' },
                    { name: '', description: '', color: 'yellow', roman: 'II' },
                    { name: '', description: '', color: 'blue', roman: 'III' },
                ],
            });
        } else {
            reset();
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: CharacterFormData) => {
        if (!firestore) return;
        setIsSubmitting(true);

        try {
            const charRef = editingCharacter ? doc(firestore, 'characters', editingCharacter.id) : doc(collection(firestore, 'characters'));
            
            const characterData: Omit<Character, 'id'> = {
                name: data.name,
                image: data.image,
                role: data.role,
                description: data.description || '',
                hint: data.hint || '',
            };

            if (editingCharacter) {
                await updateDocumentNonBlocking(charRef, characterData);
            } else {
                await setDocumentNonBlocking(charRef, characterData, {});
            }

            const characterId = charRef.id;

            // Delete old super arts if editing
            if (editingCharacter) {
                const oldSuperArts = superArts?.filter(sa => sa.characterId === editingCharacter.id) || [];
                for (const art of oldSuperArts) {
                    await deleteDoc(doc(firestore, 'super_arts', art.id));
                }
            }

            // Create new super arts
            for (const artData of data.superArts) {
                const artRef = doc(collection(firestore, 'super_arts'));
                await setDocumentNonBlocking(artRef, { ...artData, characterId: characterId }, {});
            }

            toast({ title: `Éxito`, description: `Personaje ${editingCharacter ? 'actualizado' : 'creado'} correctamente.` });
            setIsDialogOpen(false);
            reset();

        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleDeleteCharacter = async (characterId: string) => {
        if (!firestore) return;
        if (!confirm(`¿Estás seguro de que quieres eliminar este personaje y todos sus Super Arts? Esta acción no se puede deshacer.`)) return;

        try {
            // Delete character document
            await deleteDoc(doc(firestore, 'characters', characterId));

            // Delete associated super arts
            const artsToDelete = superArts?.filter(sa => sa.characterId === characterId) || [];
            for (const art of artsToDelete) {
                await deleteDoc(doc(firestore, 'super_arts', art.id));
            }
            
            toast({ title: 'Personaje Eliminado' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error al Eliminar', description: error.message });
        }
    }

    if (isUserLoading || user?.role !== 'admin') {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    
    const getCharacterSuperArts = (characterId: string) => {
        return superArts?.filter(sa => sa.characterId === characterId) || [];
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <PageHeader />
            <main className="flex-1 container py-4 sm:py-8">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <h1 className="font-headline text-3xl sm:text-4xl font-bold">Panel de Administración</h1>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => handleOpenDialog(null)} className="font-bold">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Añadir Personaje
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                            <DialogHeader>
                                <DialogTitle className="font-headline text-2xl">{editingCharacter ? 'Editar' : 'Añadir'} Personaje</DialogTitle>
                                <DialogDescription>
                                    Rellena los detalles del personaje y sus 3 Super Arts.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="name">Nombre del Personaje</Label>
                                        <Input id="name" {...register('name')} />
                                        {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
                                    </div>
                                    <div>
                                        <Label htmlFor="role">Rol</Label>
                                        <Input id="role" {...register('role')} />
                                        {errors.role && <p className="text-destructive text-sm mt-1">{errors.role.message}</p>}
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="image">URL de la Imagen</Label>
                                    <Input id="image" {...register('image')} placeholder="https://example.com/image.png" />
                                    {errors.image && <p className="text-destructive text-sm mt-1">{errors.image.message}</p>}
                                </div>
                                <h3 className="font-headline text-lg border-b pb-2 mt-4">Super Arts</h3>
                                <div className="space-y-4">
                                    {fields.map((item, index) => (
                                        <div key={item.id} className="p-4 border rounded-lg space-y-2">
                                            <Label>Super Art {index + 1}</Label>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                <div>
                                                    <Input {...register(`superArts.${index}.name`)} placeholder="Nombre del Super Art" />
                                                    {errors.superArts?.[index]?.name && <p className="text-destructive text-sm mt-1">{errors.superArts?.[index]?.name?.message}</p>}
                                                </div>
                                                <div>
                                                    <Input {...register(`superArts.${index}.description`)} placeholder="Descripción" />
                                                    {errors.superArts?.[index]?.description && <p className="text-destructive text-sm mt-1">{errors.superArts?.[index]?.description?.message}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <DialogFooter className="mt-4">
                                    <DialogClose asChild>
                                        <Button type="button" variant="secondary">Cancelar</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingCharacter ? 'Guardar Cambios' : 'Crear Personaje')}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Lista de Personajes</CardTitle>
                        <CardDescription>Gestiona los personajes y sus Super Arts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoadingCharacters || isLoadingSuperArts ? (
                            <Loader2 className="animate-spin" />
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
                                                <div className="flex gap-2">
                                                     <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(character)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteCharacter(character.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        )}
                        {!isLoadingCharacters && characters?.length === 0 && (
                            <div className="text-center py-10 border-2 border-dashed rounded-lg">
                                <p>No hay personajes creados. ¡Añade el primero!</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
