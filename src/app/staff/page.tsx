"use client";

import { useState, useEffect } from "react";
import { useFirestore, useUser, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, query } from "firebase/firestore";
import { StaffForm } from "@/components/staff/StaffForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trash2, Edit2, Loader2, UserCheck, Shield, UserPlus, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { InternalStaff } from "@/types/staff";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function StaffPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingStaff, setEditingStaff] = useState<InternalStaff | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  const firestore = useFirestore();
  const { profile, loading: authLoading } = useUser();
  const router = useRouter();
  
  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "internal_staff");
  }, [firestore]);

  const { data: staffList, isLoading: listLoading } = useCollection<InternalStaff>(staffQuery);

  const filteredStaff = staffList?.filter(s => {
    if (roleFilter === "all") return true;
    return s.roles?.includes(roleFilter);
  });

  const isAdmin = profile?.role === "Admin";

  useEffect(() => {
    if (!authLoading && profile && !isAdmin) {
      toast({ 
        variant: "destructive", 
        title: "Truy cập bị chặn", 
        description: "Bạn không có quyền quản trị nhân sự." 
      });
      router.push("/");
    }
  }, [profile, authLoading, isAdmin, router]);

  const handleSubmit = async (values: any) => {
    if (!firestore) return;
    setIsSubmitting(true);
    
    try {
      if (!editingStaff) {
        await addDoc(collection(firestore, "internal_staff"), {
          ...values,
          createdAt: Date.now()
        });
        toast({ title: "Thành công", description: `Đã thêm nhân sự ${values.name}` });
      } else {
        await updateDoc(doc(firestore, "internal_staff", editingStaff.id!), {
          ...values
        });
        toast({ title: "Cập nhật thành công", description: `Đã lưu thay đổi cho ${values.name}` });
      }
      setIsAdding(false);
      setEditingStaff(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu dữ liệu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !confirm("Xác nhận xóa nhân sự này khỏi hệ thống?")) return;
    try {
      await deleteDoc(doc(firestore, "internal_staff", id));
      toast({ title: "Đã xóa", description: "Hồ sơ đã được gỡ bỏ." });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không có quyền xóa." });
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</p>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-normal text-white uppercase">
            Quản Lý <span className="text-primary">Nhân Sự</span>
          </h2>
          <p className="text-slate-500 mt-2 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <UserCheck className="w-4 h-4 text-primary" /> Danh sách đội nhân sự
          </p>
        </div>
        {!isAdding && !editingStaff && (
          <Button 
            onClick={() => setIsAdding(true)} 
            className="futuristic-gradient text-white font-black rounded-xl h-12 px-8 shadow-lg shadow-primary/20 uppercase tracking-widest text-sm border border-white/20"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Thêm Nhân Sự
          </Button>
        )}
      </header>

      {!isAdding && !editingStaff && (
        <div className="flex flex-wrap gap-4 items-center bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/5 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mr-4">
            <Filter className="w-4 h-4 text-primary" />
            <span className="text-xs font-black uppercase text-slate-400 tracking-widest">Lọc vị trí:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["all", "POS", "Marketing", "Sale"].map(role => (
              <Button
                key={role}
                variant={roleFilter === role ? "default" : "outline"}
                onClick={() => setRoleFilter(role)}
                className={cn(
                  "h-10 px-6 rounded-xl font-black uppercase text-xs tracking-widest transition-all",
                  roleFilter === role 
                    ? "futuristic-gradient border-none shadow-lg shadow-primary/20 text-white" 
                    : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10"
                )}
              >
                {role === "all" ? "Tất Cả" : role}
              </Button>
            ))}
          </div>
        </div>
      )}

      {(isAdding || editingStaff) ? (
        <StaffForm 
          initialData={editingStaff || undefined} 
          onSubmit={handleSubmit} 
          onCancel={() => { setIsAdding(false); setEditingStaff(null); }} 
          isSubmitting={isSubmitting}
        />
      ) : (
        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 p-8">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" /> Tổng số ({filteredStaff?.length || 0})
              {roleFilter !== "all" && <span className="text-primary/50 text-xs">Đang lọc: {roleFilter}</span>}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-8 text-xs font-black uppercase text-slate-500 tracking-widest">Họ tên</th>
                    <th className="p-8 text-xs font-black uppercase text-slate-500 tracking-widest">Vai Trò / Vị Trí</th>
                    <th className="p-8 text-xs font-black uppercase text-slate-500 tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listLoading ? (
                    <tr><td colSpan={3} className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                  ) : filteredStaff?.length === 0 ? (
                    <tr><td colSpan={3} className="p-20 text-center text-slate-500 font-black uppercase text-xs tracking-widest">Chưa ghi nhận dữ liệu nhân sự phù hợp.</td></tr>
                  ) : (
                    filteredStaff?.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5 transition-all group">
                        <td className="p-8">
                          <div className="font-black text-white uppercase text-base tracking-tight">{s.name}</div>
                        </td>
                        <td className="p-8">
                          <div className="flex flex-wrap gap-2">
                            {s.roles?.map(role => (
                              <Badge key={role} className="bg-white/5 text-primary border border-primary/20 font-black text-[10px] px-3 py-1.5 uppercase tracking-widest rounded-lg">
                                <Shield className="w-3.5 h-3.5 mr-1.5" /> {role}
                              </Badge>
                            ))}
                          </div>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-white" onClick={() => setEditingStaff(s)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-red-400" onClick={() => handleDelete(s.id!)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
