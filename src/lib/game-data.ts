'use client';
import { Swords, BrainCircuit, Shield, Zap } from 'lucide-react';
import type { Character, SuperArt, GameData } from './types';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useMemo } from 'react';

// This file now serves as a hook-based data accessor for the game data
// stored in Firestore, rather than holding static data.

export const ROLES = {
  DUELIST: { name: 'Duelist', icon: Swords },
  CONTROLLER: { name: 'Controller', icon: BrainCircuit },
  SENTINEL: { name: 'Sentinel', icon: Shield },
  INITIATOR: { name: 'Initiator', icon: Zap },
};

export type CharacterRole = keyof typeof ROLES;

interface GameDataResult {
  characters: Character[];
  superArts: SuperArt[];
  isLoading: boolean;
  error: any;
}

export function useGameData(): GameDataResult {
  const firestore = useFirestore();

  const gameDataRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, 'game_data', 'static');
  }, [firestore]);

  const { data: gameData, isLoading, error } = useDoc<GameData>(gameDataRef);

  const characters = useMemo(() => gameData?.characters || [], [gameData]);
  const superArts = useMemo(() => gameData?.super_arts || [], [gameData]);

  return { characters, superArts, isLoading, error };
}
