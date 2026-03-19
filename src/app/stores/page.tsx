"use client";

import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { StoreTable } from "@/components/stores/StoreTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Filter, Loader2, AlertCircle } from "lucide-react";

export default function StoresPage() {
  const firestore = useFirestore();
  const { profile, loading: isUserLoading } = useUser();

  const storesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "stores"), orderBy("createdAt", "desc"), limit(100));
  }, [firestore]);

  const { data: stores, isLoading: loadingStores, error } = useCollection(storesQuery);

  const isAdmin = profile?.role === "Admin";

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Đang tải danh sách hệ thống...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-normal text-white uppercase">Quản Lý Tiệm</h2>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-1">
            TỔNG SỐ: <span className="text-white">{stores?.length || 0}</span> HỒ SƠ ĐÃ GHI NHẬN
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl glass text-white border-white/10 hover:bg-white/5 h-11 px-6 font-black text-[10px] uppercase tracking-widest"><Filter className="w-4 h-4 mr-2" /> Lọc</Button>
          {isAdmin && (
            <Button asChild className="futuristic-gradient text-white font-black rounded-xl border border-white/20 shadow-lg shadow-primary/20 h-11 px-6 text-[10px] uppercase tracking-widest">
              <Link href="/stores/new"><Plus className="w-4 h-4 mr-2" /> Thêm Tiệm</Link>
            </Button>
          )}
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs font-black uppercase">Lỗi đồng bộ dữ liệu: {error.message}.</p>
        </div>
      )}

      {loadingStores ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest">Đang truy cập cơ sở dữ liệu thời gian thực...</p>
        </div>
      ) : stores && stores.length > 0 ? (
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <StoreTable stores={stores} isAdmin={isAdmin} />
        </div>
      ) : (
        <div className="p-20 text-center glass-card border-dashed rounded-[2.5rem]">
          <p className="text-slate-500 text-lg font-black uppercase tracking-tight">Hệ thống hiện đang trống dữ liệu.</p>
          {isAdmin && (
            <Button asChild className="mt-8 futuristic-gradient text-white font-black rounded-2xl h-14 px-10 shadow-2xl shadow-primary/30 uppercase tracking-widest text-xs">
              <Link href="/stores/new">Khởi tạo tiệm đầu tiên</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}