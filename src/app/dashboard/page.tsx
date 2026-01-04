'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, Users, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Room } from '@/lib/types';


export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const roomsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      // We only want to show rooms that are not finished or canceled
      return query(
        collection(firestore, 'rooms'), 
        where('phase', 'in', ['PREP', 'COIN_FLIP', 'DRAFTING', 'SUPER_ART', 'REVEAL'])
      );
  }, [firestore]);

  const { data: rooms, isLoading: isLoadingRooms } = useCollection<Room>(roomsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen w-full flex-col">
        <PageHeader />
        <main className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </main>
      </div>
    );
  }

  const handleCreateRoom = () => {
    router.push(`/create-room`);
  };

  const getStatusVariant = (phase: Room['phase']): "destructive" | "secondary" | "default" => {
    switch(phase) {
        case 'DRAFTING':
        case 'SUPER_ART':
        case 'REVEAL':
            return 'destructive';
        case 'PREP':
        case 'COIN_FLIP':
            return 'secondary';
        case 'FINISHED':
        case 'CANCELED':
            return 'default';
        default:
            return 'secondary';
    }
  }

  const getStatusText = (phase: Room['phase']): string => {
    switch(phase) {
        case 'PREP': return 'Esperando Jugadores';
        case 'COIN_FLIP': return 'Comenzando';
        case 'DRAFTING': return 'En Draft';
        case 'SUPER_ART': return 'En Draft';
        case 'REVEAL': return 'Revelando';
        case 'FINISHED': return 'Finalizado';
        case 'CANCELED': return 'Cancelado';
        default: return 'Desconocido';
    }
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-4 sm:py-8">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="font-headline text-3xl sm:text-4xl font-bold">Lobby de Salas</h1>
          <Button onClick={handleCreateRoom} className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Sala
          </Button>
        </div>

        {isLoadingRooms && (
            <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}><CardContent className="h-64 animate-pulse bg-muted rounded-lg p-0"></CardContent></Card>
                ))}
            </div>
        )}

        {!isLoadingRooms && (!rooms || rooms.length === 0) && (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <h2 className="text-2xl font-semibold">No hay salas disponibles</h2>
                <p className="text-muted-foreground mt-2">¿Por qué no creas una y empiezas la batalla?</p>
            </div>
        )}

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms?.map((room) => {
             const roomImage = PlaceHolderImages.find(p => p.id === 'room-1');
             const maxPlayers = room.playersPerTeam * 2;
             const playerCount = room.players?.filter(p => p.team !== 'spectator').length || 0;
            return (
              <Card key={room.id} className="flex flex-col overflow-hidden hover:border-primary transition-colors duration-200">
                <CardHeader className="p-0">
                  <div className="relative h-40 sm:h-48 w-full">
                    {roomImage && (
                        <Image
                            src={roomImage.imageUrl}
                            alt={roomImage.description}
                            fill
                            className="object-cover"
                            data-ai-hint={roomImage.imageHint}
                        />
                    )}
                    <div className="absolute top-2 right-2">
                        <Badge variant={getStatusVariant(room.phase)}>{getStatusText(room.phase)}</Badge>
                    </div>
                  </div>
                   <div className="p-4 sm:p-6 pb-0">
                     <CardTitle className="font-headline text-xl sm:text-2xl truncate">{room.name}</CardTitle>
                     <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm"><Users className="h-4 w-4" /> {playerCount} / {maxPlayers}</span>
                     </CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow p-4 sm:p-6 pt-2 sm:pt-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">Equipos: {room.team1Name} vs {room.team2Name}</p>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 pt-0">
                   <Link href={`/room/${room.id}`} className="w-full">
                     <Button className="w-full font-bold" variant="secondary">Unirse a la Sala</Button>
                   </Link>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </main>
    </div>
  );
}
