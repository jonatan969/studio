'use client';

import { useState } from 'react';
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
import { collection, doc } from 'firebase/firestore';

const createRoomSchema = z.object({
  roomName: z.string().min(3, 'Room name must be at least 3 characters'),
  team1Name: z.string().min(1, 'Team name is required'),
  team2Name: z.string().min(1, 'Team name is required'),
  playersPerTeam: z.number().min(1).max(10),
  spectatorLimit: z.number().min(0).max(10),
  team1Logo: z.string().url('Please enter a valid URL for Team 1 logo').or(z.literal('')),
  team2Logo: z.string().url('Please enter a valid URL for Team 2 logo').or(z.literal('')),
  joinPreference: z.enum(['team1', 'team2', 'spectator']),
});

type CreateRoomForm = z.infer<typeof createRoomSchema>;

export default function CreateRoomPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<CreateRoomForm>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      roomName: 'My Awesome Room',
      team1Name: 'Team Alpha',
      team2Name: 'Team Bravo',
      playersPerTeam: 6,
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
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to create a room.' });
        return;
    }
    setIsLoading(true);
    
    try {
        const roomsColRef = collection(firestore, 'rooms');
        const newRoomRef = doc(roomsColRef);
        const newRoomId = newRoomRef.id;

        const roomData = {
            id: newRoomId,
            name: data.roomName,
            adminId: user.uid,
            team1Name: data.team1Name,
            team2Name: data.team2Name,
            team1Logo: data.team1Logo,
            team2Logo: data.team2Logo,
            playersPerTeam: data.playersPerTeam,
            spectatorLimit: data.spectatorLimit,
            status: 'waiting',
            playerCount: 1,
            phase: 'PREP',
        };
        
        await setDocumentNonBlocking(newRoomRef, roomData, {});

        const playerRef = doc(firestore, `rooms/${newRoomId}/players`, user.uid);
        const playerData = {
            uid: user.uid,
            nickname: user.displayName,
            photoURL: user.photoURL,
            team: data.joinPreference,
            isReady: false,
        };
        await setDocumentNonBlocking(playerRef, playerData, {});

        toast({
          title: 'Room Created!',
          description: `The room "${data.roomName}" has been successfully created.`,
        });

        router.push(`/room/${newRoomId}`);
    } catch(error: any) {
        toast({ variant: 'destructive', title: 'Error Creating Room', description: error.message });
        setIsLoading(false);
    }
  };
  
  if(isUserLoading) return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="animate-spin" /></div>

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-4 sm:py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl sm:text-3xl">Create a New Draft Room</CardTitle>
            <CardDescription>Customize your draft settings and invite others to join.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                <Label htmlFor="roomName">Room Name</Label>
                <Input id="roomName" {...register('roomName')} />
                {errors.roomName && <p className="text-destructive text-sm">{errors.roomName.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {/* Team 1 Settings */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-headline text-xl text-orange-400">Team 1</h3>
                  <div className="space-y-2">
                    <Label htmlFor="team1Name">Team Name</Label>
                    <Input id="team1Name" {...register('team1Name')} />
                    {errors.team1Name && <p className="text-destructive text-sm">{errors.team1Name.message}</p>}
                  </div>
                  <div className="space-y-2">
                     <Label htmlFor="team1Logo">Team 1 Logo URL</Label>
                     <Input id="team1Logo" {...register('team1Logo')} placeholder="https://example.com/logo1.png" />
                     {errors.team1Logo && <p className="text-destructive text-sm">{errors.team1Logo.message}</p>}
                  </div>
                </div>

                {/* Team 2 Settings */}
                <div className="space-y-4 p-4 border rounded-lg">
                  <h3 className="font-headline text-xl text-purple-400">Team 2</h3>
                  <div className="space-y-2">
                    <Label htmlFor="team2Name">Team Name</Label>
                    <Input id="team2Name" {...register('team2Name')} />
                     {errors.team2Name && <p className="text-destructive text-sm">{errors.team2Name.message}</p>}
                  </div>
                   <div className="space-y-2">
                     <Label htmlFor="team2Logo">Team 2 Logo URL</Label>
                     <Input id="team2Logo" {...register('team2Logo')} placeholder="https://example.com/logo2.png" />
                     {errors.team2Logo && <p className="text-destructive text-sm">{errors.team2Logo.message}</p>}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Players per Team: {playersPerTeam}</Label>
                <Controller
                  name="playersPerTeam"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      min={1}
                      max={10}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  )}
                />
              </div>

              <div className="space-y-4">
                <Label>Spectator Limit: {spectatorLimit}</Label>
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
                <Label>How do you want to join?</Label>
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
                            Join {team1Name || 'Team 1'}
                        </Label>
                        <Label className="flex items-center gap-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/10">
                            <RadioGroupItem value="team2" id="team2" />
                            Join {team2Name || 'Team 2'}
                        </Label>
                         <Label className="flex items-center gap-2 p-3 sm:p-4 border rounded-lg cursor-pointer hover:border-primary has-[input:checked]:border-primary has-[input:checked]:bg-primary/10">
                            <RadioGroupItem value="spectator" id="spectator" />
                            Join as Spectator
                        </Label>
                    </RadioGroup>
                  )}
                 />
              </div>


              <Button type="submit" className="w-full font-bold" disabled={isLoading || isUserLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Create Room'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
