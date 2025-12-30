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
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
        await signInWithEmailAndPassword(auth, email, password);
        toast({
            title: 'Conexion Exitosa',
            description: `Bienvenido denuevo!`,
        });
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Conexion Fallida',
            description: error.message || 'Usuario o Contraseña incorrectos. Por favor intentalo denuevo.',
        });
        setIsLoading(false);
    }
  };
  
  const generateEmail = (nickname: string) => `${nickname.toLowerCase().replace(/\s+/g, '')}@draft.com`;


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
            <CardTitle className="font-headline text-3xl">KBA Draft</CardTitle>
            <CardDescription>Ingresa para crear o entrar a una sala de Draft.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="nickname">Usuario</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Nickname"
                  required
                  value={email.split('@')[0]}
                  onChange={(e) => setEmail(generateEmail(e.target.value))}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Contraseña</Label>
                 <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="nickname123"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
              </Button>
               <p className="text-xs text-muted-foreground">
                No tienes una cuenta?{' '}
                <Link href="/signup" className="text-accent hover:underline">
                  Registrate
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
