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
import { useUser, useFirestore, useFirebaseApp, updateDocumentNonBlocking } from '@/firebase';
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const firebaseApp = useFirebaseApp();
  
  const [newPhoto, setNewPhoto] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/');
    } else if (user) {
      setNewPhoto(user.photoURL);
    }
  }, [user, isUserLoading, router]);

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
  
  const getInitials = (name: string | null) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '';
  }

  const handleSave = async () => {
    if (!user || !newPhoto) return;
    
    // Only proceed if the new photo is a data URL (i.e., a new upload)
    if (!newPhoto.startsWith('data:')) {
      toast({ title: 'No Changes', description: 'You have not selected a new photo to upload.' });
      return;
    }
    
    setIsLoading(true);

    try {
      const storage = getStorage(firebaseApp);
      const storagePath = `profile-photos/${user.uid}`;
      const newStorageRef = ref(storage, storagePath);

      // If user already has a photoURL (and it's a Firebase Storage URL), delete the old one.
      if (user.photoURL && user.photoURL.includes('firebasestorage.googleapis.com')) {
        try {
          const oldStorageRef = ref(storage, user.photoURL);
          await deleteObject(oldStorageRef);
        } catch (error: any) {
          // Log deletion error but don't block the update process
          // It might fail if rules change or file doesn't exist, which is okay.
          console.warn("Could not delete old profile photo:", error.message);
        }
      }
      
      await uploadString(newStorageRef, newPhoto, 'data_url');
      const downloadURL = await getDownloadURL(newStorageRef);

      // Update Firebase Auth user profile
      await updateProfile(user, { photoURL: downloadURL });
      
      // Update Firestore user document
      const userDocRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userDocRef, { photoURL: downloadURL });

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
                <AvatarImage src={newPhoto || undefined} alt={user.displayName || ''} />
                <AvatarFallback className="text-3xl">{getInitials(user.displayName || '')}</AvatarFallback>
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
              <Input value={user.displayName || ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || ''} disabled />
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
