export interface User {
    uid: string;
    email: string;
    nickname: string;
    photoURL: string | null;
    role?: 'admin' | 'user';
}

export interface Character {
    id: string;
    name: string;
    role: string;
    image: string;
    hint?: string;
    description?: string;
}

export interface SuperArt {
  id: string;
  characterId: string; // Link back to the character
  name: string;
  description: string;
  color: 'red' | 'yellow' | 'blue';
  roman: string;
}

export interface GameData {
  characters: Character[];
  super_arts: SuperArt[];
}

export interface RoomPlayer {
    uid: string; // Document ID is the user's UID
    nickname: string;
    photoURL: string | null;
    team: 'team1' | 'team2' | 'spectator';
    isReady: boolean;
}

export interface DraftPick {
    id: string; // Document ID is the player's UID
    characterId: string;
    pickedBy: string; // uid of player
    nickname: string; // nickname of player who picked
    team: 'team1' | 'team2';
    pickOrder: number;
    turn: number; // The turn number this pick was made in
    superArtId?: string;
}

export interface Room {
    id?: string;
    name: string;
    adminId: string;
    team1Name: string;
    team2Name: string;
    team1Logo: string;
    team2Logo: string;
    playersPerTeam: number;
    spectatorLimit: number;
    phase: 'PREP' | 'COIN_FLIP' | 'DRAFTING' | 'SUPER_ART' | 'REVEAL' | 'FINISHED' | 'CANCELED';
    // players and picks are now subcollections
    firstPicker?: 'team1' | 'team2';
    pickOrder?: { team: 'team1' | 'team2'; picks: number }[];
    currentPicker?: 'team1' | 'team2' | null;
    turn?: number;
    turnEndsAt?: number | null; // Timestamp for when the current turn ends
}
