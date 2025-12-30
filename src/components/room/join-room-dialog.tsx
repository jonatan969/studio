'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Room, RoomPlayer } from "@/lib/types";

interface JoinRoomDialogProps {
  isOpen: boolean;
  onJoin: (team: 'team1' | 'team2' | 'spectator') => void;
  roomData: Room | null;
  players: RoomPlayer[];
}

export function JoinRoomDialog({ isOpen, onJoin, roomData, players }: JoinRoomDialogProps) {
  if (!roomData) return null;

  const team1Count = players.filter(p => p.team === 'team1').length;
  const team2Count = players.filter(p => p.team === 'team2').length;
  const spectatorCount = players.filter(p => p.team === 'spectator').length;
  
  const isTeam1Full = team1Count >= roomData.playersPerTeam;
  const isTeam2Full = team2Count >= roomData.playersPerTeam;
  const areSpectatorsFull = spectatorCount >= roomData.spectatorLimit;
  
  const canJoinAsPlayer = roomData.phase === 'PREP';

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Join Room: {roomData.name}</DialogTitle>
          <DialogDescription>
            Choose how you want to enter the room.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => onJoin('team1')} 
            disabled={isTeam1Full || !canJoinAsPlayer}
            className="w-full justify-start"
            variant="outline"
          >
            Join {roomData.team1Name} ({team1Count}/{roomData.playersPerTeam})
          </Button>
          <Button 
            onClick={() => onJoin('team2')} 
            disabled={isTeam2Full || !canJoinAsPlayer}
            className="w-full justify-start"
            variant="outline"
          >
            Join {roomData.team2Name} ({team2Count}/{roomData.playersPerTeam})
          </Button>
          <Button 
            onClick={() => onJoin('spectator')} 
            disabled={areSpectatorsFull}
            className="w-full justify-start"
            variant="outline"
          >
            Join as Spectator ({spectatorCount}/{roomData.spectatorLimit})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
