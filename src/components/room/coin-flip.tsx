'use client';

import { useEffect, useState } from "react";
import { VersusLogo } from "../icons/logo";
import { cn } from "@/lib/utils";

interface CoinFlipProps {
    onComplete: (winner: 'team1' | 'team2') => void;
    team1Name: string;
    team2Name: string;
}

export function CoinFlip({ onComplete, team1Name, team2Name }: CoinFlipProps) {
    const [isFlipping, setIsFlipping] = useState(false);
    const [result, setResult] = useState<'team1' | 'team2' | null>(null);

    useEffect(() => {
        setIsFlipping(true);
        const winner = Math.random() < 0.5 ? 'team1' : 'team2';
        
        const flipTimeout = setTimeout(() => {
            setResult(winner);
            setIsFlipping(false);
        }, 3000); // Animation duration

        return () => {
            clearTimeout(flipTimeout);
        };
    }, []); // Removed onComplete from dependencies to control flow manually

    useEffect(() => {
        if (result) {
            // Wait 2 seconds after showing the result before moving on
            const completeTimeout = setTimeout(() => {
                onComplete(result);
            }, 2000);
            return () => clearTimeout(completeTimeout);
        }
    }, [result, onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full gap-4 p-4 animate-in fade-in-50 duration-500">
            <style jsx>{`
                .coin-container {
                    perspective: 1000px;
                }
                .coin {
                    width: 120px;
                    height: 120px;
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
                    border: 4px solid hsl(var(--primary));
                }
                .front {
                    background-color: hsl(var(--ring));
                    color: white;
                }
                .back {
                    background-color: hsl(var(--accent));
                    color: white;
                    transform: rotateY(180deg);
                }
                @keyframes flip {
                    0% { transform: rotateY(0); }
                    100% { transform: rotateY(1800deg); }
                }
            `}</style>
            <div className="coin-container">
                <div className={cn("coin", result && "transition-transform duration-500", result === 'team1' ? 'rotate-y-0' : 'rotate-y-180' )}>
                    <div className="coin-face front">
                        <VersusLogo className="w-16 h-16" />
                    </div>
                    <div className="coin-face back">
                        <VersusLogo className="w-16 h-16" />
                    </div>
                </div>
            </div>
            <p className="font-headline text-xl sm:text-2xl mt-4 text-center">
                {result ? `¡${result === 'team1' ? team1Name : team2Name} elige primero!` : 'Lanzando la moneda...'}
            </p>
        </div>
    );
}
