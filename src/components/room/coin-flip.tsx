'use client';

import { useEffect, useState } from "react";
import { VersusLogo } from "../icons/logo";
import { cn } from "@/lib/utils";

interface CoinFlipProps {
    onComplete: (winner: 'team1' | 'team2') => void;
}

export function CoinFlip({ onComplete }: CoinFlipProps) {
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<'team1' | 'team2' | null>(null);

    useEffect(() => {
        setIsFlipping(true);
        const winner = Math.random() < 0.5 ? 'team1' : 'team2';
        
        const flipTimeout = setTimeout(() => {
            setResult(winner);
            setIsFlipping(false);
        }, 3000); // Animation duration

        const completeTimeout = setTimeout(() => {
            onComplete(winner);
        }, 5000); // Total time before moving on

        return () => {
            clearTimeout(flipTimeout);
            clearTimeout(completeTimeout);
        };
    }, [onComplete]);

    const getCoinSideClass = (side: 'front' | 'back') => {
        if (!result) return '';
        if (result === 'team1' && side === 'front') return 'animate-coin-result';
        if (result === 'team2' && side === 'back') return 'animate-coin-result';
        return 'animate-coin-hide';
    }

    return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <style jsx>{`
                .coin-container {
                    perspective: 1000px;
                }
                .coin {
                    width: 150px;
                    height: 150px;
                    position: relative;
                    transform-style: preserve-3d;
                    animation: ${isFlipping ? 'flip 3s ease-out forwards' : 'none'};
                }
                .coin-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    backface-visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border: 4px solid #a855f7; /* primary */
                }
                .front {
                    background-color: #f97316; /* orange-500 */
                    color: white;
                }
                .back {
                    background-color: #a855f7; /* purple-500 */
                    color: white;
                    transform: rotateY(180deg);
                }
                @keyframes flip {
                    0% { transform: rotateY(0); }
                    100% { transform: rotateY(1800deg); }
                }
                .animate-coin-result {
                    animation: show-result 1s forwards 0.5s;
                }
                 @keyframes show-result {
                    from { transform: scale(1); }
                    to { transform: scale(1.2); }
                }
            `}</style>
            <div className="coin-container">
                <div className={cn("coin", result && "transition-transform duration-500", result === 'team1' && 'rotate-y-0', result === 'team2' && 'rotate-y-180' )}>
                    <div className="coin-face front">
                        <VersusLogo className="w-20 h-20" />
                    </div>
                    <div className="coin-face back">
                        <VersusLogo className="w-20 h-20" />
                    </div>
                </div>
            </div>
            <p className="font-headline text-2xl mt-4">
                {result ? `¡El equipo ${result === 'team1' ? 'Naranja' : 'Morado'} elige primero!` : 'Lanzando la moneda...'}
            </p>
        </div>
    );
}
