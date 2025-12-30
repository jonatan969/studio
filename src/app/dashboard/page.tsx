'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/page-header';
import { PlusCircle, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface User {
  name: string;
  nickname: string;
  isAdmin: boolean;
}

const mockRooms = [
  {
    id: 'clash-of-titans',
    name: 'Clash of Titans',
    players: 10,
    maxPlayers: 12,
    spectators: 2,
    status: 'Drafting',
    imageId: 'room-1',
  },
  {
    id: 'cyberpunk-showdown',
    name: 'Cyberpunk Showdown',
    players: 5,
    maxPlayers: 12,
    status: 'Waiting for players',
    spectators: 0,
    imageId: 'room-2',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleCreateRoom = () => {
    router.push(`/create-room`);
  };

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-headline text-4xl font-bold">Lobby</h1>
          <Button onClick={handleCreateRoom} className="font-bold">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Room
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockRooms.map((room) => {
             const roomImage = PlaceHolderImages.find(p => p.id === room.imageId);
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
                        <span className="flex items-center gap-1 text-sm"><Users className="h-4 w-4" /> {room.players}/{room.maxPlayers}</span>
                     </CardDescription>
                   </div>
                </CardHeader>
                <CardContent className="flex-grow p-6 pt-4">
                  {/* Room description could go here */}
                </CardContent>
                <CardFooter>
                   <Link href={`/room/${room.id}`} className="w-full">
                     <Button className="w-full font-bold" variant="secondary">Join Room</Button>
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
