'use client';

import { formatTime } from '@/lib/utils';
import { Progress } from '../ui/progress';

interface DraftTimerProps {
  phaseText: string;
  timeLeft: number;
  maxTime: number;
  currentTeam: 'Orange' | 'Purple' | null;
}

export function DraftTimer({ phaseText, timeLeft, maxTime, currentTeam }: DraftTimerProps) {
  const progress = (timeLeft / maxTime) * 100;
  const teamText = currentTeam ? `${currentTeam} Team is picking` : 'Prepare for the draft!';
  const teamColorClass = currentTeam === 'Orange' ? 'text-orange-400' : 'text-purple-400';

  return (
    <div className="w-full max-w-2xl mx-auto p-4 rounded-lg bg-card border border-border/50 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className='text-left'>
            <p className="text-lg font-headline font-bold">{phaseText}</p>
            {currentTeam && <p className={`text-sm font-semibold ${teamColorClass}`}>{teamText}</p>}
        </div>
        <p className="text-4xl font-bold font-mono">{formatTime(timeLeft)}</p>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
