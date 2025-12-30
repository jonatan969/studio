'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';

interface User {
  name: string;
  nickname: string;
  isAdmin: boolean;
  photo?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setNewPhoto(parsedUser.photo || null);
    } else {
      router.push('/');
    }
  }, [router]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  const handleSave = () => {
    if (!user) return;
    setIsLoading(true);

    setTimeout(() => {
      const updatedUser = { ...user, photo: newPhoto };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Also update the master list of users for persistence across logins
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = allUsers.findIndex((u: any) => u.nickname === user.nickname);
      if (userIndex !== -1) {
        allUsers[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(allUsers));
      }

      setUser(updatedUser);
      setIsLoading(false);
      toast({
        title: 'Profile Updated',
        description: 'Your profile photo has been saved.',
      });
    }, 1000);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader />
      <main className="container py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Your Profile</CardTitle>
            <CardDescription>View and edit your profile information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={newPhoto || undefined} alt={user.name} />
                <AvatarFallback className="text-3xl">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture">Profile Photo</Label>
                <div className="flex gap-2">
                    <Input id="picture" type="file" accept="image/*" className="cursor-pointer" onChange={handlePhotoUpload} />
                    <Button variant="outline" size="icon" className="flex-shrink-0" asChild>
                       <Label htmlFor="picture" className="cursor-pointer"><Upload/></Label>
                    </Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nickname</Label>
              <Input value={user.nickname} disabled />
            </div>
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={user.name} disabled />
            </div>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
