"use client";

import { useState } from "react";
import { StoreEntry } from "@/types/store";
import { isStoreIncomplete } from "@/app/lib/store-utils";
import { Search, Edit, Trash2, Eye, MapPin, AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useFirebase, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StoreTableProps {
  stores: StoreEntry[];
  isAdmin?: boolean;
}

export function StoreTable({ stores, isAdmin }: StoreTableProps) {
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("ALL");
  const { profile } = useFirebase();
  const firestore = useFirestore();

  const filteredStores = stores.filter(store => {
    const matchesSearch = store.storeName?.toLowerCase().includes(search.toLowerCase()) ||
                          store.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                          (store.customerPhone && store.customerPhone.includes(search));
    const matchesPackage = packageFilter === "ALL" || store.package === packageFilter;
    return matchesSearch && matchesPackage;
  });

  const isActualAdmin = profile?.role === "Admin";

  const handleDelete = (id: string, name: string) => {
    if (!firestore || !id) return;
    const docRef = doc(firestore, "stores", id);
    deleteDocumentNonBlocking(docRef);
    toast({ 
      title: "LỆNH ĐÃ THỰC THI", 
      description: `Hệ thống đang gỡ bỏ hồ sơ ${name}...` 
    });
  };

  return (
    <div className="space-y-8 p-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Tìm kiếm theo tên tiệm, khách hàng..." 
            className="pl-12 h-14 bg-white/5 border-white/10 text-xs font-black placeholder:text-slate-600 rounded-2xl focus:border-primary/50 transition-all text-white uppercase tracking-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-primary/50">
              <SelectValue placeholder="Chọn gói" />
            </SelectTrigger>
            <SelectContent className="select-content-solid border-white/10 text-white">
              <SelectItem value="ALL" className="font-bold">TẤT CẢ GÓI</SelectItem>
              <SelectItem value="PRO" className="font-bold">GÓI PRO</SelectItem>
              <SelectItem value="PLUS" className="font-bold">GÓI PLUS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Thông Tin Tiệm</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest">Khách Hàng</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Gói</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Phụ Trách</th>
              <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStores.map((store) => {
              const incomplete = isStoreIncomplete(store);
              const assignedList = Array.isArray(store.assignedTo) 
                ? store.assignedTo 
                : (store.assignedTo ? [store.assignedTo as unknown as string] : []);

              return (
                <tr key={store.id} className="hover:bg-white/5 transition-all duration-300 group">
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="font-black text-white text-sm flex items-center gap-3 uppercase tracking-normal">
                        {store.storeName}
                        {incomplete && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-[8px] uppercase px-2 py-0.5 animate-pulse">Cập Nhật</Badge>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2 font-bold uppercase tracking-normal group-hover:text-slate-400 transition-colors">
                        <MapPin className="w-3 h-3 shrink-0 text-primary" /> {store.address}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-xs font-black text-slate-300 uppercase tracking-normal">{store.customerName}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-normal">{store.customerPhone}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <Badge variant="outline" className="text-[9px] font-black px-3 py-1 border-white/10 text-primary uppercase tracking-widest bg-primary/5">
                      {store.package || "PRO"}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex -space-x-2 items-center justify-center">
                      {assignedList.slice(0, 3).map((name, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-xl futuristic-gradient border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-white uppercase shadow-lg" title={name}>
                          {name ? name[0] : "?"}
                        </div>
                      ))}
                      {assignedList.length > 3 && (
                        <div className="w-8 h-8 rounded-xl bg-primary border-2 border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-xl ring-1 ring-white/20">
                          +{assignedList.length - 3}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-500 hover:text-primary hover:bg-primary/10 rounded-xl">
                        <Link href={`/stores/${store.id}`}><Eye className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl">
                        <Link href={`/stores/${store.id}/edit`}><Edit className="w-4 h-4" /></Link>
                      </Button>
                      
                      {isActualAdmin && store.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-10 w-10 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-white/5 backdrop-blur-md border border-white/10 text-white rounded-[2rem]">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-xl font-black uppercase flex items-center gap-3">
                                <AlertTriangle className="text-red-500" /> Xác nhận xóa hồ sơ
                              </AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400 font-bold uppercase text-xs tracking-normal">
                                Bạn có chắc chắn muốn xóa vĩnh viễn tiệm <span className="text-white">"{store.storeName}"</span>? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-4">
                              <AlertDialogCancel className="rounded-xl border-white/10 bg-white/5 font-black uppercase text-xs">Hủy bỏ</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDelete(store.id!, store.storeName)}
                                className="rounded-xl bg-red-500 hover:bg-red-600 font-black uppercase text-xs"
                              >
                                Xóa vĩnh viễn
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
