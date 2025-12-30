'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Room, RoomPlayer } from "@/lib/types";
import { Users, UserCheck, X } from "lucide-react";

interface SwitchTeamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchTeam: (team: 'team1' | 'team2' | 'spectator') => void;
  roomData: Room | null;
  players: RoomPlayer[];
}

export function SwitchTeamDialog({ isOpen, onClose, onSwitchTeam, roomData, players }: SwitchTeamDialogProps) {
  if (!roomData) return null;

  const team1Count = players.filter(p => p.team === 'team1').length;
  const team2Count = players.filter(p => p.team === 'team2').length;
  const spectatorCount = players.filter(p => p.team === 'spectator').length;
  
  const isTeam1Full = team1Count >= roomData.playersPerTeam;
  const isTeam2Full = team2Count >= roomData.playersPerTeam;
  const areSpectatorsFull = spectatorCount >= roomData.spectatorLimit;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Cambiar de Equipo</DialogTitle>
          <DialogDescription>
            Puedes cambiar de equipo o convertirte en espectador mientras la sala espera jugadores.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button 
            onClick={() => onSwitchTeam('team1')} 
            disabled={isTeam1Full}
            className="w-full justify-between"
            variant="outline"
          >
            Unirse a {roomData.team1Name} 
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{team1Count}/{roomData.playersPerTeam}</span>
          </Button>
          <Button 
            onClick={() => onSwitchTeam('team2')} 
            disabled={isTeam2Full}
            className="w-full justify-between"
            variant="outline"
          >
            Unirse a {roomData.team2Name}
            <span className="flex items-center gap-1 text-muted-foreground"><Users className="w-4 h-4" />{team2Count}/{roomData.playersPerTeam}</span>
          </Button>
          <Button 
            onClick={() => onSwitchTeam('spectator')} 
            disabled={areSpectatorsFull}
            className="w-full justify-between"
            variant="outline"
          >
            Unirse como Espectador
            <span className="flex items-center gap-1 text-muted-foreground"><UserCheck className="w-4 h-4" />{spectatorCount}/{roomData.spectatorLimit}</span>
          </Button>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancelar</Button>
            </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
