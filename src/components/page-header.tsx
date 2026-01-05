'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ChevronDown, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';

export function PageHeader() {
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();

  const handleLogout = () => {
    auth.signOut();
    router.push('/');
  };
  
  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-card/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Image src="https://cdn.discordapp.com/attachments/763207743016009759/1457539983916142818/IconDraftSystem.png?ex=695c5f63&is=695b0de3&hm=35b93fbf8b71785c0118d7fdc963ebbacb2c9a867532d6d3ccc9f15b0e47f550&" alt="KBA Draft Logo" width={40} height={40} className="h-10 w-10 text-primary" />
            <div className="flex flex-col">
              <span className="font-bold font-headline text-sm leading-tight">KBA</span>
              <span className="font-bold font-headline text-sm leading-tight">DRAFT</span>
            </div>
          </Link>
        </div>
        <div className="flex w-full items-center justify-between md:justify-end">
          <Link href="/dashboard" className="flex items-center space-x-2 md:hidden">
             <Image src="https://cdn.discordapp.com/attachments/763207743016009759/1457539983916142818/IconDraftSystem.png?ex=695c5f63&is=695b0de3&hm=35b93fbf8b71785c0118d7fdc963ebbacb2c9a867532d6d3ccc9f15b0e47f550&" alt="KBA Draft Logo" width={32} height={32} className="h-8 w-8 text-primary" />
             <div className="flex flex-col">
              <span className="font-bold font-headline text-xs leading-tight">KBA</span>
              <span className="font-bold font-headline text-xs leading-tight">DRAFT</span>
            </div>
          </Link>
          <nav className="flex items-center space-x-1">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1 h-auto rounded-full">
                    <Avatar className="h-8 w-8">
                       <AvatarImage src={user.photoURL || undefined} alt={user.displayName || ''} />
                       <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                    </Avatar>
                    <span className="hidden md:inline-block">{user.displayName}</span>
                    <ChevronDown className="h-4 w-4 hidden md:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <DropdownMenuItem onSelect={() => router.push('/admin')} className="cursor-pointer">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Panel</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onSelect={() => router.push('/profile')} className="cursor-pointer">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
