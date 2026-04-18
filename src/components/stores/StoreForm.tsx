"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { StoreEntry } from "@/types/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Facebook, Instagram, Globe, User, UserCheck, DollarSign, ChevronDown, Store, Calendar, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDatabaseList } from "@/firebase";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  startDate: z.string().min(1, "Thông tin bắt buộc"),
  endDate: z.string().min(1, "Thông tin bắt buộc"),
  storeName: z.string().min(1, "Thông tin bắt buộc"),
  customerName: z.string().min(1, "Thông tin bắt buộc"),
  address: z.string().min(1, "Thông tin bắt buộc"),
  customerPhone: z.string().min(1, "Thông tin bắt buộc"),
  facebookLink: z.string().optional(),
  instagramLink: z.string().optional(),
  googleWebsiteLink: z.string().optional(),
  googleBusinessLink: z.string().optional(),
  googleVerified: z.boolean().default(false),
  package: z.string().min(1, "Vui lòng chọn"),
  hasWebsite: z.boolean().default(false),
  websiteStatus: z.string().default("pending"),
  websiteStartDate: z.string().optional(),
  websiteEndDate: z.string().optional(),
  websiteNote: z.string().optional(),
  assignedTo: z.any(),
  salesPerson: z.string().optional(),
  paymentTypes: z.string().optional(),
  amount: z.string().optional(),
  duration: z.string().optional(),
  note: z.string().optional(),
});

const staffList = ["Hiển", "Hằng", "Hùng", "Loan", "Mi Mi", "Ngân"];

export function StoreForm({ initialData, onSubmit }: { initialData?: Partial<StoreEntry>, onSubmit: (values: StoreEntry) => void }) {
  const router = useRouter();
  const { data: salesPersonsDb } = useDatabaseList("metadata/sales_persons");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: initialData?.startDate || new Date().toISOString().split('T')[0],
      endDate: initialData?.endDate || "",
      storeName: initialData?.storeName || "",
      customerName: initialData?.customerName || "",
      address: initialData?.address || "",
      customerPhone: initialData?.customerPhone || "",
      facebookLink: initialData?.facebookLink || "",
      instagramLink: initialData?.instagramLink || "",
      googleWebsiteLink: initialData?.googleWebsiteLink || "",
      googleBusinessLink: initialData?.googleBusinessLink || "",
      googleVerified: initialData?.googleVerified || false,
      package: initialData?.package || "PRO",
      hasWebsite: initialData?.hasWebsite || false,
      websiteStatus: initialData?.websiteStatus || "pending",
      websiteStartDate: initialData?.websiteStartDate || "",
      websiteEndDate: initialData?.websiteEndDate || "",
      websiteNote: initialData?.websiteNote || "",
      assignedTo: Array.isArray(initialData?.assignedTo) ? initialData.assignedTo : (initialData?.assignedTo ? [initialData.assignedTo as string] : []),
      salesPerson: initialData?.salesPerson || "",
      paymentTypes: initialData?.paymentTypes || "Zelle",
      amount: initialData?.amount || "",
      duration: initialData?.duration || "",
      note: initialData?.note || "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as StoreEntry))} className="space-y-10">
        <Card className="glass-card border-none rounded-[2.5rem] overflow-hidden">
          <CardContent className="p-10 lg:p-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary" /> Ngày Bắt Đầu
                  </FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px] font-black uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-red-500" /> Ngày Kết Thúc
                  </FormLabel>
                  <FormControl>
                    <Input type="date" className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px] font-black uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="storeName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2">
                    <Store className="w-3 h-3 text-primary" /> Tên Tiệm
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên tiệm..." className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50 placeholder:text-slate-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px] font-black uppercase" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2">
                    <User className="w-3 h-3 text-primary" /> Chủ Tiệm / Liên Hệ
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên khách hàng..." className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50 placeholder:text-slate-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px] font-black uppercase" />
                </FormItem>
              )}
            />

            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
              <FormField
                control={form.control}
                name="facebookLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 flex items-center gap-2"><Facebook className="w-3 h-3 text-blue-500" /> Facebook</FormLabel>
                    <FormControl><Input placeholder="URL..." className="bg-white/5 border-white/10 text-white text-xs h-12 rounded-xl font-bold" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="instagramLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 flex items-center gap-2"><Instagram className="w-3 h-3 text-pink-500" /> Instagram</FormLabel>
                    <FormControl><Input placeholder="@..." className="bg-white/5 border-white/10 text-white text-xs h-12 rounded-xl font-bold" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleWebsiteLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 flex items-center gap-2"><Globe className="w-3 h-3 text-indigo-400" /> Website</FormLabel>
                    <FormControl><Input placeholder="URL..." className="bg-white/5 border-white/10 text-white text-xs h-12 rounded-xl font-bold" {...field} /></FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="googleBusinessLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 flex items-center gap-2"><Store className="w-3 h-3 text-emerald-500" /> Google Business</FormLabel>
                    <FormControl><Input placeholder="Maps URL..." className="bg-white/5 border-white/10 text-white text-xs h-12 rounded-xl font-bold" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2">
                    <Phone className="w-3 h-3 text-primary" /> Số Điện Thoại
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Số điện thoại / Line..." className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50 placeholder:text-slate-600" {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px] font-black uppercase" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="package"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white">Gói Dịch Vụ</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue placeholder="Chọn gói" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="select-content-solid border-white/10 text-white">
                      <SelectItem value="PRO" className="font-bold">GÓI PRO</SelectItem>
                      <SelectItem value="PLUS" className="font-bold">GÓI PLUS</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hasWebsite"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border border-white/5 p-6 bg-white/5 group hover:border-primary/30 transition-all">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-6 h-6 border-white/20 data-[state=checked]:bg-primary"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-xs font-black uppercase tracking-normal text-white group-hover:text-primary transition-colors cursor-pointer">
                      Có làm Website
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("hasWebsite") && (
              <div className="md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-500/5 p-8 rounded-[2rem] border border-indigo-500/20 mt-4">
                <div className="md:col-span-2">
                  <h3 className="text-xs font-black uppercase text-indigo-400 mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Thông tin dự án Website
                  </h3>
                </div>
                <FormField
                  control={form.control}
                  name="websiteStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-indigo-400" /> Bắt đầu Website
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:border-indigo-400/50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="websiteEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400 flex items-center gap-2">
                        <Calendar className="w-3 h-3 text-red-400" /> Kết thúc Website
                      </FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-white/5 border-white/10 text-white font-bold h-12 rounded-xl focus:border-indigo-400/50" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="websiteNote"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-normal text-slate-400">Ghi chú Website (Không bắt buộc)</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Các yêu cầu đặc biệt cho website..." className="bg-white/5 border-white/10 text-white min-h-[80px] font-bold rounded-xl focus:border-indigo-400/50 p-4" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="paymentTypes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2"><DollarSign className="w-3 h-3 text-emerald-500" /> Hình Thức Thanh Toán</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:ring-primary/50">
                        <SelectValue placeholder="Phương thức" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="select-content-solid border-white/10 text-white">
                      <SelectItem value="Zelle" className="font-bold">ZELLE</SelectItem>
                      <SelectItem value="Check" className="font-bold">CHECK</SelectItem>
                      <SelectItem value="Venmo" className="font-bold">VENMO</SelectItem>
                      <SelectItem value="Credit Card" className="font-bold">CREDIT CARD</SelectItem>
                      <SelectItem value="Wire" className="font-bold">WIRE</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salesPerson"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2"><UserCheck className="w-3 h-3 text-primary" /> Nhân Viên Sales</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        list="sales_persons_list" 
                        placeholder="Chọn hoặc nhập tên..." 
                        className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50 placeholder:text-slate-600"
                        {...field} 
                      />
                      <datalist id="sales_persons_list">
                        {salesPersonsDb?.map((s: any) => (
                          <option key={s.id} value={s.name} />
                        ))}
                      </datalist>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => {
                const currentSelection = Array.isArray(field.value) 
                  ? field.value 
                  : (typeof field.value === 'string' && field.value ? [field.value] : []);

                return (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2"><UserCheck className="w-3 h-3 text-primary" /> Người Phụ Trách</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-between h-14 font-bold text-left px-5 bg-white/5 border-white/10 text-white rounded-2xl hover:bg-white/10">
                          {currentSelection.length > 0 ? (
                            <span className="truncate uppercase tracking-normal">{currentSelection.join(", ")}</span>
                          ) : (
                            <span className="text-slate-600 uppercase tracking-normal text-xs font-bold">Chọn đội ngũ phụ trách</span>
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="select-content-solid w-72 p-4 border-white/10 rounded-2xl shadow-2xl" align="start">
                        <div className="space-y-3">
                          {staffList.map((staff) => (
                            <div key={staff} className="flex items-center space-x-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
                              <Checkbox
                                id={`staff-${staff}`}
                                checked={currentSelection.includes(staff)}
                                onCheckedChange={(checked) => {
                                  const updated = checked
                                    ? [...currentSelection, staff]
                                    : currentSelection.filter((val) => val !== staff);
                                  field.onChange(updated);
                                }}
                                className="border-white/20 data-[state=checked]:bg-primary"
                              />
                              <label htmlFor={`staff-${staff}`} className="text-xs font-black uppercase text-white cursor-pointer flex-1 tracking-normal">
                                {staff}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                );
              }}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-black uppercase tracking-normal text-white">Số Tiền Thanh Toán ($)</FormLabel>
                  <FormControl><Input placeholder="Nhập số tiền..." className="bg-white/5 border-white/10 text-white font-black h-14 rounded-2xl focus:border-primary/50 text-xl tracking-tight" {...field} /></FormControl>
                </FormItem>
              )}
            />

            <div className="md:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-normal text-white flex items-center gap-2"><MapPin className="w-3 h-3 text-primary" /> Địa Chỉ Tiệm</FormLabel>
                    <FormControl><Input placeholder="Nhập địa chỉ đầy đủ..." className="bg-white/5 border-white/10 text-white font-bold h-14 rounded-2xl focus:border-primary/50" {...field} /></FormControl>
                    <FormMessage className="text-[10px] font-black uppercase" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="googleVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border border-white/5 p-6 bg-white/5 group hover:border-primary/30 transition-all">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="w-6 h-6 border-white/20 data-[state=checked]:bg-emerald-500"
                    />
                  </FormControl>
                  <div className="space-y-1">
                    <FormLabel className="text-xs font-black uppercase tracking-normal text-white group-hover:text-primary transition-colors">Xác Minh Google</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <div className="md:col-span-2 lg:col-span-3">
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-black uppercase tracking-normal text-white">Ghi Chú Nội Bộ (Không bắt buộc)</FormLabel>
                    <FormControl><Textarea placeholder="Nhập các ghi chú quan trọng..." className="bg-white/5 border-white/10 text-white min-h-[150px] font-bold rounded-2xl focus:border-primary/50 p-6" {...field} /></FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-6 pt-6">
          <Button variant="ghost" type="button" onClick={() => router.back()} className="font-black uppercase tracking-widest text-xs text-slate-500 hover:text-white hover:bg-white/5 h-14 px-8 rounded-2xl">
            Hủy Bỏ
          </Button>
          <Button type="submit" className="futuristic-gradient text-white font-black h-14 px-12 shadow-2xl shadow-primary/30 uppercase tracking-widest text-xs rounded-2xl border border-white/20 active:scale-95 transition-all">
            <Save className="w-4 h-4 mr-3" /> Lưu Thông Tin
          </Button>
        </div>
      </form>
    </Form>
  );
}