
'use client';

import { useEffect, useState } from "react";
import { VersusLogo } from "../icons/logo";
import { cn } from "@/lib/utils";
import Image from "next/image";

type TeamId = 'team1' | 'team2';

interface CoinFlipProps {
    team1Name: string;
    team2Name: string;
    team1Logo?: string | null;
    team2Logo?: string | null;
    winner?: TeamId | null;
    isStatic?: boolean;
}

export function CoinFlip({ team1Name, team2Name, team1Logo, team2Logo, winner, isStatic = false }: CoinFlipProps) {
    const [isFlipping, setIsFlipping] = useState(false);
    
    useEffect(() => {
        // Trigger the animation shortly after mount
        const timer = setTimeout(() => setIsFlipping(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const CoinFace = ({ teamLogo, teamName }: { teamLogo?: string | null, teamName: string }) => {
        if (teamLogo) {
            return <Image src={teamLogo} alt={`${teamName} Logo`} fill className="object-contain p-4" />;
        }
        return <VersusLogo className="w-16 h-16" />;
    };

    // Determine the final rotation based on the winner
    const finalRotation = winner === 'team2' ? 'rotateY(3780deg)' : 'rotateY(3600deg)';
    const staticRotation = winner === 'team2' ? 'rotateY(180deg)' : 'rotateY(0deg)';

    const animationStyle = isStatic 
    ? { transform: staticRotation, transition: 'transform 1s' }
    : {
        animation: isFlipping ? `flip 3s cubic-bezier(0.3, 0, 0.3, 1) forwards` : 'none',
      };

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
                }
                .coin-face {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    -webkit-backface-visibility: hidden;
                    backface-visibility: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    border-width: 4px;
                }
                .front {
                    background-color: hsl(var(--primary) / 0.1);
                    border-color: hsl(var(--primary));
                    color: hsl(var(--primary));
                }
                .back {
                    background-color: hsl(var(--accent) / 0.1);
                    border-color: hsl(var(--accent));
                    color: hsl(var(--accent));
                    transform: rotateY(180deg);
                }
                @keyframes flip {
                    0% { transform: rotateY(0); }
                    100% { transform: ${finalRotation}; }
                }
            `}</style>
            <div className="coin-container">
                <div className="coin" style={animationStyle}>
                    <div className="coin-face front">
                        <CoinFace teamLogo={team1Logo} teamName={team1Name}/>
                    </div>
                    <div className="coin-face back">
                       <CoinFace teamLogo={team2Logo} teamName={team2Name}/>
                    </div>
                </div>
            </div>
            <p className="font-headline text-xl sm:text-2xl mt-4 text-center">
                {isStatic ? `El primer elector es ${winner === 'team1' ? team1Name : team2Name}` : (isFlipping ? 'Lanzando la moneda...' : '¡Prepárate!')}
            </p>
        </div>
    );
}
