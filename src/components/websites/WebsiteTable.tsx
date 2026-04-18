"use client";

import { useState } from "react";
import { StoreEntry } from "@/types/store";
import { Search, Globe, Facebook, Instagram, Phone, UserCheck, Calendar, CheckCircle2, Circle, Save, FileText, Loader2, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

interface WebsiteTableProps {
  websites: StoreEntry[];
  isAdmin?: boolean;
}

export function WebsiteTable({ websites, isAdmin }: WebsiteTableProps) {
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedWebsite, setSelectedWebsite] = useState<StoreEntry | null>(null);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);

  const firestore = useFirestore();

  const filteredWebsites = websites.filter(site => {
    const matchesSearch = site.storeName?.toLowerCase().includes(search.toLowerCase()) ||
                          site.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                          (site.customerPhone && site.customerPhone.includes(search));
    const matchesPackage = packageFilter === "ALL" || site.package === packageFilter;
    const matchesStatus = statusFilter === "ALL" || site.websiteStatus === statusFilter;
    return matchesSearch && matchesPackage && matchesStatus;
  });

  const toggleStatus = async (e: React.MouseEvent, id: string, currentStatus?: string) => {
    e.stopPropagation();
    if (!firestore || !id) return;
    const newStatus = currentStatus === "completed" ? "pending" : "completed";
    try {
      const docRef = doc(firestore, "stores", id);
      await updateDoc(docRef, { websiteStatus: newStatus });
      toast({
        title: "CẬP NHẬT TRẠNG THÁI",
        description: `Website đã chuyển sang trạng thái: ${newStatus === "completed" ? "HOÀN THÀNH" : "ĐANG CHỜ"}`,
      });
      if (selectedWebsite?.id === id) {
        setSelectedWebsite({ ...selectedWebsite, websiteStatus: newStatus });
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "LỖI CẬP NHẬT",
        description: "Không thể thay đổi trạng thái lúc này."
      });
    }
  };

  const handleRowClick = (site: StoreEntry) => {
    setSelectedWebsite(site);
    setNote(site.websiteNote || "");
  };

  const saveNote = async () => {
    if (!firestore || !selectedWebsite?.id) return;
    setIsSavingNote(true);
    try {
      const docRef = doc(firestore, "stores", selectedWebsite.id);
      await updateDoc(docRef, { websiteNote: note });
      toast({
        title: "ĐÃ LƯU",
        description: "Ghi chú website đã được cập nhật thành công.",
      });
      setSelectedWebsite({ ...selectedWebsite, websiteNote: note });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "LỖI",
        description: "Không thể lưu ghi chú.",
      });
    } finally {
      setIsSavingNote(false);
    }
  };

  return (
    <div className="space-y-8 p-10">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 w-4 h-4 group-focus-within:text-indigo-400 transition-colors" />
          <Input 
            placeholder="Tìm kiếm dự án website..." 
            className="pl-12 h-14 bg-white/5 border-white/10 text-xs font-black placeholder:text-slate-600 rounded-2xl focus:border-indigo-400/50 transition-all text-white uppercase tracking-normal"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="w-full md:w-48">
          <Select value={packageFilter} onValueChange={setPackageFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-indigo-400/50">
              <SelectValue placeholder="Chọn gói" />
            </SelectTrigger>
            <SelectContent className="select-content-solid border-white/10 text-white">
              <SelectItem value="ALL" className="font-bold">TẤT CẢ GÓI</SelectItem>
              <SelectItem value="PRO" className="font-bold">GÓI PRO</SelectItem>
              <SelectItem value="PLUS" className="font-bold">GÓI PLUS</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-indigo-400/50">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="select-content-solid border-white/10 text-white">
              <SelectItem value="ALL" className="font-bold">TẤT CẢ TRẠNG THÁI</SelectItem>
              <SelectItem value="pending" className="font-bold">ĐANG CHỜ</SelectItem>
              <SelectItem value="completed" className="font-bold">HOÀN THÀNH</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-3xl border border-white/5">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest min-w-[200px]">Dự Án / Thời Gian</th>
              <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Liên Hệ</th>
              <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest text-center">Gói</th>
              <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest">Nhân Sự</th>
              <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredWebsites.map((site) => {
              const isCompleted = site.websiteStatus === "completed";
              const assignedList = Array.isArray(site.assignedTo) 
                ? site.assignedTo 
                : (site.assignedTo ? [site.assignedTo as unknown as string] : []);

              return (
                <tr 
                  key={site.id} 
                  onClick={() => handleRowClick(site)}
                  className={cn("transition-all duration-300 group cursor-pointer", isCompleted ? "bg-white/[0.02] opacity-75" : "hover:bg-white/5")}
                >
                  <td className="px-8 py-8">
                    <div className="space-y-3">
                      <div className="font-black text-white text-base uppercase tracking-normal flex items-center gap-3">
                        {site.storeName}
                        {site.googleWebsiteLink && (
                          <a href={site.googleWebsiteLink.startsWith('http') ? site.googleWebsiteLink : `https://${site.googleWebsiteLink}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {site.facebookLink && (
                          <a href={site.facebookLink.startsWith('http') ? site.facebookLink : `https://${site.facebookLink}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-500 hover:text-blue-400 transition-colors">
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {site.instagramLink && (
                          <a href={site.instagramLink.startsWith('http') ? site.instagramLink : `https://${site.instagramLink}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="text-pink-500 hover:text-pink-400 transition-colors">
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 font-bold uppercase tracking-widest">
                        <Calendar className="w-4 h-4 shrink-0 text-slate-500" /> 
                        {site.websiteStartDate || site.startDate} {(site.websiteEndDate || site.endDate) && `→ ${site.websiteEndDate || site.endDate}`}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-8">
                    <div className="text-sm font-black text-white uppercase tracking-normal">{site.customerName}</div>
                    <div className="text-xs text-slate-400 flex items-center gap-1.5 font-bold mt-2 uppercase tracking-normal">
                      <Phone className="w-3.5 h-3.5 text-slate-500" /> {site.customerPhone}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-center">
                    <Badge variant="outline" className="text-[10px] font-black px-4 py-1.5 border-white/10 text-indigo-400 uppercase tracking-widest bg-indigo-500/5">
                      {site.package || "PRO"}
                    </Badge>
                  </td>
                  <td className="px-8 py-8">
                    <div className="space-y-3">
                      {assignedList.length > 0 && (
                        <div className="flex -space-x-2 items-center">
                          {assignedList.slice(0, 3).map((name, idx) => (
                            <div key={idx} className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-[9px] font-black text-indigo-300 uppercase shadow-lg" title={name}>
                              {name ? name[0] : "?"}
                            </div>
                          ))}
                        </div>
                      )}
                      {site.salesPerson && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5" /> Sale: <span className="text-slate-200">{site.salesPerson}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-8 text-right">
                    <Button 
                      variant="ghost" 
                      onClick={(e) => toggleStatus(e, site.id!, site.websiteStatus)}
                      className={cn(
                        "h-10 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all z-10 relative",
                        isCompleted 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20" 
                          : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {isCompleted ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Hoàn Thành</>
                      ) : (
                        <><Circle className="w-4 h-4 mr-2" /> Đang Chờ</>
                      )}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selectedWebsite} onOpenChange={(open) => !open && setSelectedWebsite(null)}>
        <SheetContent className="bg-slate-950 border-l border-white/10 text-white w-full sm:max-w-xl overflow-y-auto p-0">
          {selectedWebsite && (
            <div className="flex flex-col h-full">
              <div className="p-8 border-b border-white/10 bg-white/5">
                <SheetHeader>
                  <SheetTitle className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-3">
                    <Globe className="text-indigo-400" /> {selectedWebsite.storeName}
                  </SheetTitle>
                  <SheetDescription className="text-xs font-bold uppercase text-slate-400 tracking-widest">
                    Chi tiết dự án Website
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="p-8 flex-1 space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Bắt đầu
                    </div>
                    <div className="font-bold text-sm">{selectedWebsite.websiteStartDate || selectedWebsite.startDate}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-red-400" /> Kết thúc
                    </div>
                    <div className="font-bold text-sm">{selectedWebsite.websiteEndDate || selectedWebsite.endDate || "Chưa xác định"}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/10 pb-2">
                    Liên Kết Mạng Xã Hội
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <Facebook className="w-4 h-4 text-blue-500" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-black uppercase text-slate-500">Facebook</div>
                        {selectedWebsite.facebookLink ? (
                          <a href={selectedWebsite.facebookLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-white hover:text-blue-400 truncate block">
                            {selectedWebsite.facebookLink}
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-slate-600">Chưa có</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-black uppercase text-slate-500">Instagram</div>
                        {selectedWebsite.instagramLink ? (
                          <a href={selectedWebsite.instagramLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-white hover:text-pink-400 truncate block">
                            {selectedWebsite.instagramLink}
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-slate-600">Chưa có</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 sm:col-span-2">
                      <Store className="w-4 h-4 text-emerald-500" />
                      <div className="overflow-hidden">
                        <div className="text-[10px] font-black uppercase text-slate-500">Google Business</div>
                        {selectedWebsite.googleBusinessLink ? (
                          <a href={selectedWebsite.googleBusinessLink} target="_blank" rel="noreferrer" className="text-xs font-bold text-white hover:text-emerald-400 truncate block">
                            {selectedWebsite.googleBusinessLink}
                          </a>
                        ) : (
                          <span className="text-xs font-bold text-slate-600">Chưa có</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                   <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Gói Dịch Vụ</div>
                    <Badge variant="outline" className="text-[10px] font-black px-3 py-1 border-white/10 text-indigo-400 uppercase tracking-widest bg-indigo-500/10">
                      {selectedWebsite.package || "PRO"}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Trạng Thái</div>
                    <Badge variant="outline" className={cn("text-[10px] font-black px-3 py-1 border-white/10 uppercase tracking-widest", selectedWebsite.websiteStatus === "completed" ? "text-emerald-400 bg-emerald-500/10" : "text-amber-400 bg-amber-500/10")}>
                      {selectedWebsite.websiteStatus === "completed" ? "HOÀN THÀNH" : "ĐANG CHỜ"}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <UserCheck className="w-3 h-3 text-slate-400" /> Phụ Trách
                    </div>
                    <div className="font-bold text-sm uppercase text-slate-300">
                      {Array.isArray(selectedWebsite.assignedTo) && selectedWebsite.assignedTo.length > 0 
                        ? selectedWebsite.assignedTo.join(", ") 
                        : "Chưa phân công"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <UserCheck className="w-3 h-3 text-slate-400" /> Sales
                    </div>
                    <div className="font-bold text-sm uppercase text-slate-300">
                      {selectedWebsite.salesPerson || "Không có"}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-400" /> Ghi Chú Dự Án
                  </div>
                  <div className="relative">
                    <Textarea 
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Thêm ghi chú, yêu cầu khách hàng, tiến độ..."
                      className="bg-white/5 border-white/10 text-white min-h-[150px] font-bold rounded-2xl focus:border-indigo-400/50 p-6 pb-20"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Button 
                        onClick={saveNote}
                        disabled={isSavingNote || note === (selectedWebsite.websiteNote || "")}
                        className="futuristic-gradient text-white font-black shadow-lg uppercase tracking-widest text-[10px] rounded-xl h-10 px-6 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isSavingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Lưu Ghi Chú</>}
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
