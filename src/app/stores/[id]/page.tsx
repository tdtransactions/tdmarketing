"use client";

import { useDoc, useFirestore, useFirebase, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { StoreDetail } from "@/components/stores/StoreDetail";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Loader2 } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { StoreEntry } from "@/types/store";

export default function StoreDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { profile } = useFirebase();
  const firestore = useFirestore();
  const router = useRouter();

  const storeRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "stores", id);
  }, [firestore, id]);

  const { data: store, isLoading: loading } = useDoc<StoreEntry>(storeRef);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Đang truy xuất hồ sơ...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-20 text-center space-y-6">
        <p className="text-red-500 font-black uppercase text-sm tracking-widest">LỖI: HỒ SƠ KHÔNG TỒN TẠI HOẶC ĐÃ BỊ GỠ BỎ</p>
        <Button onClick={() => router.push("/stores")} className="futuristic-gradient text-white font-black rounded-xl">Quay Lại Danh Sách</Button>
      </div>
    );
  }

  const role = profile?.role;
  const canEdit = role === "Admin" || role === "Manager" || role === "Staff";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="icon" className="rounded-xl border border-white/10 hover:bg-white/5">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Button>
          <h2 className="text-3xl font-black text-white uppercase tracking-normal">Chi Tiết Hồ Sơ</h2>
        </div>
        {canEdit && (
          <Button asChild className="futuristic-gradient text-white font-black rounded-xl h-11 px-6 shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px]">
            <Link href={`/stores/${id}/edit`}><Edit className="w-4 h-4 mr-2" /> Chỉnh sửa</Link>
          </Button>
        )}
      </header>
      <StoreDetail store={store} />
    </div>
  );
}
