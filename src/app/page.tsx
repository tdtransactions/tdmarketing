"use client";

import { useUser, useFirestore, useCollection, useFirebase, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { isStoreIncomplete } from "@/app/lib/store-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Store as StoreIcon, AlertTriangle, CheckCircle, ShieldCheck, Plus, Zap, Activity } from "lucide-react";
import { StoreTable } from "@/components/stores/StoreTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { user, profile, loading: isUserLoading } = useUser();
  const firestore = useFirestore();
  
  const storesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "stores"), orderBy("createdAt", "desc"), limit(50));
  }, [firestore]);

  const { data: stores, isLoading: loadingStores } = useCollection(storesQuery);

  const isAdmin = profile?.role === "Admin";

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Đang đồng bộ hóa hệ thống...</p>
      </div>
    );
  }

  const totalStores = stores?.length || 0;
  const incompleteStores = stores?.filter(isStoreIncomplete).length || 0;
  const verifiedStores = stores?.filter(s => s.googleVerified).length || 0;
  
  const stats = [
    { label: "Tổng số Tiệm", value: totalStores, icon: StoreIcon, color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { label: "Cần Cập Nhật", value: incompleteStores, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Đã Xác Minh", value: verifiedStores, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Vai Trò", value: profile?.role === 'Admin' ? 'ADMIN' : (profile?.role || "NHÂN VIÊN"), icon: ShieldCheck, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="space-y-2">
          <h2 className="text-4xl font-black tracking-normal text-white uppercase">
            Trung Tâm <span className="text-primary">Điều Hành</span>
          </h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
            NGƯỜI DÙNG: <span className="text-white">{profile?.displayName || user?.email}</span> // HỆ THỐNG: ĐANG HOẠT ĐỘNG
          </p>
        </div>
        {isAdmin && (
          <Button asChild size="lg" className="futuristic-gradient text-white font-black rounded-2xl h-14 px-10 shadow-2xl shadow-primary/30 uppercase tracking-widest text-xs border border-white/20">
            <Link href="/stores/new">
              <Plus className="w-4 h-4 mr-3" /> Thêm Tiệm Mới
            </Link>
          </Button>
        )}
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <Card key={i} className="glass-card group overflow-hidden border-none rounded-[2.5rem]">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <Activity className="w-4 h-4 text-slate-700 opacity-20" />
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="text-4xl font-black tracking-tight text-white">
                  {loadingStores ? "---" : stat.value}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-3">
            <Zap className="w-5 h-5 text-primary fill-current" /> Dữ Liệu Gần Đây
          </h3>
          <Link href="/stores" className="text-[10px] font-black text-primary hover:text-white uppercase tracking-widest transition-colors">Xem tất cả</Link>
        </div>
        <div className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
          {loadingStores ? (
            <div className="p-12 space-y-6">
              <Skeleton className="h-10 w-full bg-white/5" />
              <Skeleton className="h-10 w-5/6 bg-white/5" />
              <Skeleton className="h-10 w-4/6 bg-white/5" />
            </div>
          ) : (
            <StoreTable 
              stores={stores || []} 
              isAdmin={isAdmin}
            />
          )}
        </div>
      </div>
    </div>
  );
}