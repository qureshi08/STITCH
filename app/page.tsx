
"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
      } else if (user.role === 'ADMIN') {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/client/dashboard');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-ms-black flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-black tracking-[0.4em] text-white font-serif italic">STITCH</h1>
        <Loader2 className="w-6 h-6 animate-spin text-white/30 mx-auto" />
      </div>
    </div>
  );
}
