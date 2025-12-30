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
import { useUser, useFirestore, useAuth, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading, refreshUser } = useUser();
  const firestore = useFirestore();
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
        toast({ variant: 'destructive', title: 'Not Authenticated', description: 'You must be logged in to update your profile.' });
        return;
    }
    if (photoURL === user.photoURL) {
        toast({ title: 'No Changes', description: 'The new photo URL is the same as the old one.' });
        return;
    }
    
    setIsLoading(true);

    try {
      // Update Firebase Auth user profile
      await updateProfile(auth.currentUser, { photoURL: photoURL });
      
      // Update Firestore user document
      if (firestore) {
        const userDocRef = doc(firestore, 'users', user.uid);
        // This is a non-blocking call.
        updateDocumentNonBlocking(userDocRef, { photoURL: photoURL });
      }
      
      // Manually trigger a refresh of the user object to get the latest photoURL
      await refreshUser();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile photo has been saved.',
      });
    } catch(error: any) {
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: error.message || 'Could not update your profile photo.',
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
                <AvatarImage src={photoURL || undefined} alt={user.displayName || ''} />
                <AvatarFallback className="text-3xl">{getInitials(user.displayName || '')}</AvatarFallback>
              </Avatar>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="picture-url">Profile Photo URL</Label>
                <Input 
                  id="picture-url" 
                  type="text" 
                  placeholder="https://example.com/image.png"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nickname</Label>
              <Input value={user.displayName || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ''} disabled />
            </div>
            <Button onClick={handleSave} disabled={isLoading || photoURL === user.photoURL}>
              {isLoading ? <Loader2 className="animate-spin" /> : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
