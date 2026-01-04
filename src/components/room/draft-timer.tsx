'use client';

import { formatTime } from '@/lib/utils';
import { Progress } from '../ui/progress';
import { useEffect, useState } from 'react';

interface DraftTimerProps {
  phaseText: string;
  timeLeft: number;
  currentTeamName: string | null;
  currentTeamId: 'team1' | 'team2' | null;
}

export function DraftTimer({ phaseText, timeLeft, currentTeamName, currentTeamId }: DraftTimerProps) {
  const teamText = currentTeamName ? `${currentTeamName} está eligiendo` : '¡Prepárate para el draft!';
  const teamColorClass = currentTeamId === 'team1' ? 'text-orange-400' : 'text-purple-400';

  return (
    <div className="w-full max-w-2xl p-3 sm:p-4 rounded-lg bg-card border border-border/50 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className='text-left'>
            <p className="text-base sm:text-lg font-headline font-bold">{phaseText}</p>
            {currentTeamName && <p className={`text-xs sm:text-sm font-semibold ${teamColorClass}`}>{teamText}</p>}
        </div>
        <p className="text-3xl sm:text-4xl font-bold font-mono">{formatTime(timeLeft)}</p>
      </div>
      {/* Progress is not needed anymore with client-side timer, but can be kept for visual indication if desired */}
      {/* <Progress value={progress} className="h-2" /> */}
    </div>
  );
}
