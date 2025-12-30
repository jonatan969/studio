'use client';

import { PageHeader } from '@/components/page-header';
import { CHARACTERS, Character, SUPER_ARTS, SuperArt } from '@/lib/game-data';
import { useEffect, useReducer, useState } from 'react';
import { TeamDisplay } from '@/components/room/team-display';
import { HexagonTile } from '@/components/room/hexagon-tile';
import { DraftTimer } from '@/components/room/draft-timer';
import { DRAFT_PICK_TIME, PICK_ORDER, SUPER_ART_PICK_TIME, ROOM_CLOSE_TIME } from '@/lib/constants';
import { SuperArtSelector } from '@/components/room/super-art-selector';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { DramaticReveal } from '@/components/room/dramatic-reveal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

type DraftPhase = 'PREP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED';
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
}

type DraftAction =
  | { type: 'TICK' }
  | { type: 'START_DRAFT' }
  | { type: 'PICK_CHARACTER'; character: Character }
  | { type: 'SELECT_SUPER_ART'; characterId: string; art: SuperArt }
  | { type: 'COMPLETE_REVEAL' }
  | { type: 'ADVANCE_TURN' };

const initialPlayerPicks = Array(6).fill(null);
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
  draftLog: ['Draft starting soon...'],
};

function draftReducer(state: DraftState, action: DraftAction): DraftState {
  switch (action.type) {
    case 'TICK':
      if (state.timeLeft > 0) {
        return { ...state, timeLeft: state.timeLeft - 1 };
      }
      // If timer hits 0, auto-advance or auto-pick
      return draftReducer(state, { type: 'ADVANCE_TURN' });

    case 'START_DRAFT':
      return {
        ...state,
        phase: 'DRAFTING',
        turn: 0,
        currentPicker: PICK_ORDER[0].team,
        picksPerTurn: PICK_ORDER[0].picks,
        timeLeft: DRAFT_PICK_TIME,
        maxTime: DRAFT_PICK_TIME,
        draftLog: [...state.draftLog, `Draft has started! Team ${PICK_ORDER[0].team} is picking.`],
      };

    case 'PICK_CHARACTER': {
      const { character } = action;
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
        draftLog: [...state.draftLog, `Team ${state.currentPicker} picked ${character.name}.`],
      };
    }
    
    case 'ADVANCE_TURN': {
       // If picks are remaining, just reset timer
      if(state.phase === 'DRAFTING' && state.picksPerTurn > 0) {
        return { ...state, timeLeft: DRAFT_PICK_TIME };
      }
      
      const newTurn = state.turn + 1;

      if (state.phase === 'DRAFTING') {
        if (newTurn >= PICK_ORDER.length) {
          // Transition to Super Art phase
          return {
            ...state,
            phase: 'SUPER_ART',
            turn: 0,
            timeLeft: SUPER_ART_PICK_TIME,
            maxTime: SUPER_ART_PICK_TIME,
            draftLog: [...state.draftLog, 'All characters picked! Now selecting Super Arts.'],
          };
        }
        
        const nextPickOrder = PICK_ORDER[newTurn];
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
          // Time is up for Super Art selection
          const totalPicks = state.teamPicks.Orange.concat(state.teamPicks.Purple).filter(Boolean);
          if (Object.keys(state.superArtSelections).length >= totalPicks.length) {
             return { ...state, phase: 'REVEAL', draftLog: [...state.draftLog, 'Super Art selection complete. The reveal is imminent!'] };
          }
          // Here you could force a default selection for those who didn't pick
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


export default function RoomPage() {
  const [state, dispatch] = useReducer(draftReducer, initialDraftState);
  const { toast } = useToast();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('user');
    if (!storedUser) router.push('/');
  }, [router]);
  
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (state.phase === 'PREP' && state.timeLeft === 0) {
      dispatch({ type: 'START_DRAFT' });
    }
    if (state.phase === 'DRAFTING' && state.picksPerTurn === 0) {
      dispatch({ type: 'ADVANCE_TURN' });
    }
    if(state.phase === 'FINISHED' && state.timeLeft === 0) {
        toast({ title: 'Room Closed', description: 'The draft has concluded and the room is now closed.' });
        router.push('/dashboard');
    }
  }, [state.phase, state.timeLeft, state.picksPerTurn, router, toast]);

  const handlePickCharacter = (character: Character) => {
    dispatch({ type: 'PICK_CHARACTER', character });
    toast({
      title: 'Character Picked!',
      description: `Your team picked ${character.name}.`
    });
  };
  
  const handleSelectSuperArt = () => {
    // This is a simulation for one player. A real app would track this per-player.
    // For now, we'll just pick for all characters to advance the state.
    const allPicks = [...state.teamPicks.Orange, ...state.teamPicks.Purple].filter((c): c is Character => c !== null);
    allPicks.forEach(char => {
        dispatch({ type: 'SELECT_SUPER_ART', characterId: char.id, art: SUPER_ARTS[Math.floor(Math.random()*SUPER_ARTS.length)] });
    });
  }

  const getPhaseText = () => {
    switch (state.phase) {
      case 'PREP': return 'Draft starting soon';
      case 'DRAFTING': return 'Picking Phase';
      case 'SUPER_ART': return 'Super Art Selection';
      case 'FINISHED': return 'Room Closing In';
      default: return 'Draft in Progress';
    }
  };
  
  const allFinalPicks = [
    ...state.teamPicks.Orange.map(c => c ? ({ team: 'Orange' as Team, character: c, superArt: state.superArtSelections[c.id]! }) : null),
    ...state.teamPicks.Purple.map(c => c ? ({ team: 'Purple' as Team, character: c, superArt: state.superArtSelections[c.id]! }) : null)
  ].filter((p): p is { team: Team; character: Character; superArt: SuperArt } => p !== null && p.superArt !== null);

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
            {state.phase === 'DRAFTING' && (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-4 justify-center">
                    {CHARACTERS.map(char => (
                        <HexagonTile 
                            key={char.id} 
                            imageUrl={char.image} 
                            alt={char.name}
                            characterName={char.name}
                            isPicked={state.bannedCharacters.includes(char.id)} 
                            onClick={() => handlePickCharacter(char)} 
                        />
                    ))}
                </div>
            )}
             {state.phase === 'SUPER_ART' && (
                <SuperArtSelector onSelect={handleSelectSuperArt} isSubmitting={false}/>
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
