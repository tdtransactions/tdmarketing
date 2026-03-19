"use client";

import { useState, useEffect } from "react";
import { useDatabase, useDatabaseList, useFirebase } from "@/firebase";
import { ref, push, set, remove, update, query, orderByChild, equalTo, get } from "firebase/database";
import { UserForm } from "@/components/users/UserForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Trash2, Edit2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { UserProfile } from "@/types/user";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const [isAdding, setIsAdding] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const db = useDatabase();
  const { profile, loading: authLoading } = useFirebase();
  const router = useRouter();
  
  const { data: users, loading: listLoading } = useDatabaseList<UserProfile>("app_users");

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
    if (!db) return;
    setIsSubmitting(true);
    
    try {
      const emailLower = values.email.toLowerCase().trim();
      const usersRef = ref(db, "app_users");
      const emailCheckQuery = query(usersRef, orderByChild('email'), equalTo(emailLower));
      const checkSnapshot = await get(emailCheckQuery);
      
      let exists = false;
      if (checkSnapshot.exists()) {
        const data = checkSnapshot.val();
        const keys = Object.keys(data);
        if (!editingUser || !keys.includes(editingUser.id)) {
          exists = true;
        }
      }

      if (exists) {
        toast({ variant: "destructive", title: "Lỗi Email", description: "Email này đã tồn tại. Vui lòng dùng email khác." });
        setIsSubmitting(false);
        return;
      }

      if (!editingUser) {
        const newUserRef = push(usersRef);
        await set(newUserRef, {
          ...values,
          email: emailLower,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        toast({ title: "Thành công", description: `Đã tạo hồ sơ cho ${values.displayName}` });
      } else {
        await update(ref(db, `app_users/${editingUser.id}`), {
          ...values,
          email: emailLower,
          updatedAt: Date.now()
        });
        toast({ title: "Cập nhật thành công", description: `Đã lưu thay đổi cho ${values.displayName}` });
      }
      setIsAdding(false);
      setEditingUser(null);
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không thể lưu vào cơ sở dữ liệu." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === profile?.id) {
      toast({ variant: "destructive", description: "Bạn không thể tự xóa chính mình." });
      return;
    }
    if (!db || !confirm("Xác nhận xóa vĩnh viễn nhân viên này?")) return;
    try {
      await remove(ref(db, `app_users/${id}`));
      toast({ title: "Đã xóa", description: "Hồ sơ đã được gỡ bỏ." });
    } catch (e) {
      toast({ variant: "destructive", title: "Lỗi", description: "Không có quyền xóa." });
    }
  };

  if (authLoading) return (
    <div className="flex flex-col items-center justify-center p-20 gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Đang tải dữ liệu nhân sự...</p>
    </div>
  );

  if (!isAdmin) return null;

  return (
    <div className="space-y-12 animate-slide-up">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-normal text-white uppercase">
            Nhân Sự <span className="text-primary">& Phân Quyền</span>
          </h2>
          <p className="text-slate-500 mt-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-primary" /> Xác thực: HỆ THỐNG NỘI BỘ
          </p>
        </div>
        {!isAdding && !editingUser && (
          <Button className="futuristic-gradient text-white font-black h-14 px-10 rounded-2xl shadow-2xl shadow-primary/30 uppercase tracking-widest text-xs border border-white/20" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-3" /> Thêm Nhân Viên
          </Button>
        )}
      </header>

      {(isAdding || editingUser) ? (
        <UserForm 
          initialData={editingUser || undefined} 
          onSubmit={handleSubmit} 
          onCancel={() => { setIsAdding(false); setEditingUser(null); }} 
        />
      ) : (
        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-white/5 border-b border-white/5 p-8">
            <CardTitle className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-3">
              <Users className="w-5 h-5 text-primary" /> Đội ngũ hiện tại ({users?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                    <th className="p-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Họ tên & Email</th>
                    <th className="p-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Mã Truy Cập</th>
                    <th className="p-8 text-[10px] font-black uppercase text-slate-500 tracking-widest">Vai trò</th>
                    <th className="p-8 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {listLoading ? (
                    <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></td></tr>
                  ) : users?.length === 0 ? (
                    <tr><td colSpan={4} className="p-20 text-center text-slate-500 font-black uppercase text-[10px] tracking-widest">Chưa ghi nhận dữ liệu nhân sự.</td></tr>
                  ) : (
                    users?.map((u) => (
                      <tr key={u.id} className="hover:bg-white/5 transition-all group">
                        <td className="p-8">
                          <div className="font-black text-white uppercase text-xs tracking-tight">{u.displayName}</div>
                          <div className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-normal">{u.email}</div>
                        </td>
                        <td className="p-8">
                           <code className="bg-white/5 px-3 py-1.5 rounded-xl text-[10px] font-black text-primary border border-white/5">
                             {u.password}
                           </code>
                        </td>
                        <td className="p-8">
                          <Badge className={u.role === "Admin" ? "bg-primary text-white font-black text-[9px] px-3 py-1 rounded-lg" : "bg-white/5 text-slate-400 font-black text-[9px] px-3 py-1 rounded-lg border border-white/5"}>
                            {u.role === "Admin" ? "QUẢN TRỊ" : u.role}
                          </Badge>
                        </td>
                        <td className="p-8 text-right">
                          <div className="flex justify-end gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white/10 text-white" onClick={() => setEditingUser(u)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-red-500/10 text-red-400" onClick={() => handleDelete(u.id)}>
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
