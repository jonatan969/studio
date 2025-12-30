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

// In a real app, this would be in a user store/context and fetched from a server
const FAKE_USERS = [
  {
    nickname: 'Admin',
    password: 'password',
    name: 'Admin',
    isAdmin: true,
    photo: '',
  },
  {
    nickname: 'Player1',
    password: 'password',
    name: 'Player 1',
    isAdmin: false,
    photo: '',
  },
];


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-background');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      // In a real app, you would have a user list
      if (typeof window !== 'undefined') {
        const existingUsers = JSON.parse(localStorage.getItem('users') || JSON.stringify(FAKE_USERS));
        const user = existingUsers.find(
          (u: any) => u.nickname === nickname && u.password === password
        );

        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          toast({
            title: 'Login Successful',
            description: `Welcome back, ${user.name}!`,
          });
          router.push('/dashboard');
        } else {
          toast({
            variant: 'destructive',
            title: 'Login Failed',
            description: 'Invalid nickname or password. Please try again.',
          });
          setIsLoading(false);
        }
      }
    }, 1000);
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
            <CardTitle className="font-headline text-3xl">Versus Draft</CardTitle>
            <CardDescription>Log in to create or join a draft room.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-left">
                <Label htmlFor="nickname">Nickname</Label>
                <Input
                  id="nickname"
                  type="text"
                  placeholder="Your Nickname"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2 text-left">
                <Label htmlFor="password">Password</Label>
                 <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="password"
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
                {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </Button>
               <p className="text-xs text-muted-foreground">
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent hover:underline">
                  Sign Up
                </Link>
              </p>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                <p>Admin: Admin / password</p>
                <p>Player: Player1 / password</p>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
