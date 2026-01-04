'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, writeBatch, arrayUnion } from 'firebase/firestore';
import type { Room, RoomPlayer } from '@/lib/types';

const createRoomSchema = z.object({
  roomName: z.string().min(3, 'El nombre de la sala debe tener al menos 3 caracteres'),
  team1Name: z.string().min(1, 'El nombre del equipo es obligatorio'),
  team2Name: z.string().min(1, 'El nombre del equipo es obligatorio'),
  playersPerTeam: z.number().min(1).max(5),
  spectatorLimit: z.number().min(0).max(10),
  team1Logo: z.string().url('Por favor, introduce una URL válida para el logo del Equipo 1').or(z.literal('')),
  team2Logo: z.string().url('Por favor, introduce una URL válida para el logo del Equipo 2').or(z.literal('')),
  joinPreference: z.enum(['team1', 'team2', 'spectator']),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

export default function CreateRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [isUserLoading, user, router]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      roomName: 'Mi Sala Increíble',
      team1Name: 'Equipo Alfa',
      team2Name: 'Equipo Bravo',
      playersPerTeam: 3,
      spectatorLimit: 4,
      team1Logo: '',
      team2Logo: '',
      joinPreference: 'team1',
    },
  });

  const playersPerTeam = watch('playersPerTeam');
  const spectatorLimit = watch('spectatorLimit');
  const team1Name = watch('team1Name');
  const team2Name = watch('team2Name');

  const onSubmit = async (data: CreateRoomForm) => {
    if (!user || !firestore) {
        toast({ variant: 'destructive', title: 'No Autenticado', description: 'Debes iniciar sesión para crear una sala.' });
        return;
    }
    setIsLoading(true);
    
    try {
        const roomsCollection = collection(firestore, 'rooms');
        const newRoomRef = doc(roomsCollection);
        const newRoomId = newRoomRef.id;

        const player: RoomPlayer = {
            uid: user.uid,
            nickname: user.displayName || 'Anón.',
            photoURL: user.photoURL,
            team: data.joinPreference,
            isReady: false,
        };

        const roomData: Omit<Room, 'id'> = {
            name: data.roomName,
            adminId: user.uid,
            team1Name: data.team1Name,
            team2Name: data.team2Name,
            team1Logo: data.team1Logo,
            team2Logo: data.team2Logo,
            playersPerTeam: data.playersPerTeam,
            spectatorLimit: data.spectatorLimit,
            phase: 'PREP',
            picks: [],
        };
        
        const playerDocRef = doc(firestore, 'rooms', newRoomId, 'players', user.uid);
        
        const batch = writeBatch(firestore);
        batch.set(newRoomRef, roomData);
        batch.set(playerDocRef, player);
        await batch.commit();

        toast({
          title: '¡Sala Creada!',
          description: `La sala "${data.roomName}" ha sido creada exitosamente.`,
        });

        router.push(`/room/${newRoomId}`);
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error al Crear la Sala', description: error.message });
        setIsLoading(false);
    }
  };
  
  if(isUserLoading || !user) return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-4 sm:py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl sm:text-3xl">Crear Nueva Sala de Draft</CardTitle>
            <CardDescription>Personaliza la configuración de tu draft e invita a otros a unirse.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <Label htmlFor="roomName">Nombre de la Sala</Label>
                <Input id="roomName" {...register('roomName')} />
                {errors.roomName && <p className="text-destructive text-sm">{errors.roomName.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-headline text-xl text-orange-400">Equipo 1</h3>
                  <div className="space-y-2">
                    <Label htmlFor="team1Name">Nombre del Equipo</Label>
                    <Input id="team1Name" {...register('team1Name')} />
                    {errors.team1Name && <p className="text-destructive text-sm">{errors.team1Name.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="team1Logo">URL del Logo del Equipo 1</Label>
                     <Input id="team1Logo" {...register('team1Logo')} placeholder="https://ejemplo.com/logo1.png" />
                     {errors.team1Logo && <p className="text-destructive text-sm">{errors.team1Logo.message}</p>}
                  </div>
                </div>

                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-headline text-xl text-purple-400">Equipo 2</h3>
                  <div className="space-y-2">
                    <Label htmlFor="team2Name">Nombre del Equipo</Label>
                    <Input id="team2Name" {...register('team2Name')} />
                     {errors.team2Name && <p className="text-destructive text-sm">{errors.team2Name.message}</p>}
                  </div>
                   <div className="space-y-2">
                     <Label htmlFor="team2Logo">URL del Logo del Equipo 2</Label>
                     <Input id="team2Logo" {...register('team2Logo')} placeholder="https://ejemplo.com/logo2.png" />
                     {errors.team2Logo && <p className="text-destructive text-sm">{errors.team2Logo.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Jugadores por Equipo: {playersPerTeam}</Label>
                <Controller
                  name="playersPerTeam"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label>Límite de Espectadores: {spectatorLimit}</Label>
                <Controller
                  name="spectatorLimit"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      min={0}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  )}
                />
              </div>
              
              <div className="space-y-4">
                <Label>¿Cómo quieres unirte?</Label>
                 <Controller
                  name="joinPreference"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <Label className="flex items-center gap-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/10">
                            <RadioGroupItem value="team1" id="team1" />
                            Unirse a {team1Name || 'Equipo 1'}
                        </Label>
                        <Label className="flex items-center gap-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/10">
                            <RadioGroupItem value="team2" id="team2" />
                            Unirse a {team2Name || 'Equipo 2'}
                        </Label>
                         <Label className="flex items-center gap-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/10">
                            <RadioGroupItem value="spectator" id="spectator" />
                            Unirse como Espectador
                        </Label>
                    </RadioGroup>
                  )}
                 />
              </div>

              <Button type="submit" className="w-full font-bold" disabled={isLoading || isUserLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Crear Sala'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
