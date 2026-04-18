"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, addDoc, serverTimestamp, query } from "firebase/firestore";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Send, UserCheck, ShieldAlert, FileText, Briefcase, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { InternalStaff } from "@/types/staff";

const formSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập nội dung yêu cầu"),
  description: z.string().optional(),
  priority: z.enum(["normal", "urgent"]),
  salesName: z.string().min(1, "Vui lòng chọn tên Sales"),
  workType: z.enum(["pos", "marketing"]),
});

export function RequestForm({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const firestore = useFirestore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all staff and filter for Sales
  const staffQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "internal_staff");
  }, [firestore]);
  const { data: allStaff, isLoading: loadingStaff } = useCollection<InternalStaff>(staffQuery);

  const requesterNames = allStaff
    ?.filter(s => s.roles?.includes("Sale"))
    ?.map(s => s.name)
    ?.sort((a, b) => a.localeCompare(b)) || [];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "normal",
      salesName: "",
      workType: "pos",
    },
  });

  useEffect(() => {
    if (open) {
      const savedName = localStorage.getItem("preferred_sales_name");
      if (savedName && requesterNames.includes(savedName)) {
        form.setValue("salesName", savedName);
      }
    }
  }, [open, form, requesterNames]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!firestore) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(firestore, "sales_requests"), {
        ...values,
        status: "new",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      localStorage.setItem("preferred_sales_name", values.salesName);
      toast({
        title: "GỬI YÊU CẦU THÀNH CÔNG",
        description: "Admin đã nhận được thông báo yêu cầu của bạn.",
      });
      form.reset();
      onOpenChange(false);
    } catch (e) {
      toast({
        variant: "destructive",
        title: "LỖI HỆ THỐNG",
        description: "Không thể gửi yêu cầu lúc này.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-slate-950 border border-white/10 text-white rounded-[2rem] p-0 overflow-hidden">
        <DialogHeader className="p-8 border-b border-white/10 bg-white/5">
          <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
            <Send className="text-primary w-5 h-5" /> Gửi Yêu Cầu Xử Lý
          </DialogTitle>
          <DialogDescription className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
            Phòng ban hỗ trợ kỹ thuật và Admin
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="p-8 space-y-6"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                    <FileText className="w-3 h-3 text-primary" /> Tiêu đề / Tóm
                    tắt vấn đề
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ví dụ: Lỗi cập nhật Facebook tiệm Nail ABC..."
                      className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:border-primary/50"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                    Mô tả chi tiết (Tùy chọn)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập thêm chi tiết nếu cần..."
                      className="bg-white/5 border-white/10 text-white min-h-[100px] font-bold rounded-xl focus:border-primary/50 p-4"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="salesName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <UserCheck className="w-3 h-3 text-primary" /> Người yêu cầu
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} disabled={loadingStaff}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:ring-primary/50">
                          {loadingStaff ? (
                             <div className="flex items-center gap-2"><Loader2 className="w-3 h-3 animate-spin" /> Đang tải...</div>
                          ) : (
                             <SelectValue placeholder="Chọn tên..." />
                          )}
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        {requesterNames.length > 0 ? (
                          requesterNames.map((name) => (
                            <SelectItem key={name} value={name} className="font-bold">{name}</SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-[10px] font-black uppercase text-slate-500">Chưa có danh sách Sales</div>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="workType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Briefcase className="w-3 h-3 text-primary" /> Loại Công Việc
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:ring-primary/50">
                          <SelectValue placeholder="Chọn loại..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="pos" className="font-bold">POS (Máy POS)</SelectItem>
                        <SelectItem value="marketing" className="font-bold">Marketing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-3 h-3 text-red-500" /> Mức ưu tiên
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:ring-red-500/50">
                          <SelectValue placeholder="Ưu tiên..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-slate-900 border-white/10 text-white">
                        <SelectItem value="normal" className="font-bold">Bình thường</SelectItem>
                        <SelectItem value="urgent" className="font-bold text-red-400">Khẩn cấp</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 flex justify-end gap-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="font-black uppercase text-[10px] tracking-widest text-slate-400 hover:text-white rounded-xl px-6"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || loadingStaff}
                className="futuristic-gradient text-white font-black uppercase text-[10px] tracking-widest rounded-xl px-8 shadow-lg shadow-primary/20"
              >
                <Send className="w-4 h-4 mr-2" />{" "}
                {isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
