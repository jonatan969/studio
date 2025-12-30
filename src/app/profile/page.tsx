'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser, useAuth } from '@/firebase';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, refreshUser } = useUser();
  const auth = useAuth();
  
  const [photoURL, setPhotoURL] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    } else if (user) {
      setPhotoURL(user.photoURL || '');
    }
  }, [user, isUserLoading, router]);

  const getInitials = (name: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const handleSave = async () => {
    if (!user || !auth.currentUser) {
        toast({ variant: 'destructive', title: 'No Autenticado', description: 'Debes iniciar sesión para actualizar tu perfil.' });
        return;
    }
    if (photoURL === user.photoURL) {
        toast({ title: 'Sin Cambios', description: 'La nueva URL de la foto es la misma que la anterior.' });
        return;
    }
    
    setIsLoading(true);

    try {
      // Update Firebase Auth user profile
      await updateProfile(auth.currentUser, { photoURL: photoURL });
      
      // Manually trigger a refresh of the user object to get the latest photoURL
      await refreshUser();
      
      toast({
        title: 'Perfil Actualizado',
        description: 'Tu foto de perfil ha sido guardada.',
      });
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Actualización Fallida',
            description: error.message || 'No se pudo actualizar tu foto de perfil.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Tu Perfil</CardTitle>
            <CardDescription>Ve y edita la información de tu perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={photoURL || undefined} alt={user.displayName || ''} />
                <AvatarFallback className="text-3xl">{getInitials(user.displayName || '')}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture-url">URL de Foto de Perfil</Label>
                <Input 
                  id="picture-url" 
                  type="text" 
                  placeholder="https://ejemplo.com/imagen.png"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Apodo</Label>
              <Input value={user.displayName || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ''} disabled />
            </div>
            <Button onClick={handleSave} disabled={isLoading || photoURL === user.photoURL}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
