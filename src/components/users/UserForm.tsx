
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserProfile } from "@/types/user";
import { Save, X, ShieldCheck, Key, Mail, User } from "lucide-react";

const formSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  displayName: z.string().min(2, "Tên quá ngắn"),
  role: z.enum(["Admin", "Staff", "Manager"]),
  status: z.enum(["Active", "Inactive"]),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

interface UserFormProps {
  initialData?: Partial<UserProfile>;
  onSubmit: (values: any) => void;
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, onCancel }: UserFormProps) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initialData?.email || "",
      displayName: initialData?.displayName || "",
      role: initialData?.role || "Staff",
      status: initialData?.status || "Active",
      password: initialData?.password || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 animate-slide-up">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/5 p-8">
              <CardTitle className="text-xs font-black uppercase tracking-widest text-white">Hồ Sơ Nhân Viên</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 p-10">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <User className="w-3 h-3 text-primary" /> Họ và tên
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ví dụ: NGUYỄN VĂN A" className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Mail className="w-3 h-3 text-primary" /> Email đăng nhập
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="email@tdtransactions.vn" className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50" {...field} />
                    </FormControl>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                      <Key className="w-3 h-3 text-primary" /> Mật khẩu truy cập
                    </FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Nhập mật khẩu..." className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50" {...field} />
                    </FormControl>
                    <FormDescription className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                      Tài khoản dùng để truy cập hệ thống TD Transactions.
                    </FormDescription>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Cấp bậc</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl">
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="select-content-solid border-white/10 text-white">
                          <SelectItem value="Admin" className="font-bold uppercase">Admin (Toàn quyền)</SelectItem>
                          <SelectItem value="Manager" className="font-bold uppercase">Manager (Quản lý)</SelectItem>
                          <SelectItem value="Staff" className="font-bold uppercase">Staff (Nhân viên)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-500">Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl">
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="select-content-solid border-white/10 text-white">
                          <SelectItem value="Active" className="font-bold uppercase">Đang hoạt động</SelectItem>
                          <SelectItem value="Inactive" className="font-bold uppercase">Đã khóa</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-none rounded-[2.5rem] flex flex-col justify-center items-center p-12 text-center">
            <div className="p-8 bg-primary/10 rounded-[3rem] mb-8">
              <ShieldCheck className="w-20 h-20 text-primary animate-pulse" />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-normal mb-10">Phân Quyền Hệ Thống</h3>
            <div className="space-y-6 text-left w-full">
              <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-primary uppercase mb-2">Cơ chế quản trị</p>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-normal leading-relaxed">Phân tách rõ rệt giữa quyền khởi tạo và quyền cập nhật hồ sơ khách hàng.</p>
              </div>
              <ul className="space-y-4">
                {[
                  { label: "Admin", desc: "Xem, Sửa, Xóa và Khởi tạo tiệm mới", color: "bg-primary" },
                  { label: "Manager/Staff", desc: "Được phép xem và cập nhật hồ sơ", color: "bg-slate-500" },
                  { label: "Lưu ý", desc: "Nhân viên không được phép Xóa dữ liệu", color: "bg-red-500" }
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-4">
                    <div className={`w-2 h-2 ${item.color} rounded-full mt-1.5 shrink-0`}></div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.label}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-normal mt-0.5">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>

        <div className="flex justify-end gap-6 pt-4">
          <Button variant="ghost" type="button" onClick={onCancel} className="font-black uppercase tracking-widest text-xs text-slate-500 hover:text-white hover:bg-white/5 h-14 px-8 rounded-2xl">
            Hủy Bỏ
          </Button>
          <Button type="submit" className="futuristic-gradient text-white font-black h-14 px-12 shadow-2xl shadow-primary/30 uppercase tracking-widest text-xs rounded-2xl border border-white/20 active:scale-95 transition-all">
            <Save className="w-4 h-4 mr-3" /> Lưu Dữ Liệu
          </Button>
        </div>
      </form>
    </Form>
  );
}
