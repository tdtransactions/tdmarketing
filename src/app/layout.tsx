"use client";

import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { useFirebase } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, Bell, Search, User as UserIcon, Zap } from 'lucide-react';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useFirebase();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!profile && pathname !== '/login') {
        router.replace('/login');
      } else if (profile?.role === 'Sale' && !pathname.startsWith('/requests') && pathname !== '/login') {
        router.replace('/requests');
      }
    }
  }, [profile, loading, pathname, router, mounted]);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Đang khởi tạo hệ thống...</p>
        </div>
      </div>
    );
  }

  if (!profile && pathname !== '/login') {
    return null;
  }

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/login';

  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <title>TD TRANSACTIONS marketing</title>
      </head>
      <body className="antialiased">
        <FirebaseClientProvider>
          <FirebaseErrorListener />
          <AuthGuard>
            {isLoginPage ? (
              <div className="min-h-screen">{children}</div>
            ) : (
              <div className="flex min-h-screen relative overflow-hidden">
                <aside className="hidden lg:block w-72 fixed inset-y-0 z-30 glass border-r border-white/10">
                  <Sidebar />
                </aside>
                <main className="flex-1 lg:pl-72 flex flex-col min-h-screen">
                  <header className="h-20 border-b border-white/10 glass sticky top-0 z-20 flex items-center justify-between px-8">
                    <div className="lg:hidden flex flex-col">
                      <div className="font-black text-white text-lg tracking-tight uppercase leading-none">
                        TD TRANSACTIONS
                      </div>
                      <div className="text-[10px] font-bold text-primary uppercase tracking-[0.3em] mt-1">
                        marketing
                      </div>
                    </div>
                    <div className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2 w-96 group focus-within:border-primary/50 transition-all">
                      <Search className="w-4 h-4 text-slate-500 mr-2" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm trong hệ thống..." 
                        className="bg-transparent border-none focus:ring-0 text-xs w-full font-bold placeholder:text-slate-600 text-white"
                      />
                    </div>
                    <div className="flex items-center gap-6">
                      <button className="p-2.5 text-slate-400 hover:text-white bg-white/5 rounded-xl border border-white/5 transition-all">
                        <Bell className="w-5 h-5" />
                      </button>
                      <UserNav />
                    </div>
                  </header>
                  <div className="p-8 max-w-7xl mx-auto w-full animate-fade-in">
                    {children}
                  </div>
                </main>
              </div>
            )}
          </AuthGuard>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

function UserNav() {
  const { profile } = useFirebase();
  if (!profile) return null;

  return (
    <div className="flex items-center gap-4 pl-6 border-l border-white/10 cursor-pointer hover:opacity-80 transition-all group">
      <div className="text-right hidden sm:block">
        <p className="text-xs font-black text-white uppercase tracking-normal group-hover:text-primary transition-colors">{profile.displayName}</p>
        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">{profile.role === 'Admin' ? 'QUẢN TRỊ VIÊN' : profile.role}</p>
      </div>
      <div className="w-10 h-10 rounded-2xl futuristic-gradient flex items-center justify-center text-white text-xs font-black shadow-lg shadow-primary/20 transform group-hover:scale-105 transition-all">
        {(profile.displayName || "U").charAt(0)}
      </div>
    </div>
  );
}