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
import { Users, UserCheck } from "lucide-react";

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
  const areSpectatorsFull = roomData.spectatorLimit > 0 ? spectatorCount >= roomData.spectatorLimit : false;
  
  // Players can only join teams during the PREP phase. After that, it's spectators only.
  const canJoinAsPlayer = roomData.phase === 'PREP';

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Unirse a la Sala: {roomData.name}</DialogTitle>
          <DialogDescription>
            {canJoinAsPlayer ? "Elige un equipo o únete como espectador." : "El draft está en progreso. Solo puedes unirte como espectador."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => onJoin('team1')} 
            disabled={isTeam1Full || !canJoinAsPlayer}
            className="w-full justify-between"
            variant="outline"
          >
            Unirse a {roomData.team1Name} 
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{team1Count}/{roomData.playersPerTeam}</span>
          </Button>
          <Button 
            onClick={() => onJoin('team2')} 
            disabled={isTeam2Full || !canJoinAsPlayer}
            className="w-full justify-between"
            variant="outline"
          >
            Unirse a {roomData.team2Name}
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{team2Count}/{roomData.playersPerTeam}</span>
          </Button>
          <Button 
            onClick={() => onJoin('spectator')} 
            disabled={areSpectatorsFull}
            className="w-full justify-between"
            variant="outline"
          >
            Unirse como Espectador
            <span className="flex items-center gap-1 text-muted-foreground"><UserCheck className="w-4 h-4" />{spectatorCount}/{roomData.spectatorLimit}</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
