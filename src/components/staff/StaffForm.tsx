"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserCheck, Briefcase, Shield, Loader2 } from "lucide-react";
import { InternalStaff } from "@/types/staff";

import { Mail } from "lucide-react";

const ROLE_OPTIONS = [
  { id: "POS", label: "POS" },
  { id: "Marketing", label: "Marketing" },
  { id: "Sale", label: "Sale" },
];

const formSchema = z.object({
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  email: z.string().email("Email không hợp lệ").optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "Vui lòng chọn ít nhất một vai trò"),
});

interface StaffFormProps {
  initialData?: InternalStaff;
  onSubmit: (values: z.infer<typeof formSchema>) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function StaffForm({ initialData, onSubmit, onCancel, isSubmitting }: StaffFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      roles: initialData?.roles || [],
    },
  });

  return (
    <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
      <CardHeader className="p-10 pb-4">
        <CardTitle className="text-xl font-black uppercase text-white tracking-tight flex items-center gap-3">
          {initialData ? <UserCheck className="text-primary" /> : <UserPlus className="text-primary" />}
          {initialData ? "SỬA THÔNG TIN NHÂN SỰ" : "THÊM NHÂN SỰ MỚI"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-10">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <UserCheck className="w-3 h-3" /> Họ Tên Nhân Sự
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ví dụ: Nguyễn Văn A..." 
                      className="bg-white/5 border-white/10 text-white font-black h-14 rounded-2xl focus:border-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                    <Mail className="w-3 h-3 text-primary" /> Email Liên Hệ (nhận thông báo)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="sale@example.com" 
                      className="bg-white/5 border-white/10 text-white font-black h-14 rounded-2xl focus:border-primary/50" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="roles"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2">
                      <Shield className="w-3 h-3" /> Vai Trò / Vị Trí (Có thể chọn nhiều)
                    </FormLabel>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ROLE_OPTIONS.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="roles"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-center space-x-3 space-y-0 p-4 bg-white/5 border border-white/10 rounded-2xl hover:border-primary/50 transition-all cursor-pointer"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, item.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                  className="w-5 h-5 border-white/20 data-[state=checked]:bg-primary"
                                />
                              </FormControl>
                              <FormLabel className="text-[10px] font-black uppercase text-white cursor-pointer flex-1">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-4 pt-4 border-t border-white/5">
              <Button type="button" variant="ghost" onClick={onCancel} className="h-14 px-10 rounded-2xl font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white">
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="futuristic-gradient text-white font-black h-14 px-10 rounded-2xl shadow-xl shadow-primary/30 uppercase tracking-widest text-xs border border-white/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  initialData ? "Lưu Thay Đổi" : "Tạo Hồ Sơ"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
