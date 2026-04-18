"use client";

import { useState } from "react";
import { SalesRequest } from "@/types/request";
import { InternalStaff } from "@/types/staff";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, deleteDoc, collection } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Trash2, ShieldAlert, FileText, UserCheck, Shield, Save, Briefcase, Filter } from "lucide-react";

interface RequestTableProps {
  requests: SalesRequest[];
  isAdmin: boolean;
}

export function RequestTable({ requests, isAdmin }: RequestTableProps) {
  const [selectedRequest, setSelectedRequest] = useState<SalesRequest | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [isOverride, setIsOverride] = useState(false);
  
  const firestore = useFirestore();

  // Fetch internal staff from Firestore
  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "internal_staff");
  }, [firestore]);
  const { data: staffMembers } = useCollection<InternalStaff>(staffQuery);

  const handleStatusChange = async (requestId: string, newStatus: string) => {
    if (!firestore) return;
    try {
      await updateDoc(doc(firestore, "sales_requests", requestId), {
        status: newStatus,
        updatedAt: Date.now(),
        ...(newStatus === 'closed' ? { closedAt: Date.now() } : {})
      });
      toast({ title: "Cập nhật thành công", description: `Trạng thái: ${newStatus}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể cập nhật trạng thái." });
    }
  };

  const handleAssignStaff = async (staffName: string) => {
    if (!firestore || !selectedRequest) return;
    try {
      await updateDoc(doc(firestore, "sales_requests", selectedRequest.id!), {
        assignedStaff: staffName,
        updatedAt: Date.now()
      });
      setSelectedRequest(prev => prev ? { ...prev, assignedStaff: staffName } : null);
      toast({ title: "Đã gán nhân sự", description: `Người phụ trách: ${staffName}` });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể gán nhân sự." });
    }
  };

  const handleUpdateNote = async () => {
    if (!firestore || !selectedRequest) return;
    try {
      await updateDoc(doc(firestore, "sales_requests", selectedRequest.id!), {
        adminNote: adminNote,
        noteUpdatedAt: Date.now(),
        updatedAt: Date.now()
      });
      toast({ title: "Đã lưu ghi chú", description: "Sales sẽ thấy phản hồi này." });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu ghi chú." });
    }
  };

  const handleDelete = async (requestId: string) => {
    if (!firestore || !confirm("BẠN CÓ CHẮC CHẮN MUỐN XÓA VĨNH VIỄN YÊU CẦU NÀY?")) return;
    try {
      await deleteDoc(doc(firestore, "sales_requests", requestId));
      toast({ title: "Đã xóa vĩnh viễn", description: "Dữ liệu đã được gỡ bỏ khỏi hệ thống." });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Bạn không có quyền thực hiện thao tác này." });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-black text-[9px] uppercase px-2 py-0.5">Mới gửi</Badge>;
      case "accepted": return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 font-black text-[9px] uppercase px-2 py-0.5">Đã nhận</Badge>;
      case "pending": return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 font-black text-[9px] uppercase px-2 py-0.5">Đang xử lý</Badge>;
      case "completed": return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 font-black text-[9px] uppercase px-2 py-0.5">Hoàn thành</Badge>;
      case "closed": return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 font-black text-[9px] uppercase px-2 py-0.5">Đã kết thúc</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "urgent") return <Badge variant="destructive" className="font-black text-[9px] uppercase px-2 py-0.5">Khẩn cấp</Badge>;
    return <Badge variant="outline" className="text-slate-400 border-white/10 font-black text-[9px] uppercase px-2 py-0.5">Thường</Badge>;
  };

  // Filter staff based on work type of the selected request
  const filteredStaff = staffMembers?.filter(s => {
    if (isOverride) return true;
    if (!selectedRequest?.workType) return true;
    
    // Match workType (pos/marketing) against staff roles (POS/Marketing/Sale)
    // Case-insensitive match
    const workTypeUpper = selectedRequest.workType.toUpperCase();
    return s.roles?.some(role => role.toUpperCase() === workTypeUpper);
  }) || [];

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Thời gian</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Loại</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Người yêu cầu</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Tiêu đề</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest">Trạng thái</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-500 tracking-widest text-center">Độ ưu tiên</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {requests.map((req) => (
              <tr 
                key={req.id} 
                className="hover:bg-white/5 transition-all cursor-pointer group"
                onClick={() => {
                  setSelectedRequest(req);
                  setAdminNote(req.adminNote || "");
                }}
              >
                <td className="p-6">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span className="text-[11px] font-bold">
                      {new Date(req.createdAt?.toMillis?.() || req.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                </td>
                <td className="p-6">
                   <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] font-black uppercase px-2">{req.workType}</Badge>
                </td>
                <td className="p-6">
                  <div className="font-black text-white text-xs uppercase tracking-tight">{req.salesName}</div>
                </td>
                <td className="p-6">
                  <div className="text-white font-bold text-xs truncate max-w-[200px]">{req.title}</div>
                </td>
                <td className="p-6">
                  {getStatusBadge(req.status)}
                </td>
                <td className="p-6 text-center">
                  {getPriorityBadge(req.priority)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <SheetContent className="bg-slate-950 border-white/10 text-white sm:max-w-xl p-0 overflow-y-auto">
          {selectedRequest && (
            <div className="flex flex-col h-full">
              <SheetHeader className="p-10 border-b border-white/5 bg-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <Badge className="bg-primary text-white font-black text-[9px] uppercase px-3 py-1 rounded-lg">
                    {selectedRequest.workType}
                  </Badge>
                  {getPriorityBadge(selectedRequest.priority)}
                </div>
                <SheetTitle className="text-3xl font-black text-white uppercase tracking-tight leading-tight">
                  {selectedRequest.title}
                </SheetTitle>
                <SheetDescription className="text-slate-400 font-bold text-xs mt-4 flex items-center gap-4">
                  <span>Sales: <strong className="text-white">{selectedRequest.salesName}</strong></span>
                  <span>•</span>
                  <span>Ngày gửi: {new Date(selectedRequest.createdAt?.toMillis?.() || selectedRequest.createdAt).toLocaleString('vi-VN')}</span>
                </SheetDescription>
              </SheetHeader>

              <div className="p-10 space-y-12">
                {/* Description */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Chi tiết yêu cầu
                  </h4>
                  <div className="bg-white/5 rounded-3xl p-8 border border-white/5 text-slate-300 text-sm leading-relaxed font-medium">
                    {selectedRequest.description || "Không có mô tả chi tiết."}
                  </div>
                </div>

                {/* Admin Assignment & Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                        <UserCheck className="w-4 h-4" /> Nhân sự phụ trách
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={(e) => { e.stopPropagation(); setIsOverride(!isOverride); }}
                        className={`h-7 px-3 rounded-lg text-[8px] font-black uppercase border transition-all ${isOverride ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'border-white/10 text-slate-500'}`}
                      >
                        <Filter className="w-2.5 h-2.5 mr-1" /> {isOverride ? "Đang hiện tất cả" : "Lọc chuyên môn"}
                      </Button>
                    </div>
                    <Select value={selectedRequest.assignedStaff || "none"} onValueChange={handleAssignStaff}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white font-black h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue placeholder="Chọn Nhân Sự" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="none" className="font-bold text-slate-500">Chưa gán ai</SelectItem>
                        {filteredStaff.length > 0 ? (
                          filteredStaff.map(s => (
                            <SelectItem key={s.id} value={s.name} className="font-bold">
                              {s.name} ({s.roles?.join(", ")})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-[10px] font-black text-slate-500 uppercase">Không tìm thấy nhân sự {selectedRequest.workType}</div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Trạng thái xử lý
                    </h4>
                    <Select value={selectedRequest.status} onValueChange={(val) => handleStatusChange(selectedRequest.id!, val)}>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white font-black h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="new" className="font-bold">Mới gửi</SelectItem>
                        <SelectItem value="accepted" className="font-bold">Nhận xử lý</SelectItem>
                        <SelectItem value="pending" className="font-bold text-orange-400">Đang xử lý</SelectItem>
                        <SelectItem value="completed" className="font-bold text-green-400">Hoàn thành</SelectItem>
                        <SelectItem value="closed" className="font-bold text-slate-500">Đã kết thúc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Admin Note */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.2em] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Phản hồi từ Admin
                    </h4>
                    {selectedRequest.noteUpdatedAt && (
                      <span className="text-[9px] font-bold text-slate-500 italic">
                        Cập nhật: {new Date(selectedRequest.noteUpdatedAt).toLocaleString('vi-VN')}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Textarea 
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Nhập ghi chú hoặc yêu cầu thêm thông tin từ Sales..."
                      className="bg-white/5 border-white/10 text-white min-h-[120px] rounded-3xl p-6 font-bold placeholder:text-slate-700"
                    />
                    <Button 
                      onClick={handleUpdateNote}
                      className="absolute bottom-4 right-4 h-10 px-6 rounded-xl futuristic-gradient text-white font-black text-[10px] uppercase tracking-widest border border-white/20"
                    >
                      <Save className="w-3 h-3 mr-2" /> Lưu Ghi Chú
                    </Button>
                  </div>
                </div>

                {/* Dangerous Zone */}
                {isAdmin && (
                  <div className="pt-8 border-t border-white/5">
                    <Button 
                      variant="ghost" 
                      onClick={() => { handleDelete(selectedRequest.id!); setSelectedRequest(null); }}
                      className="w-full h-14 rounded-2xl border border-red-500/10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 font-black uppercase text-[10px] tracking-widest transition-all"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Xóa vĩnh viễn yêu cầu này
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
