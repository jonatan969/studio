
'use client';

import { SuperArt } from '@/lib/types';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';
import { ImgurImage } from '../imgur-image';

interface SuperArtSelectorProps {
  superArts: SuperArt[];
  onSelect: (art: SuperArt) => void;
  isSubmitting: boolean;
}

export function SuperArtSelector({ superArts, onSelect, isSubmitting }: SuperArtSelectorProps) {
  const [selectedArt, setSelectedArt] = useState<SuperArt | null>(null);

  const handleSubmit = () => {
    if (selectedArt) {
      onSelect(selectedArt);
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader>
          <CardTitle className="font-headline text-3xl md:text-4xl">Selecciona tu Super Art</CardTitle>
          <CardDescription>Esta elección estará oculta hasta la revelación. Elige sabiamente.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 md:gap-6">
          {superArts.map((art) => (
            <div
              key={art.id}
              onClick={() => !isSubmitting && setSelectedArt(art)}
              className={cn(
                'p-4 rounded-lg border-2 transition-all duration-200 relative overflow-hidden',
                isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                selectedArt?.id === art.id ? 'border-accent bg-accent/10' : 'border-border hover:border-primary'
              )}
            >
              {selectedArt?.id === art.id && (
                <CheckCircle className="absolute top-2 right-2 h-5 w-5 text-accent z-10" />
              )}
               <div className="relative h-32 w-full mb-4 rounded-md overflow-hidden">
                <ImgurImage src={art.image} alt={art.name} fill className="object-cover img-pixelated" />
              </div>
              <h3 className="font-headline text-base md:text-lg text-accent font-bold mb-1">{art.name}</h3>
              <p className="text-muted-foreground text-xs">{art.description}</p>
            </div>
          ))}
        </CardContent>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!selectedArt || isSubmitting} className="w-full max-w-xs mx-auto font-bold text-md md:text-lg py-5 md:py-6">
            {isSubmitting ? (
              <>
                <CheckCircle className="mr-2" />
                Confirmado
              </>
            ) : (
             'Confirmar Super Art'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
