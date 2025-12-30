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
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-4xl text-center animate-in fade-in-50 zoom-in-95 duration-500">
        <CardHeader>
          <CardTitle className="font-headline text-4xl">Select Your Super Art</CardTitle>
          <CardDescription>This choice is hidden until the reveal. Choose wisely.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-6">
          {SUPER_ARTS.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArt(art)}
              className={cn(
                'p-6 rounded-lg border-2 cursor-pointer transition-all duration-200 relative',
                selectedArt?.id === art.id ? 'border-accent bg-accent/10' : 'border-border hover:border-primary'
              )}
            >
              {selectedArt?.id === art.id && (
                <CheckCircle className="absolute top-3 right-3 h-6 w-6 text-accent" />
              )}
              <h3 className="font-headline text-xl text-accent font-bold mb-2">{art.name}</h3>
              <p className="text-muted-foreground">{art.description}</p>
            </div>
          ))}
        </CardContent>
        <CardContent>
          <Button onClick={handleSubmit} disabled={!selectedArt || isSubmitting} className="w-full max-w-xs mx-auto font-bold text-lg py-6">
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
             'Lock In Super Art'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
