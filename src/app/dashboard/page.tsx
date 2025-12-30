'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { collection, query, where, DocumentData } from 'firebase/firestore';

interface RoomData {
  id: string;
  name: string;
  playersPerTeam: number;
  team1Name: string;
  team2Name: string;
  status: 'Waiting' | 'Drafting' | 'Finished';
  playerCount: number;
}


export default function DashboardPage() {
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const roomsQuery = useMemoFirebase(() => {
      if (!firestore) return null;
      return collection(firestore, 'rooms');
  }, [firestore]);

  const { data: rooms, isLoading: isLoadingRooms } = useCollection<RoomData>(roomsQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  const handleCreateRoom = () => {
    router.push(`/create-room`);
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-headline text-4xl font-bold">Lobby</h1>
          <Button onClick={handleCreateRoom} className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Sala
          </Button>
        </div>

        {isLoadingRooms && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}><CardContent className="h-64 animate-pulse bg-muted rounded-lg"></CardContent></Card>
                ))}
            </div>
        )}

        {!isLoadingRooms && (!rooms || rooms.length === 0) && (
            <div className="text-center py-16">
                <h2 className="text-2xl font-semibold">No hay salas disponibles</h2>
                <p className="text-muted-foreground mt-2">¿Por qué no creas una?</p>
            </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {rooms?.map((room) => {
             const roomImage = PlaceHolderImages.find(p => p.id === 'room-1');
             const maxPlayers = room.playersPerTeam * 2;
            return (
              <Card key={room.id} className="flex flex-col overflow-hidden hover:border-primary transition-colors">
                <CardHeader className="p-0">
                  <div className="relative h-48 w-full">
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
                        <Badge variant={room.status === 'Drafting' ? 'destructive' : 'secondary'}>{room.status}</Badge>
                    </div>
                  </div>
                   <div className="p-6 pb-0">
                     <CardTitle className="font-headline text-2xl">{room.name}</CardTitle>
                     <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm"><Users className="h-4 w-4" /> {room.playerCount || 0}/{maxPlayers}</span>
                     </CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-4">
                  {/* Room description could go here */}
                </CardContent>
                <CardFooter>
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
