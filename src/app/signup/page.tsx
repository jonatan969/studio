'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VersusLogo } from '@/components/icons/logo';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useFirestore } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';


export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  
  const generateEmail = (nickname: string) => `${nickname.toLowerCase().replace(/\s+/g, '')}@draft.com`;

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) return;
    setIsLoading(true);
    
    const email = generateEmail(nickname);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nickname });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        nickname: nickname,
        photoURL: null,
      };

      await setDoc(userDocRef, userData);

      toast({
        title: 'Cuenta Creada!',
        description: 'Ahora puedes conectarte con tus nueva cuenta.',
      });
      
      router.push('/');

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Registro Fallido',
        description: error.message || 'No se pudo crear la cuenta. Intentelo otra vez.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4">
      {heroImage && (
         <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover z-0"
            data-ai-hint={heroImage.imageHint}
            priority
          />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10" />

      <main className="z-20 flex flex-col items-center text-center">
        <Card className="w-full max-w-sm">
          <CardHeader className="items-center">
            <VersusLogo className="h-12 w-12 mb-2 text-primary" />
            <CardTitle className="font-headline text-3xl">Crear Cuenta</CardTitle>
            <CardDescription>Crea una cuente e ingresa a KBA Draft ahora.</CardDescription>
          </CardHeader>
          <form onSubmit={handleSignup}>
            <CardContent className="space-y-4">
               <div className="space-y-2 text-left">
                <Label htmlFor="nickname">Usuario</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Nickname"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Registrarse'}
              </Button>
               <p className="text-xs text-muted-foreground">
                Ya tienes una cuenta?{' '}
                <Link href="/" className="text-accent hover:underline">
                  Ingresa
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
