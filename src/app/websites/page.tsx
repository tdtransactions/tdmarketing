"use client";

import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, where } from "firebase/firestore";
import { WebsiteTable } from "@/components/websites/WebsiteTable";
import { Loader2, AlertCircle, Globe } from "lucide-react";

export default function WebsitesPage() {
  const firestore = useFirestore();
  const { profile, loading: isUserLoading } = useUser();

  const websitesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // We fetch all stores and filter client side to avoid needing a composite index
    // just for this query during initial rollout, or we can query where("hasWebsite", "==", true).
    // Let's use simple where clause. If it needs index, it will throw error, but we can also just fetch and filter.
    // Given Firebase limits, client side filter on a small collection is fine.
    // Let's fetch all and filter to be safe against missing indexes.
    return query(collection(firestore, "stores"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: stores, isLoading: loadingStores, error } = useCollection(websitesQuery);

  const isAdmin = profile?.role === "Admin" || profile?.role === "Manager";

  const websites = stores?.filter(store => store.hasWebsite) || [];

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
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl">
             <Globe className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-normal text-white uppercase">Quản Lý Website</h2>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-1">
              TỔNG SỐ: <span className="text-white">{websites.length}</span> DỰ ÁN WEBSITE
            </p>
          </div>
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
      ) : websites.length > 0 ? (
        <div className="glass-card rounded-[2.5rem] overflow-hidden">
          <WebsiteTable websites={websites} isAdmin={isAdmin} />
        </div>
      ) : (
        <div className="p-20 text-center glass-card border-dashed rounded-[2.5rem]">
          <p className="text-slate-500 text-lg font-black uppercase tracking-tight">Hệ thống hiện không có dự án website nào.</p>
        </div>
      )}
    </div>
  );
}
