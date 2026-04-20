"use client";

import { useDoc, useFirestore, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { StoreForm } from "@/components/stores/StoreForm";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Shield } from "lucide-react";
import { use } from "react";
import type { StoreEntry } from "@/types/store";

export default function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const firestore = useFirestore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storeRef = useMemoFirebase(() => {
    if (!firestore || !id) return null;
    return doc(firestore, "stores", id);
  }, [firestore, id]);

  const { data: store, isLoading: loading } = useDoc<StoreEntry>(storeRef);

  const handleUpdate = async (values: StoreEntry) => {
    if (!firestore || !id) return;

    setIsSubmitting(true);
    try {
      // Loại bỏ các trường undefined để tránh lỗi Firestore
      const cleanData = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== undefined)
      );

      await updateDoc(doc(firestore, "stores", id), {
        ...cleanData,
        updatedAt: serverTimestamp()
      });
      
      toast({ title: "ĐÃ CẬP NHẬT", description: "Dữ liệu tiệm đã được đồng bộ hóa thành công." });
      router.push(`/stores/${id}`);
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "LỖI CẬP NHẬT", 
        description: e.message || "Không thể lưu thay đổi vào cơ sở dữ liệu." 
      });
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Đang kết nối hệ thống dữ liệu...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-20 text-center space-y-4">
        <p className="font-black text-red-500 uppercase tracking-widest">LỖI: KHÔNG TÌM THẤY DỮ LIỆU ĐỂ CHỈNH SỬA</p>
        <Button onClick={() => router.push("/stores")} className="futuristic-gradient text-white font-black rounded-xl">Quay Lại Danh Sách</Button>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex items-center gap-6">
        <Button variant="ghost" onClick={() => router.back()} size="icon" className="rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h2 className="text-4xl font-black tracking-normal text-white uppercase">
            Chỉnh Sửa <span className="text-primary">Dữ Liệu Tiệm</span>
          </h2>
          <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest mt-2 flex items-center gap-2">
            <Shield className="w-3 h-3 text-primary" /> HỆ THỐNG ĐANG MỞ KHÓA // ID: {id}
          </p>
        </div>
      </header>
      <StoreForm initialData={store} onSubmit={handleUpdate} isSubmitting={isSubmitting} />
    </div>
  );
}
