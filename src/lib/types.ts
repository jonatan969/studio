import { type Character, type SuperArt } from './game-data';

export interface Room {
    id: string;
    name: string;
    adminId: string;
    team1Name: string;
    team2Name: string;
    team1Logo: string;
    team2Logo: string;
    playersPerTeam: number;
    spectatorLimit: number;
    phase: 'PREP' | 'COIN_FLIP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED' | 'CANCELED';
    playerCount: number;
    firstPicker?: 'team1' | 'team2';
    pickOrder?: { team: 'team1' | 'team2'; picks: number }[];
    currentPicker?: 'team1' | 'team2' | null;
    turn?: number;
    picksPerTurn?: number;
    timeLeft?: number;
    maxTime?: number;
}

export interface RoomPlayer {
    uid: string;
    nickname: string;
    photoURL: string | null;
    team: 'team1' | 'team2' | 'spectator';
    isReady: boolean;
}

export interface DraftPick extends Omit<Character, 'id'> {
    id: string; // The doc ID from firestore
    characterId: string; // The original character ID from game-data
    pickedBy: string; // uid of player
    nickname: string; // nickname of player who picked
    team: 'team1' | 'team2';
    pickOrder: number;
    superArtId?: string;
}
