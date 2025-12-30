'use client';

import { PageHeader } from '@/components/page-header';
import { CHARACTERS, Character, SUPER_ARTS, SuperArt } from '@/lib/game-data';
import { useEffect, useReducer, useState, useCallback } from 'react';
import { TeamDisplay } from '@/components/room/team-display';
import { CharacterSquare } from '@/components/room/character-square';
import { DraftTimer } from '@/components/room/draft-timer';
import { DRAFT_PICK_TIME, SUPER_ART_PICK_TIME, ROOM_CLOSE_TIME, DRAFT_START_TIMER, getPickOrder } from '@/lib/constants';
import { SuperArtSelector } from '@/components/room/super-art-selector';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DramaticReveal } from '@/components/room/dramatic-reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Loader2, LogOut, ShieldAlert } from 'lucide-react';
import { CoinFlip } from '@/components/room/coin-flip';
import { SuperArtSpectatorView } from '@/components/room/super-art-spectator-view';
import { useDoc, useCollection, useUser, useFirestore, useMemoFirebase, setDocumentNonBlocking, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { Room, RoomPlayer, DraftPick } from '@/lib/types';
import { doc, collection, writeBatch, deleteDoc } from 'firebase/firestore';
import { JoinRoomDialog } from '@/components/room/join-room-dialog';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';


type DraftPhase = 'PREP' | 'COIN_FLIP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED' | 'CANCELED';
type TeamId = 'team1' | 'team2';

interface DraftState {
  phase: DraftPhase;
  turn: number;
  picksPerTurn: number;
  timeLeft: number;
  maxTime: number;
  superArtSelections: {
    [key: string]: SuperArt | null; // Using character ID as key
  };
  draftLog: string[];
  pickOrder: { team: TeamId; picks: number }[];
}

type DraftAction =
  | { type: 'TICK' }
  | { type: 'START_DRAFT_TIMER' }
  | { type: 'SET_FIRST_PICKER'; team: TeamId, roomData: Room }
  | { type: 'START_DRAFT' }
  | { type: 'ADVANCE_TURN', roomData: Room, draftPicks: DraftPick[] }
  | { type: 'COMPLETE_REVEAL' }
  | { type: 'CANCEL_DRAFT', reason: string };
  

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'TICK':
      if (state.timeLeft > 0) {
        return { ...state, timeLeft: state.timeLeft - 1 };
      }
      return state;

    case 'START_DRAFT_TIMER':
      return {
        ...state,
        phase: 'PREP',
        timeLeft: DRAFT_START_TIMER,
        maxTime: DRAFT_START_TIMER,
        draftLog: [...state.draftLog, `Both teams are full! Draft begins in ${DRAFT_START_TIMER} seconds.`],
      };
      
    case 'SET_FIRST_PICKER': {
        const pickOrder = getPickOrder(action.roomData.playersPerTeam).map((p, i) => ({
            ...p,
            team: i % 2 === 0 ? action.team : (action.team === 'team1' ? 'team2' : 'team1'),
        }));
        return {
            ...state,
            phase: 'DRAFTING',
            turn: 0,
            timeLeft: DRAFT_PICK_TIME,
            maxTime: DRAFT_PICK_TIME,
            draftLog: [...state.draftLog, `Team ${action.roomData[action.team === 'team1' ? 'team1Name' : 'team2Name']} won the coin toss and picks first!`],
            pickOrder,
        };
    }

    case 'START_DRAFT':
        return { ...state, phase: 'COIN_FLIP', draftLog: [...state.draftLog, 'Deciding which team picks first...'] };
    
    case 'ADVANCE_TURN': {
        const { roomData, draftPicks } = action;

        if (state.phase === 'DRAFTING') {
            const totalPicksMade = draftPicks.length;
            const expectedPicksForTurn = state.pickOrder.slice(0, state.turn + 1).reduce((acc, p) => acc + p.picks, 0);

            if (totalPicksMade < expectedPicksForTurn) {
                return state; 
            }

            const newTurn = state.turn + 1;
            if (newTurn >= state.pickOrder.length) {
                return {
                    ...state,
                    phase: 'SUPER_ART',
                    turn: 0,
                    timeLeft: SUPER_ART_PICK_TIME,
                    maxTime: SUPER_ART_PICK_TIME,
                    draftLog: [...state.draftLog, 'All characters picked! Now selecting Super Arts.'],
                };
            }
            
            return {
                ...state,
                turn: newTurn,
                timeLeft: DRAFT_PICK_TIME,
                draftLog: [...state.draftLog, `It's Team ${roomData[state.pickOrder[newTurn].team === 'team1' ? 'team1Name' : 'team2Name']}'s turn to pick.`],
            };
        }
        
        return state;
    }

    case 'COMPLETE_REVEAL':
       return { ...state, phase: 'FINISHED', timeLeft: ROOM_CLOSE_TIME, maxTime: ROOM_CLOSE_TIME };
    
    case 'CANCEL_DRAFT':
        return { ...state, phase: 'CANCELED', draftLog: [...state.draftLog, `Draft canceled: ${action.reason}`] };

    default:
      return state;
  }
}

export default function RoomPage({ params }: { params: { id: string }}) {
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

  const [state, dispatch] = useReducer(draftReducer, {
    phase: 'PREP',
    turn: 0,
    picksPerTurn: 0,
    timeLeft: 0,
    maxTime: 0,
    superArtSelections: {},
    draftLog: [],
    pickOrder: [],
  });

  const [isJoinDialogOpen, setJoinDialogOpen] = useState(false);
  
  const userPlayerInfo = useMemo(() => players?.find(p => p.uid === user?.uid), [players, user]);
  
  const handleLeaveRoom = useCallback(async () => {
    if (!user || !firestore || !userPlayerInfo) return;

    if (roomData?.adminId === user.uid) {
        // Admin is leaving, delete the entire room
        toast({ title: "Closing Room", description: "As the admin, you are closing the room for everyone." });
        if (roomRef) await deleteDoc(roomRef); // This will cascade via backend functions if set up, otherwise manual cleanup needed
        router.push('/dashboard');
        return;
    }

    // Regular player or spectator leaving
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    await deleteDoc(playerRef);

    if (userPlayerInfo.team !== 'spectator' && (roomData?.phase !== 'PREP' && roomData?.phase !== 'FINISHED')) {
        // Player left mid-draft, cancel it
        if(roomRef) updateDocumentNonBlocking(roomRef, { phase: 'CANCELED' });
    } else {
        if(roomRef) updateDocumentNonBlocking(roomRef, { playerCount: (players?.length || 1) - 1 });
    }
    
    router.push('/dashboard');
  }, [user, firestore, userPlayerInfo, roomData, roomId, router, roomRef, players?.length]);

  // Admin cleanup effect
   useEffect(() => {
    if (user && roomData && roomData.adminId === user.uid) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        // This is not guaranteed to work but it's a good effort
        if(roomRef) deleteDocumentNonBlocking(roomRef);
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [user, roomData, roomRef]);

  // Player joining logic
  useEffect(() => {
    if (isUserLoading || arePlayersLoading || !user || !firestore || !roomData) return;
    
    if (!userPlayerInfo) {
        // User is not in the room, show join dialog
        setJoinDialogOpen(true);
    }
  }, [user, isUserLoading, arePlayersLoading, userPlayerInfo, firestore, roomData]);

  const handleJoin = (team: 'team1' | 'team2' | 'spectator') => {
    if (!user || !firestore) return;
    const playerRef = doc(firestore, `rooms/${roomId}/players`, user.uid);
    const playerData: RoomPlayer = {
        uid: user.uid,
        nickname: user.displayName || 'Player',
        photoURL: user.photoURL || null,
        team: team,
        isReady: false,
    };
    setDocumentNonBlocking(playerRef, playerData, { merge: true });
    if (roomRef) updateDocumentNonBlocking(roomRef, { playerCount: (players?.length || 0) + 1 });
    setJoinDialogOpen(false);
  };


  // Game state machine
   useEffect(() => {
    if (!roomData || !players || !draftPicks || !user) return;

    if (roomData.phase !== state.phase) {
        switch(roomData.phase) {
            case 'CANCELED':
                dispatch({ type: 'CANCEL_DRAFT', reason: 'A player has left the match.' });
                break;
            case 'PREP':
                const team1Full = (players.filter(p=>p.team === 'team1').length || 0) === roomData.playersPerTeam;
                const team2Full = (players.filter(p=>p.team === 'team2').length || 0) === roomData.playersPerTeam;

                if (team1Full && team2Full) {
                    dispatch({ type: 'START_DRAFT_TIMER' });
                    if(roomData.adminId === user.uid) {
                        updateDocumentNonBlocking(roomRef!, { phase: 'COIN_FLIP', timeLeft: DRAFT_START_TIMER, maxTime: DRAFT_START_TIMER });
                    }
                }
                break;
            case 'COIN_FLIP':
                 dispatch({ type: 'START_DRAFT' });
                 break;
            case 'DRAFTING':
                if (roomData.firstPicker && roomData.turn !== undefined) {
                    if (state.phase !== 'DRAFTING') {
                        dispatch({ type: 'SET_FIRST_PICKER', team: roomData.firstPicker, roomData });
                    } else if (state.turn !== roomData.turn) {
                        dispatch({ type: 'ADVANCE_TURN', roomData, draftPicks });
                    }
                }
                break;
        }
    }
    
    const serverTimeLeft = roomData.timeLeft || 0;
    if(state.timeLeft !== serverTimeLeft) {
        // TODO: This can cause jitter, a more sophisticated time sync is needed for production
        dispatch({ type: 'TICK' }); 
    }

  }, [roomData, players, draftPicks, user, state.phase, state.turn, roomRef, state.timeLeft]);

  const handlePickCharacter = (character: Character) => {
    if (!user || !roomData || !players || !draftPicks || !firestore) return;
    
    const currentPlayer = players.find(p => p.uid === user.uid);
    if (!currentPlayer || currentPlayer.team === 'spectator') {
        toast({ variant: 'destructive', title: 'Spectators cannot pick' });
        return;
    }
    if (roomData.currentPicker !== currentPlayer.team) {
        toast({ variant: 'destructive', title: 'Not your team\'s turn' });
        return;
    }
    if (draftPicks.some(p => p.pickedBy === user.uid)) {
        toast({ variant: 'destructive', title: 'You have already picked' });
        return;
    }

    const picksRef = collection(firestore, `rooms/${roomId}/picks`);
    const pickData: DraftPick = {
        ...character,
        pickedBy: user.uid,
        team: currentPlayer.team,
        pickOrder: draftPicks.length + 1,
    };
    
    addDocumentNonBlocking(picksRef, pickData);

    toast({ title: 'Character Picked!', description: `Your team picked ${character.name}.` });
  };
  
  const handleSelectSuperArt = (art: SuperArt) => {
    console.log("Super art selected", art);
    // TODO: Implement super art selection logic
  }

  const handleCoinFlipResult = (winner: TeamId) => {
    if(user?.uid === roomData?.adminId && roomRef) {
        const pickOrder = getPickOrder(roomData!.playersPerTeam).map((p, i) => ({
            ...p,
            team: i % 2 === 0 ? winner : (winner === 'team1' ? 'team2' : 'team1'),
        }));
        updateDocumentNonBlocking(roomRef, { phase: 'DRAFTING', firstPicker: winner, currentPicker: pickOrder[0].team, turn: 0, picksPerTurn: pickOrder[0].picks, timeLeft: DRAFT_PICK_TIME });
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

  const team1Picks = draftPicks?.filter(p => p.team === 'team1').map(p => CHARACTERS.find(c => c.id === p.id)!) || [];
  const team2Picks = draftPicks?.filter(p => p.team === 'team2').map(p => CHARACTERS.find(c => c.id === p.id)!) || [];
  const bannedCharacters = draftPicks?.map(p => p.id) || [];
  
  const getPhaseText = () => {
    switch (roomData.phase) {
      case 'PREP': return `Waiting for players...`;
      case 'COIN_FLIP': return 'Deciding First Pick';
      case 'DRAFTING': return 'Picking Phase';
      case 'SUPER_ART': return 'Super Art Selection';
      case 'REVEAL': return 'The Reveal';
      case 'FINISHED': return 'Room Closing In';
      case 'CANCELED': return 'Draft Canceled';
      default: return 'Draft in Progress';
    }
  };
  
  const allFinalPicks = draftPicks as (DraftPick & {superArt: SuperArt})[] || [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader />
      <main className="flex-grow container py-4 md:py-8 flex flex-col gap-4">
        <div className="flex justify-between items-center">
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
          <TeamDisplay teamName={roomData.team1Name} teamId="team1" players={team1Players} picks={team1Picks} isPicking={roomData.currentPicker === 'team1'} maxPlayers={roomData.playersPerTeam} />
          
          <div className="flex flex-col gap-4 items-center justify-center">
            {roomData.phase === 'COIN_FLIP' && (
                <CoinFlip onComplete={handleCoinFlipResult} />
            )}
            {roomData.phase === 'DRAFTING' && (
                <div className="grid grid-cols-4 gap-4 p-4">
                    {CHARACTERS.map(char => (
                        <CharacterSquare
                            key={char.id}
                            character={char}
                            isPicked={bannedCharacters.includes(char.id)}
                            onClick={() => handlePickCharacter(char)}
                        />
                    ))}
                </div>
            )}
             {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team !== 'spectator' && (
                <SuperArtSelector onSelect={handleSelectSuperArt} isSubmitting={false}/>
            )}
            {roomData.phase === 'SUPER_ART' && userPlayerInfo?.team === 'spectator' && allFinalPicks.length > 0 && (
                <SuperArtSpectatorView allPicks={allFinalPicks} />
            )}
             {(roomData.phase === 'PREP' || roomData.phase === 'FINISHED') && (
                 <Card className="w-full h-full flex flex-col items-center justify-center">
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl flex items-center gap-2"><History/> Draft Log</CardTitle>
                    </CardHeader>
                    <CardContent className="w-full">
                        <div className="h-96 overflow-y-auto space-y-2 text-sm p-4 bg-secondary/30 rounded-md">
                            {state.draftLog.map((log, i) => <p key={i}>{log}</p>)}
                        </div>
                    </CardContent>
                 </Card>
             )}
          </div>
          
          <TeamDisplay teamName={roomData.team2Name} teamId="team2" players={team2Players} picks={team2Picks} isPicking={roomData.currentPicker === 'team2'} maxPlayers={roomData.playersPerTeam}/>
        </div>
      </main>
      {state.phase === 'REVEAL' && allFinalPicks.length > 0 && (
         <DramaticReveal
          team1SuperArt={allFinalPicks.find(p => p.team === 'team1')?.superArt || SUPER_ARTS[0]}
          team2SuperArt={allFinalPicks.find(p => p.team === 'team2')?.superArt || SUPER_ARTS[1]}
          allPicks={allFinalPicks}
          onComplete={() => dispatch({ type: 'COMPLETE_REVEAL' })}
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
    </div>
  );
}
