import { type Character } from './game-data';

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
    status: 'waiting' | 'starting' | 'drafting' | 'super_art' | 'reveal' | 'finished';
    phase: 'PREP' | 'COIN_FLIP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED' | 'CANCELED';
    playerCount: number;
    firstPicker?: 'team1' | 'team2';
    currentPicker?: 'team1' | 'team2';
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

export interface DraftPick extends Character {
    pickedBy: string; // uid of player
    team: 'team1' | 'team2';
    pickOrder: number;
}
