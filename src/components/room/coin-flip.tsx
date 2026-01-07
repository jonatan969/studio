'use client';

import { useEffect, useState } from "react";
import { VersusLogo } from "../icons/logo";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface CoinFlipProps {
    team1Name: string;
    team2Name: string;
    team1Logo?: string | null;
    team2Logo?: string | null;
}

export function CoinFlip({ team1Name, team2Name, team1Logo, team2Logo }: CoinFlipProps) {
    const [isFlipping, setIsFlipping] = useState(false);
    
    useEffect(() => {
        setIsFlipping(true);
        // The animation is purely visual. The winner is decided in the parent component.
    }, []);

    const CoinFace = ({ teamLogo, teamId }: { teamLogo?: string | null, teamId: 'team1' | 'team2'}) => {
        const teamColor = teamId === 'team1' ? 'hsl(var(--primary))' : 'hsl(var(--accent))';
        if (teamLogo) {
            return <Image src={teamLogo} alt="Team Logo" fill className="object-contain p-4" />;
        }
        return <VersusLogo className="w-16 h-16" style={{ color: teamColor }} />;
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
                    animation: ${isFlipping ? 'flip 3s cubic-bezier(0.3, 0, 0.3, 1) forwards' : 'none'};
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
                    background-color: hsl(var(--card));
                    border: 4px solid;
                }
                .front {
                    border-color: hsl(var(--primary));
                }
                .back {
                    border-color: hsl(var(--accent));
                    transform: rotateY(180deg);
                }
                @keyframes flip {
                    0% { transform: rotateY(0); }
                    100% { transform: rotateY(3600deg); }
                }
            `}</style>
            <div className="coin-container">
                <div className={cn("coin")}>
                    <div className="coin-face front">
                        <CoinFace teamLogo={team1Logo} teamId="team1"/>
                    </div>
                    <div className="coin-face back">
                       <CoinFace teamLogo={team2Logo} teamId="team2"/>
                    </div>
                </div>
            </div>
            <p className="font-headline text-xl sm:text-2xl mt-4 text-center">
                Lanzando la moneda...
            </p>
        </div>
    );
}
