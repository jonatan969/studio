'use client';
import type { Character, SuperArt } from './types';
import { doc } from 'firebase/firestore';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';

export function useGameData() {
  const firestore = useFirestore();
  const gameDataRef = useMemoFirebase(() => firestore ? doc(firestore, 'game_data', 'static') : null, [firestore]);
  const { data: gameData, isLoading } = useDoc<{ characters: Character[], super_arts: SuperArt[] }>(gameDataRef);

  const characters = gameData?.characters || [];
  const superArts = gameData?.super_arts || [];

  return { characters, superArts, isLoading };
}
