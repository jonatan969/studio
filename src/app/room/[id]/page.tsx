'use client';

import { PageHeader } from '@/components/page-header';
import { CHARACTERS, Character, SUPER_ARTS, SuperArt } from '@/lib/game-data';
import { useEffect, useReducer, useState, useCallback, useMemo, use } from 'react';
import { TeamDisplay } from '@/components/room/team-display';
import { CharacterSquare } from '@/components/room/character-square';
import { DraftTimer } from '@/components/room/draft-timer';
import { DRAFT_PICK_TIME, SUPER_ART_PICK_TIME, ROOM_CLOSE_TIME, DRAFT_START_TIMER, getPickOrder } from '@/lib/constants';
import { SuperArtSelector } from '@/components/room/super-art-selector';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DramaticReveal } from '@/components/room/dramatic-reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Loader2, LogOut, ShieldAlert, Users } from 'lucide-react';
import { CoinFlip } from '@/components/room/coin-flip';
import { SuperArtSpectatorView } from '@/components/room/super-art-spectator-view';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Room, RoomPlayer, DraftPick } from '@/lib/types';
import { doc, collection, writeBatch, deleteDoc, runTransaction } from 'firebase/firestore';
import { JoinRoomDialog } from '@/components/room/join-room-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';


type DraftPhase = 'PREP' | 'COIN_FLIP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED' | 'CANCELED';
type TeamId = 'team1' | 'team2';

interface DraftState {
  log: string[];
}

function draftReducer(state: DraftState, action: {type: 'LOG', message: string}): DraftState {
  switch (action.type) {
    case 'LOG':
      return { ...state, log: [action.message, ...state.log] };
    default:
      return state;
  }
}

export default function RoomPage({ params }: { params: { id: string }}) {
  const router = useRouter();
  const roomId = use(params).id;
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const roomRef = useMemoFirebase(() => firestore ? doc(firestore, 'rooms', roomId) : null, [firestore, roomId]);
  const { data: roomData, isLoading: isRoomLoading } = useDoc<Room>(roomRef);
  
  const playersRef = useMemoFirebase(() => firestore ? collection(firestore, 'rooms', roomId, 'players') : null, [firestore, roomId]);
  const { data: players, isLoading: arePlayersLoading } = useCollection<RoomPlayer>(playersRef);
  
  const picksRef = useMemoFirebase(() => firestore ? collection(firestore, 'rooms', roomId, 'picks') : null, [firestore, roomId]);
  const { data: draftPicks, isLoading: arePicksLoading } = useCollection<DraftPick>(picksRef);

  const [state, dispatch] = useReducer(draftReducer, { log: [] });
  const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
  
  const userPlayerInfo = useMemo(() => players?.find(p => p.uid === user?.uid), [players, user]);

  // Admin leaves -> close room effect
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (user?.uid === roomData?.adminId && roomRef) {
         deleteDocumentNonBlocking(roomRef);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, roomData, roomRef]);

  const handleLeaveRoom = useCallback(async () => {
    if (!user || !firestore || !userPlayerInfo || !roomData) return;

    // Admin leaving, close the whole room
    if (roomData.adminId === user.uid) {
      toast({ title: 'Room Closed', description: 'As admin, you have closed the room.' });
      if (roomRef) await deleteDoc(roomRef); // Admin action should be awaited.
      router.push('/dashboard');
      return;
    }
    
    // Regular user leaving
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    await deleteDoc(playerRef);

    // If a player leaves mid-draft, cancel it
    if (userPlayerInfo.team !== 'spectator' && roomData.phase !== 'PREP' && roomData.phase !== 'FINISHED') {
       if (roomRef) updateDocumentNonBlocking(roomRef, { phase: 'CANCELED' });
       dispatch({type: 'LOG', message: `${userPlayerInfo.nickname} left, canceling draft.`});
    }

    router.push('/dashboard');

  }, [user, firestore, userPlayerInfo, roomData, roomId, router, roomRef, toast]);

  // Handle joining a room for the first time
  useEffect(() => {
    if (!isRoomLoading && roomData && !arePlayersLoading && user && !userPlayerInfo) {
      const canSpectate = roomData.phase !== 'PREP';
      setJoinDialogOpen(true);
    }
  }, [isRoomLoading, arePlayersLoading, user, userPlayerInfo, roomData]);

  const handleJoin = (team: 'team1' | 'team2' | 'spectator') => {
    if (!user || !firestore) return;
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    const playerData: RoomPlayer = {
        uid: user.uid,
        nickname: user.displayName || 'Anon',
        photoURL: user.photoURL || null,
        team: team,
        isReady: false,
    };
    setDocumentNonBlocking(playerRef, playerData, {});
    setJoinDialogOpen(false);
    toast({title: `Joined as ${team}`});
  };

  // Main Game State Machine (driven by admin)
  useEffect(() => {
      if (user?.uid !== roomData?.adminId || !roomRef || !players) return;

      const team1Players = players.filter(p => p.team === 'team1').length;
      const team2Players = players.filter(p => p.team === 'team2').length;

      // PREP -> COIN_FLIP
      if (roomData.phase === 'PREP' && team1Players === roomData.playersPerTeam && team2Players === roomData.playersPerTeam) {
        updateDocumentNonBlocking(roomRef, { 
            phase: 'COIN_FLIP', 
            timeLeft: DRAFT_START_TIMER,
            maxTime: DRAFT_START_TIMER,
        });
        dispatch({type: 'LOG', message: `Teams are full! Countdown started.`});
      }

      // Timer tick down
      const timer = setInterval(() => {
        if(roomData.timeLeft !== undefined && roomData.timeLeft > 0) {
            updateDocumentNonBlocking(roomRef, { timeLeft: roomData.timeLeft - 1 });
        } else {
             // Handle timer expiration based on phase
            switch(roomData.phase) {
                case 'DRAFTING':
                    // Auto-pick logic
                    const currentTeamPlayers = players.filter(p => p.team === roomData.currentPicker);
                    const playersWhoHaventPicked = currentTeamPlayers.filter(p => !draftPicks?.some(dp => dp.pickedBy === p.uid));
                    const pickedCharacterIds = draftPicks?.map(p => p.id) || [];
                    const availableCharacters = CHARACTERS.filter(c => !pickedCharacterIds.includes(c.id));
                    
                    if (playersWhoHaventPicked.length > 0 && availableCharacters.length > 0) {
                        const randomPlayer = playersWhoHaventPicked[Math.floor(Math.random() * playersWhoHaventPicked.length)];
                        const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
                        const pickData: Omit<DraftPick, 'id'> = {
                            ...randomCharacter,
                            characterId: randomCharacter.id,
                            pickedBy: randomPlayer.uid,
                            team: roomData.currentPicker!,
                            pickOrder: (draftPicks?.length || 0) + 1,
                        };
                        const newPickRef = doc(collection(firestore!, `rooms/${roomId}/picks`));
                        setDocumentNonBlocking(newPickRef, pickData, {});
                        dispatch({type: 'LOG', message: `Time ran out! ${randomCharacter.name} was auto-picked for ${randomPlayer.nickname}.`});
                    }
                    break;
                case 'SUPER_ART':
                     // Auto-select super arts
                     // This is complex, for now we just move on
                     updateDocumentNonBlocking(roomRef, { phase: 'REVEAL' });
                     dispatch({type: 'LOG', message: 'Super Art selection time is up! Revealing choices...'});
                     break;
                case 'FINISHED':
                     deleteDocumentNonBlocking(roomRef);
                     router.push('/dashboard');
                     break;
            }
        }
      }, 1000);

      return () => clearInterval(timer);

  }, [roomData, players, draftPicks, user, roomRef, firestore, roomId, router]);

  // Client-side turn advancement logic
  useEffect(() => {
    if(!firestore || !roomData || roomData.phase !== 'DRAFTING' || !draftPicks || !roomData.pickOrder) return;
    
    if (user?.uid !== roomData?.adminId) return;

    const totalPicksExpectedForTurn = (roomData.turn !== undefined && roomData.pickOrder && roomData.pickOrder[roomData.turn])
        ? roomData.pickOrder.slice(0, roomData.turn + 1).reduce((acc, turnInfo) => acc + turnInfo.picks, 0)
        : 0;

    if (draftPicks.length >= totalPicksExpectedForTurn) {
         const newTurn = (roomData.turn || 0) + 1;

         if (newTurn >= roomData.pickOrder.length) {
              // End of draft, move to Super Art
              updateDocumentNonBlocking(roomRef!, {
                  phase: 'SUPER_ART',
                  timeLeft: SUPER_ART_PICK_TIME,
                  maxTime: SUPER_ART_PICK_TIME,
                  currentPicker: null,
                  turn: 0,
                  picksPerTurn: 0,
              });
              dispatch({type: 'LOG', message: 'All characters picked! Time to select Super Arts.'});
         } else {
             // Advance to next turn
             const nextTurnInfo = roomData.pickOrder[newTurn];
             updateDocumentNonBlocking(roomRef!, {
                 turn: newTurn,
                 currentPicker: nextTurnInfo.team,
                 picksPerTurn: nextTurnInfo.picks,
                 timeLeft: DRAFT_PICK_TIME,
             });
             const nextTeamName = roomData[nextTurnInfo.team === 'team1' ? 'team1Name' : 'team2Name'];
             dispatch({type: 'LOG', message: `It's Team ${nextTeamName}'s turn to pick.`});
         }
    }
  }, [draftPicks, roomData, firestore, user, roomRef]);


  const handlePickCharacter = (character: Character) => {
    if (!user || !roomData || !players || !draftPicks || !firestore || !userPlayerInfo) return;
    
    if (userPlayerInfo.team === 'spectator') {
        toast({ variant: 'destructive', title: 'Spectators cannot pick.' });
        return;
    }
    if (roomData.phase !== 'DRAFTING' || roomData.currentPicker !== userPlayerInfo.team) {
        toast({ variant: 'destructive', title: "It's not your team's turn to pick." });
        return;
    }
    
    const picksByMyTeamThisTurn = draftPicks.filter(p => p.team === userPlayerInfo.team && p.pickOrder > (roomData.turn === 0 ? 0 : roomData.pickOrder?.[roomData.turn - 1]?.picks || 0)).length;
    
    if(draftPicks.some(p => p.pickedBy === user.uid)) {
        toast({ variant: 'destructive', title: 'You have already picked a character.' });
        return;
    }

    const newPickRef = doc(collection(firestore, `rooms/${roomId}/picks`));
    const pickData: Omit<DraftPick, 'id'> = {
        ...character,
        characterId: character.id,
        pickedBy: user.uid,
        team: userPlayerInfo.team,
        pickOrder: draftPicks.length + 1,
    };
    
    setDocumentNonBlocking(newPickRef, pickData, {});

    toast({ title: 'Character Picked!', description: `You picked ${character.name}.` });
    dispatch({type: 'LOG', message: `${userPlayerInfo.nickname} picked ${character.name}.`});
  };
  
  const handleSelectSuperArt = async (art: SuperArt) => {
    if(!firestore || !user || !draftPicks) return;
    const myPick = draftPicks.find(p => p.pickedBy === user.uid);
    if (!myPick || !myPick.id) {
      toast({variant: 'destructive', title: 'Cannot select Super Art', description: "You haven't picked a character yet or your pick is not saved."});
      return;
    }
    const pickRef = doc(firestore, `rooms/${roomId}/picks`, myPick.id);
    await updateDocumentNonBlocking(pickRef, { superArtId: art.id });
    toast({title: 'Super Art Locked In!'});
    
    // Check if all players have selected a super art
    const allPlayersWithPicks = players?.filter(p => p.team !== 'spectator' && draftPicks.some(dp => dp.pickedBy === p.uid));
    const allPicksWithSuperArt = draftPicks.filter(p => p.superArtId);
    
    if (allPlayersWithPicks && allPicksWithSuperArt && allPlayersWithPicks.length === allPicksWithSuperArt.length + 1 && user.uid === roomData?.adminId) {
        updateDocumentNonBlocking(roomRef!, { phase: 'REVEAL' });
        dispatch({type: 'LOG', message: 'All Super Arts selected! The final reveal!'});
    }
  }

  const handleCoinFlipResult = (winner: TeamId) => {
    if(user?.uid === roomData?.adminId && roomRef && roomData) {
        const pickOrder = getPickOrder(roomData.playersPerTeam, winner);
        updateDocumentNonBlocking(roomRef, { 
            phase: 'DRAFTING', 
            firstPicker: winner, 
            pickOrder: pickOrder,
            turn: 0,
            currentPicker: pickOrder[0].team,
            picksPerTurn: pickOrder[0].picks,
            timeLeft: DRAFT_PICK_TIME,
            maxTime: DRAFT_PICK_TIME,
        });
        const winnerTeamName = roomData[winner === 'team1' ? 'team1Name' : 'team2Name'];
        dispatch({type: 'LOG', message: `Team ${winnerTeamName} won the toss and will pick first!`});
    }
  }
  
  if (isRoomLoading || arePlayersLoading || arePicksLoading || isUserLoading) {
      return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-primary" /></div>;
  }
  if (!roomData) {
      return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <p className='text-2xl font-headline'>Room not found or has been closed.</p>
            <Button onClick={() => router.push('/dashboard')}>Return to Lobby</Button>
        </div>
      );
  }

  const team1Players = players?.filter(p => p.team === 'team1') || [];
  const team2Players = players?.filter(p => p.team === 'team2') || [];
  const spectators = players?.filter(p => p.team === 'spectator') || [];

  const team1Picks = draftPicks?.filter(p => p.team === 'team1') || [];
  const team2Picks = draftPicks?.filter(p => p.team === 'team2') || [];
  const bannedCharacterIds = draftPicks?.map(p => p.characterId) || [];
  
  const getPhaseText = () => {
    switch (roomData.phase) {
      case 'PREP': return `Waiting for players...`;
      case 'COIN_FLIP': return 'Draft starting...';
      case 'DRAFTING': return 'Picking Phase';
      case 'SUPER_ART': return 'Super Art Selection';
      case 'REVEAL': return 'The Reveal';
      case 'FINISHED': return 'Room Closing In';
      case 'CANCELED': return 'Draft Canceled';
      default: return 'Draft in Progress';
    }
  };
  
  const allFinalPicks = draftPicks?.map(pick => {
    const superArt = SUPER_ARTS.find(sa => sa.id === pick.superArtId);
    return { ...pick, superArt: superArt || null };
  }) || [];
  
  const handleCompleteReveal = () => {
    if (user?.uid === roomData?.adminId && roomRef) {
        updateDocumentNonBlocking(roomRef, { phase: 'FINISHED', timeLeft: ROOM_CLOSE_TIME, maxTime: ROOM_CLOSE_TIME });
    }
  }

  const getInitials = (name: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader />
      <main className="flex-grow container py-4 md:py-8 flex flex-col gap-4">
        <div className="flex justify-between items-start">
            <DraftTimer
            phaseText={getPhaseText()}
            timeLeft={roomData.timeLeft || 0}
            maxTime={roomData.maxTime || 1}
            currentTeamName={roomData.currentPicker ? roomData[roomData.currentPicker === 'team1' ? 'team1Name': 'team2Name'] : null}
            currentTeamId={roomData.currentPicker || null}
            />
            <Button variant="destructive" onClick={handleLeaveRoom}>
                <LogOut className="mr-2" /> Leave Room
            </Button>
        </div>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr] gap-4">
          <TeamDisplay teamName={roomData.team1Name} teamId="team1" teamLogo={roomData.team1Logo} players={team1Players} picks={team1Picks} isPicking={roomData.currentPicker === 'team1'} maxPlayers={roomData.playersPerTeam} />
          
          <div className="flex flex-col gap-4 items-center justify-center">
            {roomData.phase === 'COIN_FLIP' && roomData.timeLeft! > 0 && <p className="text-2xl font-bold">Draft starts in {roomData.timeLeft}...</p>}
            {roomData.phase === 'COIN_FLIP' && roomData.timeLeft! <= 0 && <CoinFlip onComplete={handleCoinFlipResult} />}

            {roomData.phase === 'DRAFTING' && (
                <div className="grid grid-cols-4 gap-2 p-2">
                    {CHARACTERS.map(char => (
                        <CharacterSquare
                            key={char.id}
                            character={char}
                            isPicked={bannedCharacterIds.includes(char.id)}
                            onClick={() => handlePickCharacter(char)}
                        />
                    ))}
                </div>
            )}
             {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team !== 'spectator' && (
                <SuperArtSelector onSelect={handleSelectSuperArt} isSubmitting={!!(draftPicks?.find(p => p.pickedBy === user?.uid)?.superArtId)} />
            )}
            {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team === 'spectator' && (
                <SuperArtSpectatorView allPicks={allFinalPicks} />
            )}
             {roomData.phase === 'PREP' && (
                 <Card className="w-full h-full flex flex-col items-center justify-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Waiting Room</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p>Waiting for teams to fill up before the draft begins.</p>
                        <Loader2 className="animate-spin mx-auto mt-4" />
                    </CardContent>
                 </Card>
             )}
          </div>
          
          <TeamDisplay teamName={roomData.team2Name} teamId="team2" teamLogo={roomData.team2Logo} players={team2Players} picks={team2Picks} isPicking={roomData.currentPicker === 'team2'} maxPlayers={roomData.playersPerTeam}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><Users /> Spectators ({spectators.length}/{roomData.spectatorLimit})</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    {spectators.length > 0 ? spectators.map(spec => (
                        <div key={spec.uid} className="flex items-center gap-2" title={spec.nickname}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={spec.photoURL || undefined} />
                                <AvatarFallback>{getInitials(spec.nickname)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate hidden sm:inline">{spec.nickname}</span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground">No spectators yet.</p>}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-xl flex items-center gap-2"><History /> Draft Log</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-24 w-full">
                        <div className="space-y-2 text-sm">
                            {state.log.length > 0 ? state.log.map((log, i) => <p key={i}>{log}</p>) : <p className="text-sm text-muted-foreground">Draft has not started.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
             </Card>
        </div>
      </main>
      {roomData.phase === 'REVEAL' && allFinalPicks.length > 0 && (
         <DramaticReveal
          team1SuperArt={allFinalPicks.find(p => p.team === 'team1' && p.superArt)?.superArt || SUPER_ARTS[0]}
          team2SuperArt={allFinalPicks.find(p => p.team === 'team2' && p.superArt)?.superArt || SUPER_ARTS[1]}
          allPicks={allFinalPicks}
          onComplete={handleCompleteReveal}
         />
      )}
       <JoinRoomDialog 
         isOpen={isJoinDialogOpen}
         onJoin={handleJoin}
         roomData={roomData}
         players={players || []}
       />
       <AlertDialog open={roomData.phase === 'CANCELED'}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Draft Canceled</AlertDialogTitle>
                    <AlertDialogDescription>
                        The draft has been canceled because a player left the room. You will be returned to the lobby.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push('/dashboard')}>Return to Lobby</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
       <AlertDialog open={roomData.phase === 'FINISHED'}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">Draft Finished!</AlertDialogTitle>
                    <AlertDialogDescription>
                        The draft is complete. This room will close automatically in {roomData.timeLeft ? `${Math.floor(roomData.timeLeft / 60)}m ${roomData.timeLeft % 60}s` : '...'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push('/dashboard')}>Return to Lobby</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
