import { SuperArt } from "@/lib/game-data"

interface SuperArtIconProps {
    art: SuperArt;
    className?: string;
}

export function SuperArtIcon({ art, className }: SuperArtIconProps) {
    const colorClasses = {
        yellow: 'text-yellow-400',
        red: 'text-red-500',
        blue: 'text-blue-400',
    };

    return (
        <div className={`relative w-8 h-8 flex items-center justify-center font-bold ${className}`}>
            <span className="absolute text-2xl text-yellow-300 font-serif" style={{ textShadow: '0 0 5px gold' }}>S</span>
            <span className={`absolute text-sm ${colorClasses[art.color as keyof typeof colorClasses]}`} style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                {art.roman}
            </span>
        </div>
    )
}
