"use client";

import { useFirestore, useUser } from "@/firebase";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { StoreForm } from "@/components/stores/StoreForm";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import type { StoreEntry } from "@/types/store";

export default function NewStorePage() {
  const firestore = useFirestore();
  const { profile, loading: isUserLoading } = useUser();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isUserLoading && profile && profile.role !== "Admin") {
      toast({ 
        variant: "destructive", 
        title: "TRUY CẬP BỊ TỪ CHỐI", 
        description: "Bạn không có đủ cấp bậc để thực hiện thao tác này." 
      });
      router.replace("/");
    }
  }, [profile, isUserLoading, router]);

  const handleCreate = async (values: StoreEntry) => {
    if (!firestore || !profile) {
      toast({ variant: "destructive", description: "Hệ thống chưa sẵn sàng hoặc phiên làm việc hết hạn." });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const cleanData = Object.fromEntries(
        Object.entries(values).filter(([_, v]) => v !== undefined && v !== null && v !== "")
      );

      await addDoc(collection(firestore, "stores"), {
        ...cleanData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        responsibleUserId: profile.id
      });

      toast({ title: "ĐÃ LƯU", description: "Dữ liệu tiệm mới đã được tích hợp thành công." });
      router.push("/");
    } catch (e: any) {
      toast({ 
        variant: "destructive", 
        title: "LỖI CƠ SỞ DỮ LIỆU", 
        description: "Không thể lưu dữ liệu tiệm." 
      });
      setIsSubmitting(false);
    }
  };

  if (isUserLoading || (profile && profile.role !== "Admin")) {
    return (
      <div className="p-20 text-center">
        <p className="font-black uppercase tracking-[0.5em] text-slate-500 animate-pulse">Đang xác thực quyền quản trị...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="space-y-4">
        <h2 className="text-4xl font-black tracking-normal text-white uppercase">
          Khởi Tạo <span className="text-primary">Tiệm Mới</span>
        </h2>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
          <Shield className="w-3 h-3 text-primary" /> Quyền Quản Trị Đang Hoạt Động // Đồng Bộ Thời Gian Thực
        </p>
      </header>
      <StoreForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
    </div>
  );
}
