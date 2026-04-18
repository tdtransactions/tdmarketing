"use client";

import { useState, useEffect } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { RequestTable } from "@/components/requests/RequestTable";
import { Loader2, AlertCircle, MessageSquareWarning, Plus, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SalesRequest } from "@/types/request";
import { RequestForm } from "@/components/requests/RequestForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { InternalStaff } from "@/types/staff";

export default function RequestsPage() {
  const firestore = useFirestore();
  const { profile, loading: isUserLoading } = useUser();
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [salesNameFilter, setSalesNameFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const requestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "sales_requests"), orderBy("createdAt", "desc"));
  }, [firestore]);

  const { data: requests, isLoading: loadingRequests, error } = useCollection(requestsQuery);

  // Dynamic requester list for filter
  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "internal_staff");
  }, [firestore]);
  const { data: allStaff } = useCollection<InternalStaff>(staffQuery);

  const requesterNames = allStaff
    ?.filter(s => s.roles?.includes("Sale"))
    ?.map(s => s.name)
    ?.sort((a, b) => a.localeCompare(b)) || [];

  const isAdmin = profile?.role === "Admin";

  useEffect(() => {
    const savedName = localStorage.getItem("preferred_sales_name");
    if (savedName && requesterNames.includes(savedName)) {
      setSalesNameFilter(savedName);
    }
  }, [requesterNames]);

  // Auto cleanup logic
  useEffect(() => {
    if (!requests || !firestore) return;
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    
    requests.forEach((req: SalesRequest) => {
      if (req.status === "closed" && req.closedAt && req.id) {
        const closedTime = typeof req.closedAt === 'number' ? req.closedAt : req.closedAt.toMillis?.() || Date.now();
        if (now - closedTime > TWENTY_FOUR_HOURS) {
          deleteDoc(doc(firestore, "sales_requests", req.id)).catch(console.error);
        }
      }
    });
  }, [requests, firestore]);

  const activeRequests = requests?.filter(req => req.status !== "closed") || [];

  const filteredRequests = activeRequests.filter(req => {
    const matchSalesName = salesNameFilter === "all" || req.salesName === salesNameFilter;
    const matchStatus = statusFilter === "all" || req.status === statusFilter;
    return matchSalesName && matchStatus;
  });

  if (isUserLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Đang tải danh sách yêu cầu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/10 rounded-2xl">
             <MessageSquareWarning className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-3xl font-black tracking-normal text-white uppercase">Yêu Cầu Xử Lý</h2>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mt-1">
              TỔNG SỐ: <span className="text-white">{activeRequests.length}</span> YÊU CẦU ĐANG MỞ
            </p>
          </div>
        </div>
        {!isAdmin && (
          <Button onClick={() => setIsFormOpen(true)} className="futuristic-gradient text-white font-black rounded-xl border border-white/20 shadow-lg shadow-primary/20 h-11 px-6 text-[10px] uppercase tracking-widest">
            <Plus className="w-4 h-4 mr-2" /> Tạo Yêu Cầu
          </Button>
        )}
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p className="text-xs font-black uppercase">Lỗi đồng bộ dữ liệu: {error.message}.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 glass-card p-4 rounded-2xl">
        <div className="flex items-center gap-2 mr-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lọc kết quả:</span>
        </div>
        
        <Select value={salesNameFilter} onValueChange={setSalesNameFilter}>
          <SelectTrigger className="w-[200px] h-10 bg-white/5 border-white/10 text-white font-bold rounded-xl text-xs">
            <SelectValue placeholder="Người yêu cầu" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
            <SelectItem value="all" className="font-bold cursor-pointer hover:bg-white/5 text-xs">Tất cả nhân viên</SelectItem>
            {requesterNames.map(name => (
              <SelectItem key={name} value={name} className="font-bold cursor-pointer hover:bg-white/5 text-xs">{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px] h-10 bg-white/5 border-white/10 text-white font-bold rounded-xl text-xs">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
            <SelectItem value="all" className="font-bold cursor-pointer hover:bg-white/5 text-xs">Tất cả trạng thái</SelectItem>
            <SelectItem value="new" className="font-bold text-blue-400 cursor-pointer hover:bg-white/5 text-xs">Mới gửi</SelectItem>
            <SelectItem value="accepted" className="font-bold text-orange-400 cursor-pointer hover:bg-white/5 text-xs">Đã nhận</SelectItem>
            <SelectItem value="pending" className="font-bold text-yellow-400 cursor-pointer hover:bg-white/5 text-xs">Đang xử lý</SelectItem>
            <SelectItem value="completed" className="font-bold text-green-400 cursor-pointer hover:bg-white/5 text-xs">Hoàn thành</SelectItem>
          </SelectContent>
        </Select>

        {(salesNameFilter !== "all" || statusFilter !== "all") && (
          <Button 
            variant="ghost" 
            onClick={() => { setSalesNameFilter("all"); setStatusFilter("all"); }}
            className="text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-white hover:bg-red-500/20 rounded-xl h-10 px-4 transition-all"
          >
            <X className="w-3 h-3 mr-2" /> Xóa bộ lọc
          </Button>
        )}
        
        <div className="ml-auto flex items-center gap-2">
          <Badge className="bg-white/5 text-slate-400 font-black text-[10px] tracking-widest px-3 py-1 rounded-lg border border-white/5">
            Đã lọc: <span className="text-white ml-1">{filteredRequests.length}</span>
          </Badge>
        </div>
      </div>

      {loadingRequests ? (
        <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <p className="text-[10px] font-black uppercase tracking-widest">Đang truy cập cơ sở dữ liệu thời gian thực...</p>
        </div>
      ) : activeRequests.length > 0 ? (
        filteredRequests.length > 0 ? (
          <div className="glass-card rounded-[2.5rem] overflow-hidden">
            <RequestTable requests={filteredRequests} isAdmin={isAdmin} />
          </div>
        ) : (
          <div className="p-20 text-center glass-card border-dashed border-white/10 rounded-[2.5rem]">
             <Filter className="w-10 h-10 text-slate-500 mx-auto mb-4 opacity-50" />
             <p className="text-white text-base font-black uppercase tracking-tight">Không tìm thấy kết quả phù hợp</p>
             <p className="text-slate-500 text-xs font-bold mt-2">Vui lòng thay đổi tiêu chí bộ lọc</p>
          </div>
        )
      ) : (
        <div className="p-20 text-center glass-card border-dashed rounded-[2.5rem]">
          <p className="text-slate-500 text-lg font-black uppercase tracking-tight">Tuyệt vời! Không có yêu cầu nào đang chờ xử lý.</p>
        </div>
      )}

      <RequestForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
