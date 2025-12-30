'use client';

import { SUPER_ARTS, SuperArt } from '@/lib/game-data';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SuperArtSelectorProps {
  onSelect: (art: SuperArt) => void;
  isSubmitting: boolean;
}

export function SuperArtSelector({ onSelect, isSubmitting }: SuperArtSelectorProps) {
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
          {SUPER_ARTS.map((art) => (
            <div
              key={art.id}
              onClick={() => !isSubmitting && setSelectedArt(art)}
              className={cn(
                'p-4 md:p-6 rounded-lg border-2 transition-all duration-200 relative',
                isSubmitting ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                selectedArt?.id === art.id ? 'border-accent bg-accent/10' : 'border-border hover:border-primary'
              )}
            >
              {selectedArt?.id === art.id && (
                <CheckCircle className="absolute top-2 right-2 h-5 w-5 md:h-6 md:w-6 text-accent" />
              )}
              <h3 className="font-headline text-lg md:text-xl text-accent font-bold mb-2">{art.name}</h3>
              <p className="text-muted-foreground text-sm md:text-base">{art.description}</p>
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
