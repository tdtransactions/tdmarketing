"use client";

import { useState } from "react";
import { StoreEntry } from "@/types/store";
import { isStoreIncomplete } from "@/app/lib/store-utils";
import { Search, Edit, Trash2, Eye, MapPin, AlertTriangle, Facebook, Instagram, Globe, Store as StoreIcon, SortAsc, Hash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const [sortBy, setSortBy] = useState("START_DATE_DESC");
  const { profile } = useFirebase();
  const firestore = useFirestore();
  const router = useRouter();

  const storesWithIds = stores.map((s, i) => ({
    ...s,
    displayId: `${stores.length - i}-${s.package || "PRO"}-${(s.serviceType || "both").toUpperCase()}`
  }));

  const filteredStores = storesWithIds
    .filter(store => {
      const matchesSearch = store.storeName?.toLowerCase().includes(search.toLowerCase()) ||
                            store.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                            (store.customerPhone && store.customerPhone.includes(search));
      const matchesPackage = packageFilter === "ALL" || store.package === packageFilter;
      return matchesSearch && matchesPackage;
    })
    .sort((a, b) => {
      if (sortBy === "START_DATE_DESC") {
        return (b.startDate || "").localeCompare(a.startDate || "");
      }
      if (sortBy === "EXPIRING_SOON") {
        return (a.endDate || "9999").localeCompare(b.endDate || "9999");
      }
      return 0;
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Tìm kiếm theo tên tiệm, khách hàng..." 
            className="pl-12 h-14 bg-white/5 border-white/10 text-sm font-black placeholder:text-slate-300 rounded-2xl focus:border-primary/50 transition-all text-white uppercase tracking-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-56">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-primary/50">
              <div className="flex items-center gap-2">
                <SortAsc className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Sắp xếp" />
              </div>
            </SelectTrigger>
            <SelectContent className="select-content-solid border-white/10 text-white">
              <SelectItem value="START_DATE_DESC" className="font-bold">MỚI NHẤT (BẮT ĐẦU)</SelectItem>
              <SelectItem value="EXPIRING_SOON" className="font-bold">SẮP HẾT GÓI</SelectItem>
            </SelectContent>
          </Select>
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

      <div className="overflow-hidden rounded-3xl border border-white/5 bg-white/5 shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-4 py-6 text-xs font-black uppercase text-slate-300 tracking-widest text-center w-16 whitespace-nowrap"><Hash className="w-4 h-4 mx-auto" /></th>
              <th className="px-4 py-6 text-xs font-black uppercase text-slate-300 tracking-widest whitespace-nowrap">Thông Tin Tiệm</th>
              <th className="px-4 py-6 text-xs font-black uppercase text-slate-300 tracking-widest whitespace-nowrap w-48">Khách Hàng</th>
              <th className="px-4 py-6 text-xs font-black uppercase text-slate-300 tracking-widest text-center whitespace-nowrap w-24">Gói</th>
              <th className="px-4 py-6 text-xs font-black uppercase text-slate-300 tracking-widest text-center whitespace-nowrap">Phụ Trách</th>
              <th className="px-4 py-6 text-xs font-black uppercase text-slate-300 tracking-widest text-right whitespace-nowrap w-36">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredStores.map((store) => {
              const incomplete = isStoreIncomplete(store);
              const assignedList = Array.isArray(store.assignedTo) 
                ? store.assignedTo 
                : (store.assignedTo ? [store.assignedTo as unknown as string] : []);

              return (
                <tr 
                  key={store.id} 
                  onClick={() => router.push(`/stores/${store.id}`)}
                  className="hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                >
                  <td className="px-4 py-6 text-center">
                    <div className="text-[10px] font-black text-slate-300 group-hover:text-primary transition-colors whitespace-nowrap overflow-hidden text-ellipsis">
                      {store.displayId}
                    </div>
                  </td>
                  <td className="px-4 py-6 min-w-[250px]">
                    <div className="space-y-1.5">
                      <div className="font-black text-white text-base flex items-center gap-2 uppercase tracking-tight">
                        <span className="truncate">{store.storeName}</span>
                        {incomplete && (
                          <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black text-[10px] uppercase px-2.5 py-1 animate-pulse shrink-0">Cập Nhật</Badge>
                        )}
                      </div>
                      <div className="text-xs text-slate-300 flex items-start gap-1.5 font-bold uppercase tracking-tight group-hover:text-slate-300 transition-colors leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-primary mt-0.5" /> 
                        <span>{store.address}</span>
                      </div>
                      <div className="flex gap-2.5 pt-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        {store.facebookLink && <Facebook className="w-3.5 h-3.5 text-blue-500" />}
                        {store.instagramLink && <Instagram className="w-3.5 h-3.5 text-pink-500" />}
                        {store.googleWebsiteLink && <Globe className="w-3.5 h-3.5 text-indigo-400" />}
                        {store.googleBusinessLink && <StoreIcon className="w-3.5 h-3.5 text-emerald-500" />}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-6 w-48 overflow-hidden">
                    <div className="text-sm font-black text-slate-300 uppercase truncate">{store.customerName}</div>
                    <div className="text-xs text-slate-300 font-bold mt-1 uppercase truncate">{store.customerPhone}</div>
                  </td>
                  <td className="px-4 py-6 text-center w-24">
                    <Badge variant="outline" className="text-[10px] font-black px-3 py-1 border-white/10 text-primary uppercase bg-primary/5 rounded-lg">
                      {store.package || "PRO"}
                    </Badge>
                  </td>
                  <td className="px-4 py-6 text-center">
                    <div className="flex flex-wrap justify-center gap-2 max-w-[200px] mx-auto">
                      {assignedList.map((name, idx) => (
                        <Badge key={idx} variant="outline" className="text-[10px] font-black border-white/10 bg-white/5 text-slate-300 uppercase px-3 py-1 rounded-lg whitespace-nowrap">
                          {name}
                        </Badge>
                      ))}
                      {assignedList.length === 0 && <span className="text-xs text-slate-300 font-bold uppercase opacity-50">Trống</span>}
                    </div>
                  </td>
                  <td className="px-4 py-6 text-right w-36">
                    <div 
                      className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-300 hover:text-primary hover:bg-primary/10 rounded-xl">
                        <Link href={`/stores/${store.id}`}><Eye className="w-4 h-4" /></Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl">
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
