import { SuperArt } from "@/lib/types"

interface SuperArtIconProps {
    art: SuperArt;
    className?: string;
}

export function SuperArtIcon({ art, className }: SuperArtIconProps) {
    const romanColorClasses: { [key: string]: string } = {
        'I': 'text-yellow-400',
        'II': 'text-red-500',
        'III': 'text-blue-400',
    };

    const colorClass = romanColorClasses[art.roman] || 'text-gray-400';

    return (
        <div className={`relative w-8 h-8 flex items-center justify-center font-bold ${className}`}>
            <span className="absolute text-3xl text-orange-400 font-serif" style={{ textShadow: '0 0 8px #e69500' }}>S</span>
            <span 
                className={`absolute text-base ${colorClass}`} 
                style={{ top: '55%', left: '55%', transform: 'translate(-50%, -50%)', textShadow: '1px 1px 2px black' }}
            >
                {art.roman}
            </span>
        </div>
    )
}
