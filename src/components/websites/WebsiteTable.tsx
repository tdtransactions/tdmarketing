"use client";

import { useState } from "react";
import { StoreEntry } from "@/types/store";
import { Search, Globe, Facebook, Instagram, Phone, UserCheck, Calendar, CheckCircle2, Circle, Save, FileText, Loader2, Store, Edit, Clock, Copy, Check, Mail, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, collection } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { InternalStaff } from "@/types/staff";



// Email validation helper
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

interface WebsiteTableProps {
  websites: StoreEntry[];
  isAdmin?: boolean;
}

export function WebsiteTable({ websites, isAdmin }: WebsiteTableProps) {
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [selectedWebsite, setSelectedWebsite] = useState<StoreEntry | null>(null);
  const [note, setNote] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isSavingAssignedTo, setIsSavingAssignedTo] = useState(false);
  
  // States for direct editing in sheet
  const [editWebsiteStartDate, setEditWebsiteStartDate] = useState("");
  const [editWebsiteEndDate, setEditWebsiteEndDate] = useState("");
  const [editGoogleWebsiteLink, setEditGoogleWebsiteLink] = useState("");
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Email notify dialog
  const [notifyDialog, setNotifyDialog] = useState({ 
    open: false, 
    site: null as StoreEntry | null, 
    salesEmail: "", 
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@mytdtransactions.com",
    isSendingSales: false,
    isSendingAdmin: false,
    type: "completed" as "completed" | "processing"
  });

  const firestore = useFirestore();

  // Load staff list to get sales emails
  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "internal_staff");
  }, [firestore]);
  const { data: staffList } = useCollection<InternalStaff>(staffQuery);

  const getSalesEmail = (salesName: string | undefined) => {
    if (!salesName) return "";
    return staffList?.find(s => s.name === salesName)?.email || "";
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  const getMonthDiff = (start: string, end: string) => {
    if (!start || !end) return null;
    const s = new Date(start);
    const e = new Date(end);
    const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    return Math.max(0, months);
  };

  const getRemainingMonths = (end: string) => {
    if (!end) return null;
    const now = new Date();
    const e = new Date(end);
    const months = (e.getFullYear() - now.getFullYear()) * 12 + (e.getMonth() - now.getMonth());
    return months;
  };

  // Extract unique months from websites
  const uniqueMonths = Array.from(new Set(websites.map(s => {
    const dateStr = s.websiteStartDate || s.startDate;
    if (!dateStr) return null;
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getFullYear()}`;
  }).filter(Boolean))).sort((a, b) => {
    const [m1, y1] = a!.split('/').map(Number);
    const [m2, y2] = b!.split('/').map(Number);
    return y2 !== y1 ? y2 - y1 : m2 - m1;
  });

  const filteredWebsites = websites.filter(site => {
    const matchesSearch = site.storeName?.toLowerCase().includes(search.toLowerCase()) ||
                          site.customerName?.toLowerCase().includes(search.toLowerCase()) ||
                          (site.customerPhone && site.customerPhone.includes(search));
    const matchesPackage = packageFilter === "ALL" || site.package === packageFilter;
    const matchesStatus = statusFilter === "ALL" || site.websiteStatus === statusFilter;
    
    let matchesMonth = true;
    if (monthFilter !== "ALL") {
      const dateStr = site.websiteStartDate || site.startDate;
      if (dateStr) {
        const date = new Date(dateStr);
        const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
        matchesMonth = monthYear === monthFilter;
      } else {
        matchesMonth = false;
      }
    }
    
    return matchesSearch && matchesPackage && matchesStatus && matchesMonth;
  });

  // Status cycle: pending -> processing -> completed -> pending
  const cycleStatus = async (e: React.MouseEvent, id: string, currentStatus?: string, site?: StoreEntry) => {
    e.stopPropagation();
    if (!firestore || !id) return;
    const nextStatus = 
      currentStatus === "completed" ? "pending" :
      currentStatus === "processing" ? "completed" : "processing";
    const statusLabel = nextStatus === "completed" ? "HOÀN THÀNH" : nextStatus === "processing" ? "ĐANG XỬ LÝ" : "ĐANG CHỜ";
    try {
      const docRef = doc(firestore, "stores", id);
      await updateDoc(docRef, { websiteStatus: nextStatus });
      toast({
        title: "CẬP NHẬT TRẠNG THÁI",
        description: `Website đã chuyển sang: ${statusLabel}`,
      });
      if (selectedWebsite?.id === id) {
        setSelectedWebsite({ ...selectedWebsite, websiteStatus: nextStatus as any });
      }

      // If transitioning to completed or processing, offer email notification
      if ((nextStatus === "completed" || nextStatus === "processing") && site) {
        const email = getSalesEmail(site.salesPerson);
        setNotifyDialog(prev => ({ 
          ...prev, 
          open: true, 
          site, 
          salesEmail: email,
          type: nextStatus as "completed" | "processing"
        }));
      }
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "LỖI CẬP NHẬT",
        description: "Không thể thay đổi trạng thái lúc này."
      });
    }
  };

  const sendEmailNotification = async (type: 'sales' | 'admin') => {
    if (!notifyDialog.site) return;
    
    const email = type === 'sales' ? notifyDialog.salesEmail : notifyDialog.adminEmail;
    
    if (!email || !isValidEmail(email)) {
      toast({ 
        variant: "destructive",
        title: "EMAIL KHÔNG HỢP LỆ", 
        description: "Vui lòng nhập email hợp lệ." 
      });
      return;
    }

    setNotifyDialog(prev => ({ 
      ...prev, 
      [type === 'sales' ? 'isSendingSales' : 'isSendingAdmin']: true 
    }));

    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: [email],
          storeName: notifyDialog.site.storeName,
          customerName: notifyDialog.site.customerName,
          customerPhone: notifyDialog.site.customerPhone,
          googleWebsiteLink: notifyDialog.site.googleWebsiteLink,
          salesPerson: notifyDialog.site.salesPerson,
          package: notifyDialog.site.package,
          type: notifyDialog.type,
          assignedTo: notifyDialog.site.websiteAssignedTo,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gửi mail thất bại");
      
      toast({ 
        title: "ĐÃ GỬI EMAIL", 
        description: `Thông báo đã gửi thành công đến ${email}` 
      });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "GỬI THẤT BẠI", 
        description: err.message 
      });
    } finally {
      setNotifyDialog(prev => ({ 
        ...prev, 
        [type === 'sales' ? 'isSendingSales' : 'isSendingAdmin']: false 
      }));
    }
  };

  const handleRowClick = (site: StoreEntry) => {
    setSelectedWebsite(site);
    setNote(site.websiteNote || "");
    setEditWebsiteStartDate(site.websiteStartDate || site.startDate || "");
    setEditWebsiteEndDate(site.websiteEndDate || site.endDate || "");
    setEditGoogleWebsiteLink(site.googleWebsiteLink || "");
  };

  const toggleWorker = async (worker: string) => {
    if (!selectedWebsite || !firestore) return;
    
    const currentAssigned = Array.isArray(selectedWebsite.websiteAssignedTo) ? selectedWebsite.websiteAssignedTo : [];
    const newAssigned = currentAssigned.includes(worker)
      ? currentAssigned.filter(a => a !== worker)
      : [...currentAssigned, worker];
    
    setIsSavingAssignedTo(true);
    try {
      const docRef = doc(firestore, "stores", selectedWebsite.id);
      await updateDoc(docRef, { websiteAssignedTo: newAssigned });
      
      setSelectedWebsite({ ...selectedWebsite, websiteAssignedTo: newAssigned });

      toast({ title: "CẬP NHẬT PHỤ TRÁCH", description: `Đã cập nhật nhân sự website: ${newAssigned.join(", ") || "Chưa phân công"}` });
    } catch (e: any) {
      toast({ variant: "destructive", title: "LỖI CẬP NHẬT", description: e.message });
    } finally {
      setIsSavingAssignedTo(false);
    }
  };

  const updateDetails = async () => {
    if (!firestore || !selectedWebsite?.id) return;
    setIsUpdatingDetails(true);
    try {
      const docRef = doc(firestore, "stores", selectedWebsite.id);
      const updates = {
        websiteStartDate: editWebsiteStartDate,
        websiteEndDate: editWebsiteEndDate,
        googleWebsiteLink: editGoogleWebsiteLink
      };
      await updateDoc(docRef, updates);
      toast({
        title: "CẬP NHẬT THÀNH CÔNG",
        description: "Thông tin chi tiết website đã được lưu lại.",
      });
      setSelectedWebsite({ ...selectedWebsite, ...updates });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "LỖI",
        description: "Không thể cập nhật thông tin.",
      });
    } finally {
      setIsUpdatingDetails(false);
    }
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
          <Select value={monthFilter} onValueChange={setMonthFilter}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-indigo-400/50">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent className="select-content-solid border-white/10 text-white">
              <SelectItem value="ALL" className="font-bold">TẤT CẢ THÁNG</SelectItem>
              {uniqueMonths.map(m => (
                <SelectItem key={m} value={m!} className="font-bold uppercase">THÁNG {m}</SelectItem>
              ))}
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
              <SelectItem value="processing" className="font-bold">ĐANG XỬ LÝ</SelectItem>
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
              <th className="px-8 py-6 text-xs font-black uppercase text-slate-400 tracking-widest text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredWebsites.map((site) => {
              const isCompleted = site.websiteStatus === "completed";
              const isProcessing = site.websiteStatus === "processing";
              const isPending = !site.websiteStatus || site.websiteStatus === "pending";
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
                      {(Array.isArray(site.websiteAssignedTo) ? site.websiteAssignedTo : []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(site.websiteAssignedTo || []).map((name, idx) => (
                            <Badge key={idx} variant="default" className="text-[9px] font-black bg-emerald-500 hover:bg-emerald-600 text-white border-none uppercase px-2 py-0.5 rounded-md whitespace-nowrap shadow-sm">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {assignedList.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {assignedList.map((name, idx) => (
                            <Badge key={idx} variant="outline" className="text-[9px] font-black border-white/10 bg-white/5 text-slate-400 uppercase px-2 py-0.5 rounded-md whitespace-nowrap opacity-60">
                              {name}
                            </Badge>
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
                    <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => cycleStatus(e, site.id!, site.websiteStatus, site)}
                        className={cn(
                          "h-10 w-10 rounded-xl transition-all",
                          isCompleted  
                            ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20" 
                            : isProcessing
                            ? "text-blue-400 bg-blue-500/10 hover:bg-blue-500/20"
                            : "text-slate-400 bg-white/5 hover:bg-white/10 hover:text-white"
                        )}
                        title={
                          isCompleted ? "Quay lại: Đang Chờ" 
                          : isProcessing ? "Chuyển sang: Hoàn Thành" 
                          : "Chuyển sang: Đang Xử Lý"
                        }
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : isProcessing ? (
                          <Clock className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        asChild
                        className="h-10 w-10 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl"
                      >
                        <a href={`/stores/${site.id}/edit`}><Edit className="w-4 h-4" /></a>
                      </Button>
                    </div>
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
                <div className="grid grid-cols-2 gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-indigo-400" /> Ngày Bắt Đầu
                    </label>
                    <Input 
                      type="date" 
                      value={editWebsiteStartDate} 
                      onChange={(e) => setEditWebsiteStartDate(e.target.value)}
                      className="bg-slate-900 border-white/10 text-white h-10 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-red-400" /> Ngày Kết Thúc
                    </label>
                    <Input 
                      type="date" 
                      value={editWebsiteEndDate} 
                      onChange={(e) => setEditWebsiteEndDate(e.target.value)}
                      className="bg-slate-900 border-white/10 text-white h-10 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div className="col-span-2 space-y-2 pt-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <Globe className="w-3 h-3 text-indigo-400" /> Đường dẫn Website
                    </label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="example.com" 
                        value={editGoogleWebsiteLink} 
                        onChange={(e) => setEditGoogleWebsiteLink(e.target.value)}
                        className="bg-slate-900 border-white/10 text-white h-10 rounded-xl text-xs font-bold flex-1"
                      />
                      <Button 
                        size="sm" 
                        onClick={updateDetails} 
                        disabled={isUpdatingDetails}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] px-4 rounded-xl"
                      >
                        {isUpdatingDetails ? <Loader2 className="w-3 h-3 animate-spin" /> : "CẬP NHẬT"}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/10 pb-2">
                    Liên Kết Mạng Xã Hội
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { key: "facebook", label: "Facebook", icon: <Facebook className="w-4 h-4 text-blue-500" />, value: selectedWebsite.facebookLink, color: "blue" },
                      { key: "instagram", label: "Instagram", icon: <Instagram className="w-4 h-4 text-pink-500" />, value: selectedWebsite.instagramLink, color: "pink" },
                      { key: "website", label: "Website", icon: <Globe className="w-4 h-4 text-indigo-400" />, value: selectedWebsite.googleWebsiteLink, color: "indigo" },
                      { key: "gbusiness", label: "Google Business", icon: <Store className="w-4 h-4 text-emerald-500" />, value: selectedWebsite.googleBusinessLink, color: "emerald" },
                    ].map(({ key, label, icon, value }) => (
                      <div key={key} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                        <div className="shrink-0">{icon}</div>
                        <div className="flex-1 overflow-hidden min-w-0">
                          <div className="text-[10px] font-black uppercase text-slate-500">{label}</div>
                          {value ? (
                            <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" className="text-xs font-bold text-white hover:text-primary truncate block transition-colors">
                              {value}
                            </a>
                          ) : (
                            <span className="text-xs font-bold text-slate-600">Chưa có</span>
                          )}
                        </div>
                        {value && (
                          <button
                            onClick={() => copyToClipboard(value, key)}
                            className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition-all text-slate-400 hover:text-white"
                            title="Sao chép"
                          >
                            {copiedKey === key 
                              ? <Check className="w-3.5 h-3.5 text-emerald-400" /> 
                              : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        )}
                      </div>
                    ))}
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
                     <Badge variant="outline" className={cn(
                      "text-[10px] font-black px-3 py-1 border-white/10 uppercase tracking-widest",
                      selectedWebsite.websiteStatus === "completed" 
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" 
                        : selectedWebsite.websiteStatus === "processing"
                        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    )}>
                      {selectedWebsite.websiteStatus === "completed" 
                        ? "✓ HOÀN THÀNH" 
                        : selectedWebsite.websiteStatus === "processing"
                        ? "⟳ ĐANG XỬ LÝ"
                        : "○ ĐANG CHỜ"}
                    </Badge>
                  </div>

                  {/* Duration summary - uses SERVICE package dates */}
                  {(() => {
                    const startD = selectedWebsite.startDate;
                    const endD = selectedWebsite.endDate;
                    const total = getMonthDiff(startD || "", endD || "");
                    const remaining = getRemainingMonths(endD || "");
                    if (total === null) return null;
                    const isExpired = (remaining ?? 0) <= 0;
                    return (
                      <div className="col-span-2 grid grid-cols-3 gap-3 pt-2 border-t border-white/10">
                        <div className="space-y-1 text-center p-3 rounded-xl bg-white/5">
                          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Tổng Thời Hạn</div>
                          <div className="text-xl font-black text-white">{total}<span className="text-xs text-slate-400 ml-1">tháng</span></div>
                        </div>
                        <div className="space-y-1 text-center p-3 rounded-xl bg-white/5">
                          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Còn Lại</div>
                          <div className={cn("text-xl font-black", isExpired ? "text-red-400" : (remaining ?? 0) <= 2 ? "text-amber-400" : "text-emerald-400")}>
                            {isExpired ? "HẺt" : remaining}<span className="text-xs text-slate-400 ml-1">{!isExpired && "tháng"}</span>
                          </div>
                        </div>
                        <div className="space-y-1 text-center p-3 rounded-xl bg-white/5">
                          <div className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Gói</div>
                          <div className="text-base font-black text-indigo-400 uppercase">{selectedWebsite.package || "PRO"}</div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                       {isSavingAssignedTo ? <Loader2 className="w-3 h-3 animate-spin text-indigo-400" /> : <UserCheck className="w-3 h-3 text-slate-400" />} Phụ Trách
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(selectedWebsite.assignedTo) ? selectedWebsite.assignedTo : []).length > 0 ? (
                        (selectedWebsite.assignedTo || []).map(worker => {
                          const isAssigned = Array.isArray(selectedWebsite.websiteAssignedTo) && selectedWebsite.websiteAssignedTo.includes(worker);
                          return (
                            <Button
                              key={worker}
                              size="sm"
                              variant={isAssigned ? "default" : "outline"}
                              onClick={() => toggleWorker(worker)}
                              disabled={isSavingAssignedTo}
                              className={cn(
                                "text-[10px] font-black px-4 rounded-xl h-9 uppercase tracking-widest transition-all",
                                isAssigned 
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-500/20" 
                                  : "bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                              )}
                            >
                              {worker}
                            </Button>
                          );
                        })
                      ) : (
                        <div className="text-[10px] text-amber-400 font-bold uppercase italic">Vui lòng phân công nhân sự tại danh sách tiệm trước</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                      <UserCheck className="w-3 h-3 text-slate-400" /> Sales
                    </div>
                    <div className="font-bold text-sm uppercase text-slate-300 bg-white/5 h-9 flex items-center px-4 rounded-xl border border-white/5">
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

      <AlertDialog open={notifyDialog.open} onOpenChange={(open) => !open && setNotifyDialog({ ...notifyDialog, open: false })}>
        <AlertDialogContent className="bg-slate-900 border border-white/10 text-white rounded-[2rem] max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black uppercase flex items-center gap-3">
              <Mail className={cn(notifyDialog.type === "completed" ? "text-indigo-400" : "text-emerald-400")} /> 
              {notifyDialog.type === "completed" ? "THÔNG BÁO HOÀN THÀNH?" : "THÔNG BÁO ĐÃ NHẬN TASK?"}
            </AlertDialogTitle>
            <div className="text-slate-400 font-bold text-sm">
              {notifyDialog.type === "completed" ? (
                <>Website cho tiệm <span className="text-white">"{notifyDialog.site?.storeName}"</span> đã hoàn thành.</>
              ) : (
                <>Đã nhận task website cho tiệm <span className="text-white">"{notifyDialog.site?.storeName}"</span>.</>
              )}
              <br />Chọn các email bạn muốn gửi thông báo.
            </div>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {/* Sales Email Section */}
            <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-black uppercase tracking-widest">
                  Gửi cho Sales ({notifyDialog.site?.salesPerson || "phụ trách"})
                </Label>
              </div>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input 
                    value={notifyDialog.salesEmail}
                    onChange={(e) => setNotifyDialog({ ...notifyDialog, salesEmail: e.target.value })}
                    placeholder="name@example.com"
                    className={cn(
                      "bg-slate-950 border-white/10 text-white h-10 rounded-xl text-xs font-bold",
                      notifyDialog.salesEmail && !isValidEmail(notifyDialog.salesEmail) && "border-red-500/50 focus-visible:ring-red-500/20"
                    )}
                  />
                  {notifyDialog.salesEmail && !isValidEmail(notifyDialog.salesEmail) && (
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight">Email không hợp lệ</p>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={notifyDialog.isSendingSales || !notifyDialog.salesEmail || !isValidEmail(notifyDialog.salesEmail)}
                  onClick={() => sendEmailNotification('sales')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white font-black text-[10px] px-4 rounded-xl h-10 min-w-[70px]"
                >
                  {notifyDialog.isSendingSales ? <Loader2 className="w-3 h-3 animate-spin" /> : "GỬI"}
                </Button>
              </div>
            </div>

            {/* Admin Email Section */}
            <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/10">
              <Label className="text-xs font-black uppercase tracking-widest">
                Gửi cho Admin
              </Label>
              <div className="flex gap-2">
                <div className="flex-1 space-y-1">
                  <Input 
                    value={notifyDialog.adminEmail}
                    onChange={(e) => setNotifyDialog({ ...notifyDialog, adminEmail: e.target.value })}
                    placeholder="admin@example.com"
                    className={cn(
                      "bg-slate-950 border-white/10 text-white h-10 rounded-xl text-xs font-bold",
                      notifyDialog.adminEmail && !isValidEmail(notifyDialog.adminEmail) && "border-red-500/50 focus-visible:ring-red-500/20"
                    )}
                  />
                  {notifyDialog.adminEmail && !isValidEmail(notifyDialog.adminEmail) && (
                    <p className="text-[10px] text-red-400 font-bold uppercase tracking-tight">Email không hợp lệ</p>
                  )}
                </div>
                <Button
                  size="sm"
                  disabled={notifyDialog.isSendingAdmin || !notifyDialog.adminEmail || !isValidEmail(notifyDialog.adminEmail)}
                  onClick={() => sendEmailNotification('admin')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] px-4 rounded-xl h-10 min-w-[70px]"
                >
                  {notifyDialog.isSendingAdmin ? <Loader2 className="w-3 h-3 animate-spin" /> : "GỬI"}
                </Button>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-transparent border-white/10 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl uppercase font-black text-[10px] tracking-widest h-11 px-6 w-full"
            >
              ĐÓNG
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
