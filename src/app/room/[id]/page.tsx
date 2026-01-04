'use client';

import * as React from 'react';
import { useReducer, useCallback, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { TeamDisplay } from '@/components/room/team-display';
import { DraftTimer } from '@/components/room/draft-timer';
import { DRAFT_PICK_TIME, SUPER_ART_PICK_TIME, ROOM_CLOSE_TIME, DRAFT_START_TIMER, getPickOrder } from '@/lib/constants';
import { SuperArtSelector } from '@/components/room/super-art-selector';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Loader2, LogOut, ShieldAlert, Users, Swords } from 'lucide-react';
import { CoinFlip } from '@/components/room/coin-flip';
import { SuperArtSpectatorView } from '@/components/room/super-art-spectator-view';
import { useDoc, useUser, useFirestore, useMemoFirebase, updateDocumentNonBlocking, useCollection, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Room, RoomPlayer, DraftPick, Character, SuperArt, GameData } from '@/lib/types';
import { doc, deleteDoc, writeBatch, collection, CollectionReference, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { JoinRoomDialog } from '@/components/room/join-room-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SwitchTeamDialog } from '@/components/room/switch-team-dialog';
import { DramaticReveal } from '@/components/room/dramatic-reveal';
import { deleteSubcollection } from '@/lib/utils';
import { CharacterGrid } from '@/components/room/character-grid';


type TeamId = 'team1' | 'team2';

interface DraftState {
  log: string[];
}

function draftReducer(state: DraftState, action: {type: 'LOG', message: string}): DraftState {
  if (state.log[0] === action.message) return state;
  switch (action.type) {
    case 'LOG':
      return { ...state, log: [action.message, ...state.log] };
    default:
      return state;
  }
}

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params.id as string;
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const [state, dispatch] = useReducer(draftReducer, { log: ['Bienvenido a la sala de draft.'] });
  const [isJoinDialogOpen, setJoinDialogOpen] = React.useState(false);
  const [isSwitchTeamDialogOpen, setSwitchTeamDialogOpen] = React.useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [preselectedCharacter, setPreselectedCharacter] = useState<Character | null>(null);


  const roomRef = useMemoFirebase(() => firestore ? doc(firestore, 'rooms', roomId) : null, [firestore, roomId]);
  const { data: roomData, isLoading: isRoomLoading } = useDoc<Room>(roomRef);

  const playersRef = useMemoFirebase(() => firestore ? collection(firestore, 'rooms', roomId, 'players') as CollectionReference<RoomPlayer> : null, [firestore, roomId]);
  const { data: players, isLoading: arePlayersLoading } = useCollection<RoomPlayer>(playersRef);
  
  const gameDataRef = useMemoFirebase(() => firestore ? doc(firestore, 'game_data', 'static') : null, [firestore]);
  const { data: gameData, isLoading: isGameDataLoading } = useDoc<GameData>(gameDataRef);

  const characters = gameData?.characters || [];
  const superArts = gameData?.super_arts || [];

  const userPlayerInfo = useMemo(() => players?.find(p => p.uid === user?.uid), [players, user]);

  const allDataLoading = isRoomLoading || isUserLoading || arePlayersLoading || isGameDataLoading;

  const cleanupRoom = useCallback(async () => {
    if (!firestore || !roomId || !roomRef) return;
    try {
        await deleteSubcollection(firestore, `rooms/${roomId}/players`);
        await deleteDoc(roomRef);
    } catch (error) {
        console.error("Error cleaning up room:", error);
    }
  }, [firestore, roomId, roomRef]);

  const handleLeaveRoom = useCallback(async () => {
    if (!user || !roomData || !firestore) return;

    // Admin leaving cancels the room
    if (user.uid === roomData.adminId && roomData.phase !== 'FINISHED' && roomData.phase !== 'CANCELED') {
        await updateDocumentNonBlocking(roomRef, { phase: 'CANCELED' });
    } else {
        const playerDocRef = doc(firestore, 'rooms', roomId, 'players', user.uid);
        await deleteDocumentNonBlocking(playerDocRef);
    }
    
    router.push('/dashboard');
  }, [user, roomData, firestore, router, roomId, roomRef]);

  // Main timer effect driven by turnEndsAt
  React.useEffect(() => {
    const calculateTimeLeft = () => {
      if (roomData?.turnEndsAt) {
        const now = Date.now();
        const secondsLeft = Math.max(0, Math.floor((roomData.turnEndsAt - now) / 1000));
        setTimeLeft(secondsLeft);
      } else {
        setTimeLeft(0);
      }
    };
    
    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [roomData?.turnEndsAt]);

  React.useEffect(() => {
    if (!allDataLoading && roomData && user && !userPlayerInfo) {
      setJoinDialogOpen(true);
    }
  }, [allDataLoading, user, userPlayerInfo, roomData]);

  const handleJoin = (team: 'team1' | 'team2' | 'spectator') => {
    if (!user || !roomData || !firestore) return;
    const newPlayer: RoomPlayer = {
        uid: user.uid,
        nickname: user.displayName || 'Anón.',
        photoURL: user.photoURL || null,
        team: team,
        isReady: false,
    };
    const playerDocRef = doc(firestore, 'rooms', roomId, 'players', user.uid);
    setDocumentNonBlocking(playerDocRef, newPlayer);
    setJoinDialogOpen(false);
    toast({title: `Te uniste como ${team === 'spectator' ? 'espectador' : `al equipo ${team === 'team1' ? roomData.team1Name : roomData.team2Name}`}`});
  };

  const handleSwitchTeam = (team: 'team1' | 'team2' | 'spectator') => {
    if (!user || !roomData || !firestore) return;
    const playerDocRef = doc(firestore, 'rooms', roomId, 'players', user.uid);
    updateDocumentNonBlocking(playerDocRef, { team });
    setSwitchTeamDialogOpen(false);
    toast({title: `Te cambiaste a ${team === 'spectator' ? 'espectador' : `al equipo ${team === 'team1' ? roomData.team1Name : roomData.team2Name}`}`});
  };

  // Main Game State Machine (driven by admin)
  React.useEffect(() => {
      if (allDataLoading || !roomData || !roomRef || !players) return;
      if (user?.uid !== roomData?.adminId) return; // Only admin drives state changes

      // Rule: If room becomes empty (and not already finished/canceled), cancel it
      if (players.length === 0 && roomData.phase !== 'CANCELED' && roomData.phase !== 'FINISHED') {
        updateDocumentNonBlocking(roomRef, { phase: 'CANCELED', turnEndsAt: null });
        return;
      }

      // PREP -> COIN_FLIP
      if (roomData.phase === 'PREP') {
        const team1Players = players.filter(p => p.team === 'team1').length;
        const team2Players = players.filter(p => p.team === 'team2').length;
        if (team1Players === roomData.playersPerTeam && team2Players === roomData.playersPerTeam) {
            updateDocumentNonBlocking(roomRef, { phase: 'COIN_FLIP', turnEndsAt: Date.now() + DRAFT_START_TIMER * 1000 });
            dispatch({type: 'LOG', message: `¡Los equipos están completos! La cuenta atrás ha comenzado.`});
        }
      }
      
      // Handle automatic actions when timer runs out
      if (timeLeft <= 0 && roomData.turnEndsAt) {
          switch(roomData.phase) {
              case 'COIN_FLIP':
                  // Handled by coin flip component completion
                  break;
              case 'DRAFTING':
                  if (!roomData.pickOrder || roomData.turn === undefined || !roomData.picks || !roomData.currentPicker) break;

                  const picksThisTurn = roomData.pickOrder[roomData.turn].picks;
                  const picksMadeThisTurn = roomData.picks.filter(p => p.turn === roomData.turn).length;
                  const picksToAutoSelect = picksThisTurn - picksMadeThisTurn;

                  if(picksToAutoSelect <= 0) break;
                  
                  const currentTeamPlayers = players.filter(p => p.team === roomData.currentPicker);
                  const playersOnTeamWhoHaventPicked = currentTeamPlayers.filter(p => !roomData.picks.some(pick => pick.pickedBy === p.uid));
                  
                  if(playersOnTeamWhoHaventPicked.length > 0 && firestore) {
                    const pickedCharacterIds = roomData.picks.map(p => p.characterId);
                    const availableCharacters = characters.filter(c => !pickedCharacterIds.includes(c.id));
                    const newPicks: DraftPick[] = [];
                    
                    for(let i = 0; i < picksToAutoSelect; i++) {
                      const playerToPick = playersOnTeamWhoHaventPicked[i];
                      // Note: preselection auto-pick is handled client-side. This is the final fallback.
                      const randomCharacter = availableCharacters[i];

                      if (!playerToPick || !randomCharacter) continue;

                      const pickData: DraftPick = {
                          turn: roomData.turn,
                          characterId: randomCharacter.id,
                          name: randomCharacter.name,
                          role: randomCharacter.role,
                          image: randomCharacter.image,
                          hint: randomCharacter.hint,
                          description: randomCharacter.description,
                          pickedBy: playerToPick.uid,
                          nickname: playerToPick.nickname,
                          team: roomData.currentPicker,
                          pickOrder: roomData.picks.length + i + 1,
                      };
                      newPicks.push(pickData);
                      dispatch({type: 'LOG', message: `¡Se acabó el tiempo! ${randomCharacter.name} fue auto-seleccionado para ${playerToPick.nickname}.`});
                    }

                    if (newPicks.length > 0) {
                      updateDocumentNonBlocking(roomRef, { picks: arrayUnion(...newPicks) });
                    }
                  }
                  break;
              case 'SUPER_ART':
                   updateDocumentNonBlocking(roomRef, { phase: 'REVEAL', turnEndsAt: null });
                   dispatch({type: 'LOG', message: '¡El tiempo de selección de Super Art ha terminado! Revelando elecciones...'});
                   break;
              case 'FINISHED':
              case 'CANCELED':
                   cleanupRoom().then(() => router.push('/dashboard'));
                   break;
          }
      }

  }, [roomData, user, players, roomRef, firestore, router, characters, allDataLoading, cleanupRoom, timeLeft]);

  // Client-side turn advancement logic
  React.useEffect(() => {
    if(allDataLoading || !roomRef || !roomData || roomData.phase !== 'DRAFTING' || !roomData.picks || !roomData.pickOrder || user?.uid !== roomData.adminId || roomData.turn === undefined) return;

    const picksMadeThisTurn = roomData.picks.filter(p => p.turn === roomData.turn).length;
    const picksExpectedThisTurn = roomData.pickOrder[roomData.turn]?.picks;
    
    if (picksExpectedThisTurn === undefined) return;
    
    if (picksMadeThisTurn >= picksExpectedThisTurn) {
         const newTurn = roomData.turn + 1;
         const totalPlayers = roomData.playersPerTeam * 2;

         if (newTurn >= roomData.pickOrder.length || roomData.picks.length >= totalPlayers) {
              updateDocumentNonBlocking(roomRef, { phase: 'SUPER_ART', turnEndsAt: Date.now() + SUPER_ART_PICK_TIME * 1000, currentPicker: null });
              dispatch({type: 'LOG', message: '¡Todos los personajes seleccionados! Hora de elegir los Super Arts.'});
         } else {
             const nextTurnInfo = roomData.pickOrder[newTurn];
             updateDocumentNonBlocking(roomRef, { 
                turn: newTurn, 
                currentPicker: nextTurnInfo.team, 
                turnEndsAt: Date.now() + DRAFT_PICK_TIME * 1000,
            });
             const nextTeamName = nextTurnInfo.team === 'team1' ? roomData.team1Name : roomData.team2Name;
             dispatch({type: 'LOG', message: `Es el turno de ${nextTeamName} para elegir.`});
         }
    }
  }, [roomData, user, roomRef, allDataLoading]);

    // Client-side auto-pick from preselection
    React.useEffect(() => {
        if (timeLeft <= 0 && roomData?.phase === 'DRAFTING' && preselectedCharacter && canPick) {
            handlePickCharacter(preselectedCharacter);
        }
    }, [timeLeft, roomData?.phase, preselectedCharacter]);

  const handlePickCharacter = async (character: Character) => {
    if (allDataLoading || !user || !players || !roomData?.picks || !firestore || !userPlayerInfo || !roomData?.pickOrder || roomData.turn === undefined || !roomRef || !roomData) return;
    if (userPlayerInfo.team === 'spectator') { toast({ variant: 'destructive', title: 'Los espectadores no pueden elegir.' }); return; }
    if (roomData.phase !== 'DRAFTING' || roomData.currentPicker !== userPlayerInfo.team) { toast({ variant: 'destructive', title: "No es el turno de tu equipo para elegir." }); return; }
    
    if(roomData.picks.some(p => p.pickedBy === user.uid)) {
        toast({ variant: 'destructive', title: 'Ya has elegido un personaje.' }); 
        return;
    }
    
    const picksMadeThisTurnByMyTeam = roomData.picks.filter(p => p.turn === roomData.turn).length;
    const picksAllowedThisTurn = roomData.pickOrder[roomData.turn]?.picks || 0;
    
    if (picksMadeThisTurnByMyTeam >= picksAllowedThisTurn) {
        toast({ variant: 'destructive', title: "Tu equipo ya ha elegido el máximo para este turno." });
        return;
    }
    
    if (roomData.turn === undefined) {
        toast({ variant: 'destructive', title: "El draft no ha comenzado.", description: "El número de turno no está definido." });
        return;
    }

    const pickData: DraftPick = {
        turn: roomData.turn,
        characterId: character.id,
        name: character.name,
        role: character.role,
        image: character.image,
        hint: character.hint,
        description: character.description,
        pickedBy: user.uid,
        nickname: userPlayerInfo.nickname,
        team: userPlayerInfo.team,
        pickOrder: roomData.picks.length + 1,
    };
    
    await updateDocumentNonBlocking(roomRef, { picks: arrayUnion(pickData) });

    toast({ title: '¡Personaje Elegido!', description: `Elegiste a ${character.name}.` });
    dispatch({type: 'LOG', message: `${userPlayerInfo.nickname} eligió a ${character.name}.`});
    setPreselectedCharacter(null);
  };
  
  const handleSelectSuperArt = async (art: SuperArt) => {
    if(!firestore || !user || !roomData?.picks || !roomData || !roomRef || !players) return;
    const myPickIndex = roomData.picks.findIndex(p => p.pickedBy === user.uid);
    if (myPickIndex === -1) { toast({variant: 'destructive', title: 'No se puede seleccionar Super Art', description: "Aún no has elegido un personaje."}); return; }

    const updatedPicks = [...roomData.picks];
    updatedPicks[myPickIndex].superArtId = art.id;

    await updateDocumentNonBlocking(roomRef, { picks: updatedPicks });
    
    toast({title: '¡Super Art Confirmado!'});
    
    const playersWithPicks = players.filter(p => p.team !== 'spectator');
    const allPlayersPickedSuperArt = updatedPicks.filter(p => p.superArtId).length >= playersWithPicks.length;

    if (allPlayersPickedSuperArt && user.uid === roomData.adminId) { 
        updateDocumentNonBlocking(roomRef, { phase: 'REVEAL', turnEndsAt: null });
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
            turnEndsAt: Date.now() + DRAFT_PICK_TIME * 1000,
        });
        const winnerTeamName = winner === 'team1' ? roomData.team1Name : roomData.team2Name;
        dispatch({type: 'LOG', message: `¡${winnerTeamName} ganó el sorteo y elegirá primero!`});
    }
  }
  
  if (allDataLoading || !players) {
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

  const draftPicks = roomData.picks || [];
  const team1Picks = draftPicks.filter(p => p.team === 'team1') || [];
  const team2Picks = draftPicks.filter(p => p.team === 'team2') || [];
  const bannedCharacterIds = draftPicks.map(p => p.characterId) || [];
  
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
  
  const allFinalPicks = draftPicks.map(pick => {
    const character = characters.find(c => c.id === pick.characterId);
    const superArt = superArts?.find(sa => sa.id === pick.superArtId);
    return { ...pick, ...character, superArt: superArt || null };
  }) || [];
  
  const handleCompleteReveal = () => {
    if (user?.uid === roomData?.adminId && roomRef) {
        if(roomData.phase !== 'FINISHED') {
            updateDocumentNonBlocking(roomRef, { phase: 'FINISHED', turnEndsAt: Date.now() + ROOM_CLOSE_TIME * 1000 });
        }
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const myPick = user ? draftPicks.find(p => p.pickedBy === user.uid) : null;
  const isMySuperArtSubmitted = !!myPick?.superArtId;

  const canPick = userPlayerInfo && userPlayerInfo.team !== 'spectator' &&
                  roomData.phase === 'DRAFTING' && roomData.currentPicker === userPlayerInfo.team &&
                  !draftPicks.some(p => p.pickedBy === user.uid) &&
                  (roomData.picks?.filter(p => p.turn === roomData.turn).length || 0) < (roomData.pickOrder?.[roomData.turn || 0]?.picks || 0);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-4 md:py-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <DraftTimer
                phaseText={getPhaseText()}
                timeLeft={timeLeft}
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
            {roomData.phase === 'COIN_FLIP' && timeLeft <= 0 && <CoinFlip onComplete={handleCoinFlipResult} team1Name={roomData.team1Name} team2Name={roomData.team2Name}/>}
            
            {roomData.phase === 'DRAFTING' && (
                <CharacterGrid
                    characters={characters}
                    bannedCharacterIds={bannedCharacterIds}
                    preselectedCharacter={preselectedCharacter}
                    onPreselect={setPreselectedCharacter}
                    onConfirmPick={handlePickCharacter}
                    canPick={canPick}
                />
            )}
             {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team !== 'spectator' && superArts && myPick && (
                <SuperArtSelector 
                  superArts={superArts.filter(sa => sa.characterId === myPick.characterId)} 
                  onSelect={handleSelectSuperArt} 
                  isSubmitting={isMySuperArtSubmitted} 
                />
            )}
            {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team === 'spectator' && (
                <SuperArtSpectatorView allPicks={allFinalPicks} team1Name={roomData.team1Name} team2Name={roomData.team2Name} />
            )}
             {roomData.phase === 'REVEAL' && allFinalPicks.length > 0 && (
                <DramaticReveal
                    team1Name={roomData.team1Name}
                    team2Name={roomData.team2Name}
                    allPicks={allFinalPicks}
                    onComplete={handleCompleteReveal}
                />
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
                            {state.log.map((log, i) => <p key={i}>{log}</p>)}
                        </div>
                    </ScrollArea>
                </CardContent>
             </Card>
        </div>
      </main>
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
                        El draft ha sido cancelado porque la sala se quedó vacía o el admin la cerró. Serás devuelto al lobby.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => cleanupRoom().then(() => router.push('/dashboard'))}>Volver al Lobby</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
       <AlertDialog open={roomData.phase === 'FINISHED'}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">¡Draft Finalizado!</AlertDialogTitle>
                    <AlertDialogDescription>
                        El draft está completo. Esta sala se cerrará en breve.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => cleanupRoom().then(() => router.push('/dashboard'))}>Volver al Lobby</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
       </AlertDialog>
    </div>
  );
}
