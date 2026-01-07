
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useUser, useAuth, useFirestore } from '@/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, refreshUser } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  
  const [photoURL, setPhotoURL] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    } else if (user) {
      setPhotoURL(user.photoURL || '');
      setNickname(user.displayName || '');
    }
  }, [user, isUserLoading, router]);

  const getInitials = (name: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  const handleSave = async () => {
    if (!user || !auth.currentUser || !firestore) {
        toast({ variant: 'destructive', title: 'No Autenticado', description: 'Debes iniciar sesión para actualizar tu perfil.' });
        return;
    }
    
    const hasPhotoChanged = photoURL !== user.photoURL;
    const hasNicknameChanged = nickname !== user.displayName;

    if (!hasPhotoChanged && !hasNicknameChanged) {
        toast({ title: 'Sin Cambios', description: 'No has modificado ningún dato.' });
        return;
    }
    
    setIsLoading(true);

    try {
      await updateProfile(auth.currentUser, { 
          photoURL: photoURL,
          displayName: nickname,
      });

      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, {
          nickname: nickname,
          photoURL: photoURL,
      });
      
      await refreshUser();
      
      toast({
        title: 'Perfil Actualizado',
        description: 'Tus datos han sido guardados.',
      });
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Actualización Fallida',
            description: error.message || 'No se pudo actualizar tu perfil.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <PageHeader/>
        <main className="flex flex-1 items-center justify-center">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <PageHeader />
      <main className="flex-1 container py-4 sm:py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className='flex items-center justify-between'>
                <CardTitle className="font-headline text-2xl sm:text-3xl">Tu Perfil</CardTitle>
                {user.role === 'admin' && <Badge>Administrador</Badge>}
            </div>
            <CardDescription>Ve y edita la información de tu perfil.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={photoURL || undefined} alt={nickname || ''} />
                <AvatarFallback className="text-3xl">{getInitials(nickname || '')}</AvatarFallback>
              </Avatar>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="picture-url">URL de Foto de Perfil</Label>
                <Input 
                  id="picture-url" 
                  type="text" 
                  placeholder="https://ejemplo.com/imagen.png"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nickname">Apodo (Nickname)</Label>
              <Input 
                id="nickname"
                value={nickname || ''} 
                onChange={(e) => setNickname(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ''} disabled />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Guardar Cambios'}
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
