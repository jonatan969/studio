'use client';
import type { Character, SuperArt } from './types';
import { useDoc, useMemoFirebase, useFirestore } from '@/firebase';

// These are now dynamic placeholers while data is loading.
export let CHARACTERS: Character[] = [];
export let SUPER_ARTS: SuperArt[] = [];

export function useGameData() {
  const firestore = useFirestore();
  const gameDataRef = useMemoFirebase(() => firestore ? doc(firestore, 'game_data', 'static') : null, [firestore]);
  const { data: gameData, isLoading } = useDoc<{ characters: Character[], super_arts: SuperArt[] }>(gameDataRef);

  if (gameData) {
    CHARACTERS = gameData.characters || [];
    SUPER_ARTS = gameData.super_arts || [];
  }

  return { isLoading };
}

// NOTE: Components using this data should ideally also use the `useGameData` hook 
// to ensure they re-render when the data loads. For simplicity in this refactor,
// we are relying on a top-level component re-rendering to propagate the updated data.
// A more robust solution would involve a dedicated context provider for game data.
