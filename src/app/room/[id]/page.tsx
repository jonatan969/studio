'use client';

import { PageHeader } from '@/components/page-header';
import { CHARACTERS, Character, SUPER_ARTS, SuperArt } from '@/lib/game-data';
import { useEffect, useReducer, useState, useCallback, useMemo } from 'react';
import { TeamDisplay } from '@/components/room/team-display';
import { CharacterSquare } from '@/components/room/character-square';
import { DraftTimer } from '@/components/room/draft-timer';
import { DRAFT_PICK_TIME, SUPER_ART_PICK_TIME, ROOM_CLOSE_TIME, DRAFT_START_TIMER, getPickOrder } from '@/lib/constants';
import { SuperArtSelector } from '@/components/room/super-art-selector';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DramaticReveal } from '@/components/room/dramatic-reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Loader2, LogOut, ShieldAlert, Users, Swords } from 'lucide-react';
import { CoinFlip } from '@/components/room/coin-flip';
import { SuperArtSpectatorView } from '@/components/room/super-art-spectator-view';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Room, RoomPlayer, DraftPick } from '@/lib/types';
import { doc, collection, deleteDoc } from 'firebase/firestore';
import { JoinRoomDialog } from '@/components/room/join-room-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SwitchTeamDialog } from '@/components/room/switch-team-dialog';


type TeamId = 'team1' | 'team2';

interface DraftState {
  log: string[];
}

function draftReducer(state: DraftState, action: {type: 'LOG', message: string}): DraftState {
  switch (action.type) {
    case 'LOG':
      // Prevent duplicate logs
      if (state.log[0] === action.message) return state;
      return { ...state, log: [action.message, ...state.log] };
    default:
      return state;
  }
}

export default function RoomPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const roomId = params.id;
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
  const [isSwitchTeamDialogOpen, setSwitchTeamDialogOpen] = useState(false);
  
  const userPlayerInfo = useMemo(() => players?.find(p => p.uid === user?.uid), [players, user]);

  // Admin leaves -> close room effect
  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (user?.uid === roomData?.adminId && roomRef) {
         try {
           await deleteDoc(roomRef);
         } catch (e) {
            // This might fail if the browser closes too quickly, but it's a best-effort
         }
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);

    // This is a backup for when beforeunload doesn't fire (e.g., tab crash)
    // We check if the admin is still in the players list. If not, and we are the new admin, we take over.
    // This is a simplified version. A robust solution would use Cloud Functions and presence detection.
    const adminStillInRoom = players?.some(p => p.uid === roomData?.adminId);
    if(roomData && !adminStillInRoom && roomData.phase !== 'FINISHED' && roomData.phase !== 'CANCELED') {
        // Find a new admin (e.g., the first player)
        const newAdmin = players?.find(p => p.team !== 'spectator');
        if (newAdmin && newAdmin.uid === user?.uid) {
            updateDocumentNonBlocking(roomRef!, { adminId: newAdmin.uid });
            toast({ title: "El admin ha abandonado", description: "Has sido ascendido a nuevo administrador de la sala."});
        }
    }


    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user?.uid, roomData, roomRef, players, toast]);

  const handleLeaveRoom = useCallback(async () => {
    if (!user || !firestore || !userPlayerInfo || !roomData || !roomRef) return;

    // Admin leaving, close the whole room
    if (roomData.adminId === user.uid) {
      toast({ title: 'Sala Cerrada', description: 'Como administrador, has cerrado la sala.' });
      await deleteDoc(roomRef);
      router.push('/dashboard');
      return;
    }
    
    // Regular user leaving
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    await deleteDoc(playerRef);

    // If a player leaves mid-draft, cancel it
    if (userPlayerInfo.team !== 'spectator' && roomData.phase !== 'PREP' && roomData.phase !== 'FINISHED' && roomData.phase !== 'CANCELED') {
       await updateDocumentNonBlocking(roomRef, { phase: 'CANCELED' });
       dispatch({type: 'LOG', message: `${userPlayerInfo.nickname} se ha ido, cancelando el draft.`});
    }

    router.push('/dashboard');

  }, [user, firestore, userPlayerInfo, roomData, roomId, router, roomRef, toast]);

  // Handle joining a room for the first time
  useEffect(() => {
    if (!isRoomLoading && roomData && !arePlayersLoading && user && !userPlayerInfo) {
      setJoinDialogOpen(true);
    }
  }, [isRoomLoading, arePlayersLoading, user, userPlayerInfo, roomData]);

  const handleJoin = (team: 'team1' | 'team2' | 'spectator') => {
    if (!user || !firestore || !roomData) return;
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    const playerData: RoomPlayer = {
        uid: user.uid,
        nickname: user.displayName || 'Anón.',
        photoURL: user.photoURL || null,
        team: team,
        isReady: false,
    };
    setDocumentNonBlocking(playerRef, playerData, {});
    setJoinDialogOpen(false);
    toast({title: `Te uniste como ${team === 'spectator' ? 'espectador' : `al equipo ${team === 'team1' ? roomData.team1Name : roomData.team2Name}`}`});
  };

  const handleSwitchTeam = (team: 'team1' | 'team2' | 'spectator') => {
    if (!user || !firestore || !userPlayerInfo || !roomData) return;
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    updateDocumentNonBlocking(playerRef, { team });
    setSwitchTeamDialogOpen(false);
    toast({title: `Te cambiaste a ${team === 'spectator' ? 'espectador' : `al equipo ${team === 'team1' ? roomData.team1Name : roomData.team2Name}`}`});
  };

  // Main Game State Machine (driven by admin)
  useEffect(() => {
      if (user?.uid !== roomData?.adminId || !roomRef || !players || !roomData) return;

      const team1Players = players.filter(p => p.team === 'team1').length;
      const team2Players = players.filter(p => p.team === 'team2').length;

      // PREP -> COIN_FLIP
      if (roomData.phase === 'PREP' && team1Players === roomData.playersPerTeam && team2Players === roomData.playersPerTeam) {
        if (roomData.timeLeft !== DRAFT_START_TIMER) {
            updateDocumentNonBlocking(roomRef, { 
                phase: 'COIN_FLIP', 
                timeLeft: DRAFT_START_TIMER,
                maxTime: DRAFT_START_TIMER,
            });
            dispatch({type: 'LOG', message: `¡Los equipos están completos! La cuenta atrás ha comenzado.`});
        }
      } else if (roomData.phase === 'COIN_FLIP' && (team1Players !== roomData.playersPerTeam || team2Players !== roomData.playersPerTeam)) {
          // A player left, go back to PREP
          updateDocumentNonBlocking(roomRef, { phase: 'PREP', timeLeft: 0, maxTime: 0 });
          dispatch({type: 'LOG', message: `Un jugador se ha ido. Esperando a que los equipos se llenen de nuevo.`});
      }

      // Timer tick down
      const timer = setInterval(() => {
        if(!roomData || roomData.timeLeft === undefined || roomData.timeLeft <= 0) {
            clearInterval(timer);
            return;
        };

        const newTimeLeft = roomData.timeLeft - 1;
        updateDocumentNonBlocking(roomRef, { timeLeft: newTimeLeft });

        if (newTimeLeft <= 0) {
             // Handle timer expiration based on phase
            switch(roomData.phase) {
                case 'COIN_FLIP':
                    // The onComplete of the coin flip will trigger DRAFTING phase
                    break;
                case 'DRAFTING':
                    // Auto-pick logic
                    if (!roomData.currentPicker || !draftPicks) break;
                    const currentTeamPlayers = players.filter(p => p.team === roomData.currentPicker);
                    const playersWhoHaventPicked = currentTeamPlayers.filter(p => !draftPicks.some(dp => dp.pickedBy === p.uid));
                    const pickedCharacterIds = draftPicks.map(p => p.characterId) || [];
                    const availableCharacters = CHARACTERS.filter(c => !pickedCharacterIds.includes(c.id));
                    
                    if (playersWhoHaventPicked.length > 0 && availableCharacters.length > 0 && firestore) {
                        const randomPlayer = playersWhoHaventPicked[Math.floor(Math.random() * playersWhoHaventPicked.length)];
                        const randomCharacter = availableCharacters[Math.floor(Math.random() * availableCharacters.length)];
                        const newPickRef = doc(collection(firestore, `rooms/${roomId}/picks`));
                        const pickData: Omit<DraftPick, 'id'> = {
                            ...randomCharacter,
                            characterId: randomCharacter.id,
                            pickedBy: randomPlayer.uid,
                            nickname: randomPlayer.nickname,
                            team: roomData.currentPicker,
                            pickOrder: (draftPicks.length || 0) + 1,
                        };
                        setDocumentNonBlocking(newPickRef, pickData, {});
                        dispatch({type: 'LOG', message: `¡Se acabó el tiempo! ${randomCharacter.name} fue auto-seleccionado para ${randomPlayer.nickname}.`});
                    }
                    break;
                case 'SUPER_ART':
                     updateDocumentNonBlocking(roomRef, { phase: 'REVEAL' });
                     dispatch({type: 'LOG', message: '¡El tiempo de selección de Super Art ha terminado! Revelando elecciones...'});
                     break;
                case 'FINISHED':
                     deleteDoc(roomRef);
                     router.push('/dashboard');
                     break;
                case 'CANCELED':
                     setTimeout(() => {
                        deleteDoc(roomRef);
                        router.push('/dashboard');
                     }, 15000);
                     break;
            }
        }
      }, 1000);

      return () => clearInterval(timer);

  }, [roomData, players, draftPicks, user, roomRef, firestore, roomId, router]);

  // Client-side turn advancement logic
  useEffect(() => {
    if(!firestore || !roomRef || !roomData || roomData.phase !== 'DRAFTING' || !draftPicks || !roomData.pickOrder || user?.uid !== roomData?.adminId) return;

    const totalPicksMade = draftPicks.length;
    if (roomData.turn === undefined) return;
    
    const picksExpectedBeforeThisTurn = roomData.turn > 0
      ? roomData.pickOrder.slice(0, roomData.turn).reduce((acc, turnInfo) => acc + turnInfo.picks, 0)
      : 0;

    const picksExpectedThisTurn = roomData.pickOrder[roomData.turn]?.picks;
    if (picksExpectedThisTurn === undefined) return;

    const picksMadeThisTurn = totalPicksMade - picksExpectedBeforeThisTurn;

    if (picksMadeThisTurn >= picksExpectedThisTurn) {
         const newTurn = roomData.turn + 1;

         if (newTurn >= roomData.pickOrder.length) {
              updateDocumentNonBlocking(roomRef, {
                  phase: 'SUPER_ART',
                  timeLeft: SUPER_ART_PICK_TIME,
                  maxTime: SUPER_ART_PICK_TIME,
                  currentPicker: null,
                  turn: null,
                  picksPerTurn: null,
              });
              dispatch({type: 'LOG', message: '¡Todos los personajes seleccionados! Hora de elegir los Super Arts.'});
         } else {
             const nextTurnInfo = roomData.pickOrder[newTurn];
             updateDocumentNonBlocking(roomRef, {
                 turn: newTurn,
                 currentPicker: nextTurnInfo.team,
                 picksPerTurn: nextTurnInfo.picks,
                 timeLeft: DRAFT_PICK_TIME,
                 maxTime: DRAFT_PICK_TIME,
             });
             const nextTeamName = nextTurnInfo.team === 'team1' ? roomData.team1Name : roomData.team2Name;
             dispatch({type: 'LOG', message: `Es el turno de ${nextTeamName} para elegir.`});
         }
    }
  }, [draftPicks, roomData, firestore, user, roomRef]);


  const handlePickCharacter = (character: Character) => {
    if (!user || !roomData || !players || !draftPicks || !firestore || !userPlayerInfo || !roomData.pickOrder || roomData.turn === undefined || roomData.picksPerTurn === undefined) return;
    
    if (userPlayerInfo.team === 'spectator') {
        toast({ variant: 'destructive', title: 'Los espectadores no pueden elegir.' });
        return;
    }
    if (roomData.phase !== 'DRAFTING' || roomData.currentPicker !== userPlayerInfo.team) {
        toast({ variant: 'destructive', title: "No es el turno de tu equipo para elegir." });
        return;
    }
    
    if(draftPicks.some(p => p.pickedBy === user.uid)) {
        toast({ variant: 'destructive', title: 'Ya has elegido un personaje.' });
        return;
    }
    
    const totalPicksMade = draftPicks.length;
    const picksExpectedBeforeThisTurn = roomData.turn > 0
      ? roomData.pickOrder.slice(0, roomData.turn).reduce((acc, turnInfo) => acc + turnInfo.picks, 0)
      : 0;

    const picksMadeThisTurn = totalPicksMade - picksExpectedBeforeThisTurn;

    if (picksMadeThisTurn >= roomData.picksPerTurn) {
        toast({ variant: 'destructive', title: "Tu equipo ya ha elegido para este turno." });
        return;
    }

    const newPickRef = doc(collection(firestore, `rooms/${roomId}/picks`));
    const pickData: Omit<DraftPick, 'id'> = {
        ...character,
        characterId: character.id,
        pickedBy: user.uid,
        nickname: userPlayerInfo.nickname,
        team: userPlayerInfo.team,
        pickOrder: draftPicks.length + 1,
    };
    
    setDocumentNonBlocking(newPickRef, pickData, {});

    toast({ title: '¡Personaje Elegido!', description: `Elegiste a ${character.name}.` });
    dispatch({type: 'LOG', message: `${userPlayerInfo.nickname} eligió a ${character.name}.`});
  };
  
  const handleSelectSuperArt = async (art: SuperArt) => {
    if(!firestore || !user || !draftPicks || !roomData || !roomRef) return;
    const myPick = draftPicks.find(p => p.pickedBy === user.uid);
    if (!myPick || !myPick.id) {
      toast({variant: 'destructive', title: 'No se puede seleccionar Super Art', description: "Aún no has elegido un personaje."});
      return;
    }
    const pickRef = doc(firestore, `rooms/${roomId}/picks`, myPick.id);
    await updateDocumentNonBlocking(pickRef, { superArtId: art.id });
    toast({title: '¡Super Art Confirmado!'});
    
    // Check if all players have selected a super art
    const allPicksNowHaveSuperArt = draftPicks.every(p => p.superArtId || p.id === myPick.id);

    if (allPicksNowHaveSuperArt) {
        updateDocumentNonBlocking(roomRef, { phase: 'REVEAL' });
        dispatch({type: 'LOG', message: '¡Todos los Super Arts seleccionados! ¡La revelación final!'});
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
        const winnerTeamName = winner === 'team1' ? roomData.team1Name : roomData.team2Name;
        dispatch({type: 'LOG', message: `¡${winnerTeamName} ganó el sorteo y elegirá primero!`});
    }
  }
  
  if (isRoomLoading || arePlayersLoading || arePicksLoading || isUserLoading) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <PageHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!roomData) {
      return (
        <div className="flex h-screen items-center justify-center flex-col gap-4">
            <p className='text-2xl font-headline'>Sala no encontrada o ha sido cerrada.</p>
            <Button onClick={() => router.push('/dashboard')}>Volver al Lobby</Button>
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
    if (!roomData) return '';
    switch (roomData.phase) {
      case 'PREP': return `Esperando jugadores...`;
      case 'COIN_FLIP': return `El draft comienza en...`;
      case 'DRAFTING': return 'Fase de Elección';
      case 'SUPER_ART': return 'Selección de Super Art';
      case 'REVEAL': return 'La Revelación';
      case 'FINISHED': return 'La sala se cerrará en';
      case 'CANCELED': return 'Draft Cancelado';
      default: return 'Draft en progreso';
    }
  };
  
  const allFinalPicks = draftPicks?.map(pick => {
    const superArt = SUPER_ARTS.find(sa => sa.id === pick.superArtId);
    return { ...pick, superArt: superArt || null };
  }) || [];
  
  const handleCompleteReveal = () => {
    if (user?.uid === roomData?.adminId && roomRef) {
        if(roomData.phase !== 'FINISHED') {
            updateDocumentNonBlocking(roomRef, { phase: 'FINISHED', timeLeft: ROOM_CLOSE_TIME, maxTime: ROOM_CLOSE_TIME });
        }
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const myPick = user ? draftPicks?.find(p => p.pickedBy === user.uid) : null;
  const isMySuperArtSubmitted = !!myPick?.superArtId;

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-4 md:py-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <DraftTimer
                phaseText={getPhaseText()}
                timeLeft={roomData.timeLeft || 0}
                maxTime={roomData.maxTime || 1}
                currentTeamName={roomData.currentPicker ? (roomData.currentPicker === 'team1' ? roomData.team1Name : roomData.team2Name) : null}
                currentTeamId={roomData.currentPicker || null}
            />
             <div className="flex items-center gap-2 self-end sm:self-center">
                {userPlayerInfo && roomData.phase === 'PREP' && (
                    <Button variant="outline" size="sm" onClick={() => setSwitchTeamDialogOpen(true)}>
                        <Swords className="mr-2 h-4 w-4" /> Cambiar Equipo
                    </Button>
                )}
                <Button variant="destructive" size="sm" onClick={handleLeaveRoom}>
                    <LogOut className="mr-2 h-4 w-4" /> Salir de la Sala
                </Button>
            </div>
        </div>
        <div className="flex-grow grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] xl:grid-cols-[320px_1fr_320px] gap-4">
          <TeamDisplay teamName={roomData.team1Name} teamId="team1" teamLogo={roomData.team1Logo} players={team1Players} picks={team1Picks} isPicking={roomData.currentPicker === 'team1'} maxPlayers={roomData.playersPerTeam} />
          
          <div className="flex flex-col gap-4 items-center justify-center min-h-[300px] lg:min-h-0">
            {roomData.phase === 'COIN_FLIP' && roomData.timeLeft !== undefined && roomData.timeLeft <= 0 && <CoinFlip onComplete={handleCoinFlipResult} team1Name={roomData.team1Name} team2Name={roomData.team2Name}/>}
            
            {roomData.phase === 'DRAFTING' && (
                <div className="w-full h-full p-1 sm:p-2 border rounded-lg bg-card/50">
                    <ScrollArea className="h-[400px] sm:h-[500px] lg:h-full">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2 p-1">
                            {CHARACTERS.map(char => (
                                <CharacterSquare
                                    key={char.id}
                                    character={char}
                                    isPicked={bannedCharacterIds.includes(char.id)}
                                    onClick={() => handlePickCharacter(char)}
                                />
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            )}
             {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team !== 'spectator' && (
                <SuperArtSelector onSelect={handleSelectSuperArt} isSubmitting={isMySuperArtSubmitted} />
            )}
            {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team === 'spectator' && (
                <SuperArtSpectatorView allPicks={allFinalPicks} team1Name={roomData.team1Name} team2Name={roomData.team2Name} />
            )}
             {roomData.phase === 'PREP' && (
                 <Card className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Sala de Espera</CardTitle>
                    </CardHeader>
                    <CardContent className='flex flex-col items-center gap-4'>
                        <p className="text-muted-foreground">Esperando a que los equipos se llenen para comenzar el draft.</p>
                        <Loader2 className="animate-spin" />
                    </CardContent>
                 </Card>
             )}
          </div>
          
          <TeamDisplay teamName={roomData.team2Name} teamId="team2" teamLogo={roomData.team2Logo} players={team2Players} picks={team2Picks} isPicking={roomData.currentPicker === 'team2'} maxPlayers={roomData.playersPerTeam}/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg sm:text-xl flex items-center gap-2"><Users /> Espectadores ({spectators.length}/{roomData.spectatorLimit})</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2 sm:gap-4">
                    {spectators.length > 0 ? spectators.map(spec => (
                        <div key={spec.uid} className="flex items-center gap-2" title={spec.nickname}>
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={spec.photoURL || undefined} />
                                <AvatarFallback>{getInitials(spec.nickname)}</AvatarFallback>
                            </Avatar>
                            <span className="truncate hidden sm:inline text-sm">{spec.nickname}</span>
                        </div>
                    )) : <p className="text-sm text-muted-foreground px-2">Aún no hay espectadores.</p>}
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-lg sm:text-xl flex items-center gap-2"><History /> Registro del Draft</CardTitle>
                </CardHeader>
                <CardContent>
                    <ScrollArea className="h-24 w-full">
                        <div className="space-y-2 text-sm pr-4">
                            {state.log.length > 0 ? state.log.map((log, i) => <p key={i}>{log}</p>) : <p className="text-sm text-muted-foreground">El draft aún no ha comenzado.</p>}
                        </div>
                    </ScrollArea>
                </CardContent>
             </Card>
        </div>
      </main>
      {roomData.phase === 'REVEAL' && allFinalPicks.length > 0 && (
         <DramaticReveal
          team1Name={roomData.team1Name}
          team2Name={roomData.team2Name}
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
       <SwitchTeamDialog
          isOpen={isSwitchTeamDialogOpen}
          onClose={() => setSwitchTeamDialogOpen(false)}
          onSwitchTeam={handleSwitchTeam}
          roomData={roomData}
          players={players || []}
       />
       <AlertDialog open={roomData.phase === 'CANCELED'}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2"><ShieldAlert className="text-destructive"/> Draft Cancelado</AlertDialogTitle>
                    <AlertDialogDescription>
                        El draft ha sido cancelado porque un jugador abandonó la sala. Serás devuelto al lobby en 15 segundos.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push('/dashboard')}>Volver al Lobby Ahora</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
       <AlertDialog open={roomData.phase === 'FINISHED'}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">¡Draft Finalizado!</AlertDialogTitle>
                    <AlertDialogDescription>
                        El draft está completo. Esta sala se cerrará automáticamente en {roomData.timeLeft ? `${Math.floor(roomData.timeLeft / 60)}m ${roomData.timeLeft % 60}s` : '...'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => router.push('/dashboard')}>Volver al Lobby</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}

    