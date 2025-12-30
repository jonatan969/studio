'use client';

import { PageHeader } from '@/components/page-header';
import { CHARACTERS, Character, SUPER_ARTS, SuperArt } from '@/lib/game-data';
import { useEffect, useReducer, useState } from 'react';
import { TeamDisplay } from '@/components/room/team-display';
import { HexagonGrid } from '@/components/room/hexagon-grid';
import { DraftTimer } from '@/components/room/draft-timer';
import { DRAFT_PICK_TIME, SUPER_ART_PICK_TIME, ROOM_CLOSE_TIME, DRAFT_START_TIMER, getPickOrder } from '@/lib/constants';
import { SuperArtSelector } from '@/components/room/super-art-selector';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DramaticReveal } from '@/components/room/dramatic-reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import { CoinFlip } from '@/components/room/coin-flip';
import { SuperArtSpectatorView } from '@/components/room/super-art-spectator-view';

type DraftPhase = 'PREP' | 'COIN_FLIP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED';
type Team = 'Orange' | 'Purple';

interface DraftState {
  phase: DraftPhase;
  turn: number;
  picksPerTurn: number;
  timeLeft: number;
  maxTime: number;
  teamPicks: {
    Orange: (Character | null)[];
    Purple: (Character | null)[];
  };
  bannedCharacters: string[];
  currentPicker: Team;
  superArtSelections: {
    [key: string]: SuperArt | null; // Using character ID as key
  };
  draftLog: string[];
  pickOrder: { team: Team; picks: number }[];
  teamSize: number;
  firstPicker?: Team;
}

type DraftAction =
  | { type: 'TICK' }
  | { type: 'START_DRAFT_TIMER' }
  | { type: 'SET_FIRST_PICKER'; team: Team }
  | { type: 'START_DRAFT' }
  | { type: 'PICK_CHARACTER'; character: Character; player: string }
  | { type: 'SELECT_SUPER_ART'; characterId: string; art: SuperArt }
  | { type: 'COMPLETE_REVEAL' }
  | { type: 'ADVANCE_TURN' };
  
const TEAM_SIZE = 6;

const initialPlayerPicks = Array(TEAM_SIZE).fill(null);
const initialDraftState: DraftState = {
  phase: 'PREP',
  turn: 0,
  picksPerTurn: 0,
  timeLeft: 5,
  maxTime: 5,
  teamPicks: {
    Orange: [...initialPlayerPicks],
    Purple: [...initialPlayerPicks],
  },
  bannedCharacters: [],
  currentPicker: 'Orange',
  superArtSelections: {},
  draftLog: ['Room created. Waiting for players...'],
  pickOrder: [],
  teamSize: TEAM_SIZE,
};

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'TICK':
      if (state.timeLeft > 0) {
        return { ...state, timeLeft: state.timeLeft - 1 };
      }
      return draftReducer(state, { type: 'ADVANCE_TURN' });

    case 'START_DRAFT_TIMER':
      return {
        ...state,
        phase: 'PREP',
        timeLeft: DRAFT_START_TIMER,
        maxTime: DRAFT_START_TIMER,
        draftLog: [...state.draftLog, `Both teams are full! Draft begins in ${DRAFT_START_TIMER} seconds.`],
      };
      
    case 'SET_FIRST_PICKER': {
        const pickOrder = getPickOrder(state.teamSize).map((p, i) => ({
            ...p,
            team: i % 2 === 0 ? action.team : (action.team === 'Orange' ? 'Purple' : 'Orange'),
        }));
        return {
            ...state,
            firstPicker: action.team,
            phase: 'DRAFTING',
            turn: 0,
            currentPicker: pickOrder[0].team,
            picksPerTurn: pickOrder[0].picks,
            timeLeft: DRAFT_PICK_TIME,
            maxTime: DRAFT_PICK_TIME,
            draftLog: [...state.draftLog, `Team ${action.team} won the coin toss and picks first!`],
            pickOrder,
        };
    }

    case 'START_DRAFT':
        return { ...state, phase: 'COIN_FLIP', draftLog: [...state.draftLog, 'Deciding which team picks first...'] };

    case 'PICK_CHARACTER': {
      const { character, player } = action;
      if (state.bannedCharacters.includes(character.id) || state.picksPerTurn === 0) return state;

      const newTeamPicks = { ...state.teamPicks };
      const teamToUpdate = newTeamPicks[state.currentPicker];
      const pickIndex = teamToUpdate.findIndex(p => p === null);
      if (pickIndex !== -1) {
        teamToUpdate[pickIndex] = character;
      }

      const picksLeft = state.picksPerTurn - 1;

      return {
        ...state,
        teamPicks: newTeamPicks,
        bannedCharacters: [...state.bannedCharacters, character.id],
        picksPerTurn: picksLeft,
        draftLog: [...state.draftLog, `${player} (Team ${state.currentPicker}) picked ${character.name}.`],
      };
    }
    
    case 'ADVANCE_TURN': {
      if(state.phase === 'PREP' && state.timeLeft === 0) {
        return draftReducer(state, { type: 'START_DRAFT' });
      }

      if(state.phase === 'DRAFTING' && state.picksPerTurn > 0) {
        return { ...state, timeLeft: DRAFT_PICK_TIME };
      }
      
      const newTurn = state.turn + 1;

      if (state.phase === 'DRAFTING') {
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
        
        const nextPickOrder = state.pickOrder[newTurn];
        return {
          ...state,
          turn: newTurn,
          currentPicker: nextPickOrder.team,
          picksPerTurn: nextPickOrder.picks,
          timeLeft: DRAFT_PICK_TIME,
          draftLog: [...state.draftLog, `It's Team ${nextPickOrder.team}'s turn to pick.`],
        };
      }
      
       if (state.phase === 'SUPER_ART') {
          const totalPicks = state.teamPicks.Orange.concat(state.teamPicks.Purple).filter(Boolean);
          if (Object.keys(state.superArtSelections).length >= totalPicks.length) {
             return { ...state, phase: 'REVEAL', draftLog: [...state.draftLog, 'Super Art selection complete. The reveal is imminent!'] };
          }
       }
      return state;
    }

    case 'SELECT_SUPER_ART': {
      const newSelections = { ...state.superArtSelections, [action.characterId]: action.art };
      const totalPicks = state.teamPicks.Orange.concat(state.teamPicks.Purple).filter(Boolean);
      
      if (Object.keys(newSelections).length >= totalPicks.length) {
        return { ...state, phase: 'REVEAL', superArtSelections: newSelections, draftLog: [...state.draftLog, 'All Super Arts have been locked in!'] };
      }

      return { ...state, superArtSelections: newSelections };
    }
    
    case 'COMPLETE_REVEAL':
       return { ...state, phase: 'FINISHED', timeLeft: ROOM_CLOSE_TIME, maxTime: ROOM_CLOSE_TIME };

    default:
      return state;
  }
}

interface User {
  name: string;
  nickname: string;
  isAdmin: boolean;
  isSpectator?: boolean;
}

export default function RoomPage() {
  const [state, dispatch] = useReducer(draftReducer, initialDraftState);
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      router.push('/');
    } else {
        setUser(JSON.parse(storedUser));
    }
    // Simulate teams filling up
    setTimeout(() => {
        dispatch({ type: 'START_DRAFT_TIMER' });
    }, 2000);
  }, [router]);
  
  useEffect(() => {
    if(state.phase === 'FINISHED' || state.phase === 'COIN_FLIP') return;

    const timer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(timer);
  }, [state.phase]);

  useEffect(() => {
    if (state.phase === 'PREP' && state.timeLeft <= 0) {
      dispatch({ type: 'START_DRAFT' });
    }
    if (state.phase === 'DRAFTING' && state.picksPerTurn === 0) {
      setTimeout(() => dispatch({ type: 'ADVANCE_TURN' }), 500); // short delay
    }
    if(state.phase === 'FINISHED' && state.timeLeft === 0) {
        toast({ title: 'Room Closed', description: 'The draft has concluded and the room is now closed.' });
        router.push('/dashboard');
    }
  }, [state.phase, state.timeLeft, state.picksPerTurn, router, toast]);

  const handlePickCharacter = (character: Character) => {
    // In a real app, check if it's this user's turn
    dispatch({ type: 'PICK_CHARACTER', character, player: user?.name || 'A player' });
    toast({
      title: 'Character Picked!',
      description: `Your team picked ${character.name}.`
    });
  };
  
  const handleSelectSuperArt = (art: SuperArt) => {
    // This is a simulation for one player. A real app would track this per-player.
    const allPicks = [...state.teamPicks.Orange, ...state.teamPicks.Purple].filter((c): c is Character => c !== null);
    allPicks.forEach(char => {
        // Here we'd only select for the current user's character.
        // For demo, we select for everyone with a slight random variation.
        dispatch({ type: 'SELECT_SUPER_ART', characterId: char.id, art: SUPER_ARTS[Math.floor(Math.random()*SUPER_ARTS.length)] });
    });
  }

  const getPhaseText = () => {
    switch (state.phase) {
      case 'PREP': return `Draft starting in...`;
      case 'COIN_FLIP': return 'Deciding First Pick';
      case 'DRAFTING': return 'Picking Phase';
      case 'SUPER_ART': return 'Super Art Selection';
      case 'REVEAL': return 'The Reveal';
      case 'FINISHED': return 'Room Closing In';
      default: return 'Draft in Progress';
    }
  };
  
  const allFinalPicks = [
    ...state.teamPicks.Orange.map(c => c ? ({ team: 'Orange' as Team, character: c, superArt: state.superArtSelections[c.id]! }) : null),
    ...state.teamPicks.Purple.map(c => c ? ({ team: 'Purple' as Team, character: c, superArt: state.superArtSelections[c.id]! }) : null)
  ].filter((p): p is { team: Team; character: Character; superArt: SuperArt } => p !== null && p.superArt !== null);

  const handleCoinFlipResult = (winner: Team) => {
    setTimeout(() => {
        dispatch({ type: 'SET_FIRST_PICKER', team: winner });
    }, 2000); // wait 2s after animation
  }

  if (!isClient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <PageHeader />
      <main className="flex-grow container py-4 md:py-8 flex flex-col gap-4">
        <DraftTimer
          phaseText={getPhaseText()}
          timeLeft={state.timeLeft}
          maxTime={state.maxTime}
          currentTeam={state.phase === 'DRAFTING' ? state.currentPicker : null}
        />
        <div className="flex-grow grid grid-cols-1 md:grid-cols-[1fr_2.5fr_1fr] gap-4">
          <TeamDisplay teamName="Orange" picks={state.teamPicks.Orange} isPicking={state.currentPicker === 'Orange'} />
          
          <div className="flex flex-col gap-4 items-center justify-center">
            {state.phase === 'COIN_FLIP' && (
                <CoinFlip onComplete={handleCoinFlipResult} />
            )}
            {state.phase === 'DRAFTING' && (
                <HexagonGrid
                    characters={CHARACTERS}
                    bannedCharacters={state.bannedCharacters}
                    onPick={handlePickCharacter}
                />
            )}
             {state.phase === 'SUPER_ART' && !user?.isSpectator && (
                <SuperArtSelector onSelect={handleSelectSuperArt} isSubmitting={false}/>
            )}
            {state.phase === 'SUPER_ART' && user?.isSpectator && allFinalPicks.length > 0 && (
                <SuperArtSpectatorView allPicks={allFinalPicks} />
            )}
             {(state.phase === 'PREP' || state.phase === 'FINISHED') && (
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
          
          <TeamDisplay teamName="Purple" picks={state.teamPicks.Purple} isPicking={state.currentPicker === 'Purple'} />
        </div>
      </main>
      {state.phase === 'REVEAL' && allFinalPicks.length > 0 && (
         <DramaticReveal
          team1SuperArt={allFinalPicks.find(p => p.team === 'Orange')?.superArt || SUPER_ARTS[0]}
          team2SuperArt={allFinalPicks.find(p => p.team === 'Purple')?.superArt || SUPER_ARTS[1]}
          allPicks={allFinalPicks}
          onComplete={() => dispatch({ type: 'COMPLETE_REVEAL' })}
         />
      )}
    </div>
  );
}
