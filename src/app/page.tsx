'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useAuth, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"


export default function AuthPage() {
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const firestore = useFirestore();

  const [loginNickname, setLoginNickname] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupNickname, setSignupNickname] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');
  
  const generateEmail = (nickname: string) => `${nickname.toLowerCase().replace(/\s+/g, '')}@draft.com`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const email = generateEmail(loginNickname);
    try {
        await signInWithEmailAndPassword(auth, email, loginPassword);
        toast({
            title: 'Conexión Exitosa',
            description: `¡Bienvenido de nuevo!`,
        });
        router.push('/dashboard');
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Conexión Fallida',
            description: 'Usuario o Contraseña incorrectos. Por favor inténtalo de nuevo.',
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore) {
        toast({ variant: 'destructive', title: 'Error', description: 'La base de datos no está disponible.' });
        return;
    }
    setIsLoading(true);
    
    const email = generateEmail(signupNickname);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, signupPassword);
      const user = userCredential.user;

      await updateProfile(user, { displayName: signupNickname });
      
      const userDocRef = doc(firestore, 'users', user.uid);
      const userData = {
        uid: user.uid,
        email: user.email,
        nickname: signupNickname,
        photoURL: null,
        role: 'user', // Default role
      };

      await setDoc(userDocRef, userData);

      toast({
        title: '¡Cuenta Creada!',
        description: 'Ahora puedes conectarte con tu nueva cuenta.',
      });
      
      router.push('/dashboard');

    } catch (error: any) {
       toast({
        variant: 'destructive',
        title: 'Registro Fallido',
        description: error.message || 'No se pudo crear la cuenta. Inténtalo otra vez.',
      });
    } finally {
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

      <main className="z-20 flex w-full max-w-sm flex-col items-center text-center">
        <Card className="w-full">
            <CardHeader className="items-center">
                <Image src="https://i.imgur.com/O6q1g4v.png" alt="KBA Draft Logo" width={48} height={48} className="h-12 w-12 mb-2 text-primary" />
                <CardTitle className="font-headline text-3xl">KBA Draft</CardTitle>
                <CardDescription>Ingresa o regístrate para continuar.</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="login" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Ingresar</TabsTrigger>
                        <TabsTrigger value="register">Registrarse</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login">
                        <form onSubmit={handleLogin}>
                            <CardContent className="space-y-4 pt-4 px-1">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="login-nickname">Usuario</Label>
                                    <Input
                                    id="login-nickname"
                                    type="text"
                                    placeholder="Tu Nickname"
                                    required
                                    value={loginNickname}
                                    onChange={(e) => setLoginNickname(e.target.value)}
                                    disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="login-password">Contraseña</Label>
                                    <div className="relative">
                                    <Input
                                        id="login-password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Tu Contraseña"
                                        required
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
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
                            <CardFooter>
                                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Ingresar'}
                                </Button>
                            </CardFooter>
                        </form>
                    </TabsContent>
                    <TabsContent value="register">
                        <form onSubmit={handleSignup}>
                           <CardContent className="space-y-4 pt-4 px-1">
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="signup-nickname">Usuario (Nickname)</Label>
                                    <Input
                                    id="signup-nickname"
                                    type="text"
                                    placeholder="Elige tu Nickname"
                                    required
                                    value={signupNickname}
                                    onChange={(e) => setSignupNickname(e.target.value)}
                                    disabled={isLoading}
                                    />
                                </div>
                                <div className="space-y-2 text-left">
                                    <Label htmlFor="signup-password">Contraseña</Label>
                                    <Input
                                    id="signup-password"
                                    type="password"
                                    placeholder="Mínimo 6 caracteres"
                                    required
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    disabled={isLoading}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full font-bold" disabled={isLoading}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : 'Crear Cuenta'}
                                </Button>
                            </CardFooter>
                        </form>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
