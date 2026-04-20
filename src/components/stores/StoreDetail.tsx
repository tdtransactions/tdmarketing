"use client";

import { StoreEntry } from "@/types/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Facebook, Instagram, Globe, MessageSquare, ShieldCheck, Store as StoreIcon, ExternalLink, Calendar, User, CreditCard, Clock, Zap, AlertTriangle, Copy, Check, TrendingUp, Plus, History, Trophy } from "lucide-react";
import { differenceInDays, differenceInMonths, parseISO, format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore } from "@/firebase";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const EmptyValue = ({ label }: { label?: string }) => (
  <span className="text-red-500 font-black text-sm bg-red-500/10 px-4 py-1.5 rounded-lg border border-red-500/20 uppercase tracking-normal animate-pulse">
    THIẾU {label || "DỮ LIỆU"}
  </span>
);

export function StoreDetail({ store }: { store: StoreEntry }) {
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [newRank, setNewRank] = useState("");
  const [rankDate, setRankDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customStartDate, setCustomStartDate] = useState(store.startDate || format(new Date(), "yyyy-MM-dd"));
  const [isAddingRank, setIsAddingRank] = useState(false);
  const [editingType, setEditingType] = useState<"initial" | "latest" | "new">("new");
  const firestore = useFirestore();

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleAddRank = async () => {
    if (!firestore || !store.id || !newRank) return;

    try {
      const selectedDate = parseISO(rankDate);
      const start = parseISO(customStartDate);
      const months = differenceInMonths(selectedDate, start);
      const days = differenceInDays(selectedDate, start) % 30;
      const durationLabel = `${months} THÁNG ${days} NGÀY`;

      let updates: any = {};

      if (editingType === "initial") {
        updates.seoRankInitial = {
          rank: newRank,
          date: rankDate,
        };
      } else if (editingType === "latest") {
        updates.startDate = customStartDate;
        updates.seoRankLatest = {
          rank: newRank,
          date: rankDate,
          durationLabel,
        };
      } else {
        // Chế độ thêm mới (mặc định)
        updates.startDate = customStartDate;
        updates.seoRankLatest = {
          rank: newRank,
          date: rankDate,
          durationLabel,
        };
        if (!store.seoRankInitial) {
          updates.seoRankInitial = {
            rank: newRank,
            date: rankDate,
          };
        }
      }

      await updateDoc(doc(firestore, "stores", store.id), updates);

      setNewRank("");
      setIsAddingRank(false);
      setEditingType("new");
      toast({ title: "HOÀN TẤT CẬP NHẬT", description: "Dữ liệu SEO đã được đồng bộ chính xác." });
    } catch (error) {
      toast({ title: "LỖI HỆ THỐNG", description: "Vui lòng kiểm tra lại định dạng ngày tháng.", variant: "destructive" });
    }
  };

  const openEditDialog = (type: "initial" | "latest") => {
    setEditingType(type);
    if (type === "initial" && store.seoRankInitial) {
      setNewRank(store.seoRankInitial.rank);
      setRankDate(store.seoRankInitial.date);
    } else if (type === "latest" && store.seoRankLatest) {
      setNewRank(store.seoRankLatest.rank);
      setRankDate(store.seoRankLatest.date);
      setCustomStartDate(store.startDate || format(new Date(), "yyyy-MM-dd"));
    }
    setIsAddingRank(true);
  };
  const assignedList = Array.isArray(store.assignedTo) 
    ? store.assignedTo 
    : (store.assignedTo ? [store.assignedTo as unknown as string] : []);

  const missingFields = [];
  const showSocial = store.serviceType === "both" || store.serviceType === "social" || !store.serviceType;
  const showWebsite = store.serviceType === "both" || store.serviceType === "website" || !store.serviceType;

  if (showSocial) {
    if (!store.facebookLink) missingFields.push("Facebook");
    if (!store.instagramLink) missingFields.push("Instagram");
    if (!store.googleBusinessLink) missingFields.push("Google Business");
  }
  
  if (showWebsite) {
    if (!store.googleWebsiteLink) missingFields.push("Website");
  }

  return (
    <div className="space-y-10 animate-slide-up">
      {missingFields.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="p-3 bg-amber-500/20 rounded-2xl">
            <AlertTriangle className="text-amber-500 w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-amber-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Cảnh báo thông tin</p>
            <p className="text-white/80 text-xs font-bold uppercase tracking-normal">
              Tiệm đang thiếu dữ liệu: <span className="text-amber-500">{missingFields.join(", ")}</span>. Vui lòng bổ sung để tối ưu hóa quản lý.
            </p>
          </div>
        </div>
      )}
      {/* Cinematic Hero Card */}
      <Card className="glass-card podium-card rounded-[3rem] border-none overflow-hidden podium-animated">
        {/* ... (Hero content remains same, I'll just keep the structure for context) */}
        <CardContent className="p-12 md:p-20 relative">
          <div className="absolute top-10 right-10 opacity-10">
            <Zap className="w-32 h-32 text-primary fill-current" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl">
                  GÓI {store.package || "N/A"}
                </Badge>
                <Badge 
                  className={cn(
                    "font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl border-none",
                    store.googleVerified 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-500"
                  )}
                >
                  {store.googleVerified ? "ĐÃ XÁC MINH GOOGLE" : "UNVERIFIED GOOGLE"}
                </Badge>
                <Badge className="bg-white/10 text-white border-white/20 font-black text-xs uppercase tracking-widest px-6 py-2.5 rounded-xl">
                  DỊCH VỤ: {(() => {
                    switch(store.serviceType) {
                      case "social": return "CHỈ SOCIAL";
                      case "website": return "CHỈ WEBSITE";
                      default: return "SOCIAL + WEBSITE";
                    }
                  })()}
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none uppercase">
                {store.storeName || <EmptyValue label="TÊN TIỆM" />}
              </h1>
              <div className="flex items-center gap-3 text-slate-300">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-bold uppercase tracking-normal">{store.address || <EmptyValue label="ĐỊA CHỈ" />}</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-xl min-w-[300px] shadow-2xl">
              <p className="text-xs font-black text-slate-300 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> GIÁ TRỊ GÓI
              </p>
              <div className="text-6xl font-black text-white flex items-baseline gap-2 tracking-tight">
                <span className="text-3xl text-primary font-black">$</span>{store.amount || <EmptyValue label="SỐ TIỀN" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-16 w-full max-w-md mx-auto grid grid-cols-2 mb-10">
          <TabsTrigger value="info" className="rounded-xl font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Thông Tin Dịch Vụ</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-xl font-black uppercase text-xs data-[state=active]:bg-primary data-[state=active]:text-white">Thứ Hạng SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-10 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Main Info Blocks */}
            <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Customer Information */}
                <Card className="glass-card rounded-[2.5rem]">
                  <CardContent className="p-10 space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                      <div className="p-3 bg-indigo-500/10 rounded-2xl">
                        <User className="w-6 h-6 text-indigo-400" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-normal text-slate-300">Thông Tin Khách Hàng</h3>
                    </div>
                    <div className="space-y-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Người Liên Hệ</p>
                        <p className="text-2xl font-black text-white uppercase">{store.customerName || <EmptyValue label="TÊN KHÁCH" />}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Điện Thoại</p>
                        <p className="text-2xl font-black text-primary tracking-tight">{store.customerPhone || <EmptyValue label="SỐ ĐT" />}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Timeline & Sales */}
                <Card className="glass-card rounded-[2.5rem]">
                  <CardContent className="p-10 space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                      <div className="p-3 bg-purple-500/10 rounded-2xl">
                        <Clock className="w-6 h-6 text-purple-400" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-normal text-slate-300">Thời Hạn Dịch Vụ</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Bắt Đầu</p>
                        <p className="text-xl font-black text-white">{store.startDate || <EmptyValue label="NGÀY" />}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Kết Thúc</p>
                        <p className="text-xl font-black text-red-500">{store.endDate || <EmptyValue label="NGÀY" />}</p>
                      </div>
                    </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Nhân Viên Bán Hàng</p>
                        <p className="text-xl font-black text-white uppercase">{store.salesPerson || <EmptyValue label="NHÂN VIÊN" />}</p>
                      </div>
                    {store.endDate && (
                      <div className="pt-6 border-t border-white/5">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-3">Thời Gian Còn Lại</p>
                        {(() => {
                          try {
                            const end = parseISO(store.endDate);
                            const now = new Date();
                            const months = differenceInMonths(end, now);
                            const days = differenceInDays(end, now) % 30;
                            
                            if (differenceInDays(end, now) < 0) {
                              return <Badge className="bg-red-500/20 text-red-500 border-red-500/30 font-black text-xs px-4 py-2 rounded-xl">ĐÃ HẾT HẠN</Badge>;
                            }
                            
                            return (
                              <div className="flex items-center gap-3">
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 font-black text-base px-5 py-2.5 rounded-xl">
                                  {months} THÁNG {days > 0 ? `& ${days} NGÀY` : ""}
                                </Badge>
                              </div>
                            );
                          } catch (e) {
                            return <EmptyValue label="THỜI GIAN" />;
                          }
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Social Links */}
              <Card className="glass-card rounded-[2.5rem]">
                <CardContent className="p-10 space-y-10">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl">
                      <Globe className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-normal text-slate-300">Liên Kết Trực Tuyến</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { icon: Facebook, label: "FACEBOOK", link: store.facebookLink, color: "text-blue-500", bg: "bg-blue-500/10" },
                      { icon: Instagram, label: "INSTAGRAM", link: store.instagramLink, color: "text-pink-500", bg: "bg-pink-500/10" },
                      { icon: Globe, label: "WEBSITE", link: store.googleWebsiteLink, color: "text-slate-300", bg: "bg-white/5" },
                      { icon: StoreIcon, label: "GOOGLE BUSINESS", link: store.googleBusinessLink, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-xl transition-all", item.bg)}>
                            <item.icon className={cn("w-4 h-4", item.color)} />
                          </div>
                          <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{item.label}</span>
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-auto pt-4 border-t border-white/5">
                          {item.link ? (
                            <>
                              <a href={item.link} target="_blank" className="text-[11px] font-black text-white uppercase tracking-normal flex items-center gap-1.5 hover:text-primary transition-colors">
                                TRUY CẬP <ExternalLink className="w-3 h-3" />
                              </a>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg"
                                onClick={() => handleCopy(item.link!, item.label)}
                              >
                                {copiedLink === item.label ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </Button>
                            </>
                          ) : <EmptyValue label={item.label} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System & Team */}
            <div className="lg:col-span-4 space-y-10">
              <Card className="glass-card rounded-[2.5rem] h-full">
                <CardContent className="p-10 space-y-12">
                  <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                    <div className="p-3 bg-amber-500/10 rounded-2xl">
                      <ShieldCheck className="w-6 h-6 text-amber-400" />
                    </div>
                    <h3 className="text-xs font-black uppercase tracking-normal text-slate-300">Quản Lý Nội Bộ</h3>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Đội Ngũ Phụ Trách</p>
                    <div className="flex flex-wrap gap-3">
                      {assignedList.length > 0 ? (
                        assignedList.map((name, i) => (
                          <Badge key={i} className="futuristic-gradient text-white font-black text-[10px] uppercase tracking-widest px-5 py-2.5 rounded-xl border-none shadow-lg shadow-primary/20">
                            {name}
                          </Badge>
                        ))
                      ) : <EmptyValue label="NHÂN SỰ" />}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ghi Chú Hệ Thống</p>
                    </div>
                    <div className="p-8 bg-white/5 rounded-[2rem] text-sm text-slate-300 leading-relaxed min-h-[250px] border border-white/5 font-medium">
                      {store.note || "Hệ thống chưa ghi nhận ghi chú cụ thể nào cho tiệm này."}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">DỮ LIỆU ĐÃ ĐƯỢC MÃ HÓA</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-10 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Sidebar: Controls */}
            <div className="lg:col-span-4 space-y-10">
              <Card className="glass-card rounded-[2.5rem] p-10 space-y-10">
                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                  <div className="p-3 bg-primary/10 rounded-2xl">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-normal text-slate-300">Bảng Điều Khiển</h3>
                </div>

                <div className="space-y-6">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest leading-relaxed">
                    Sử dụng công cụ bên dưới để cập nhật vị trí rank mới nhất và đồng bộ thời gian triển khai của tiệm.
                  </p>
                  
                  <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Mục Tiêu Chiến Dịch</p>
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5 text-amber-500" />
                      <span className="text-xl font-black text-white uppercase tracking-tight">
                        {store.package?.toUpperCase() === "PRO" ? "TOP 5 GOOGLE" : "TOP 10 GOOGLE"}
                      </span>
                    </div>
                  </div>

                  <Dialog open={isAddingRank} onOpenChange={(open) => {
                    setIsAddingRank(open);
                    if (!open) {
                      setNewRank("");
                      setEditingType("new");
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button className="w-full h-20 futuristic-gradient text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                        <Plus className="w-4 h-4 mr-2" /> Thêm Rank Mới
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-950 border border-white/10 text-white rounded-[3rem] p-12 max-w-xl shadow-3xl">
                      <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight text-center mb-8">
                          {editingType === "initial" ? "CHỈNH SỬA RANK ĐẦU" : editingType === "latest" ? "CHỈNH SỬA RANK MỚI" : "HỆ THỐNG PHÂN TÍCH RANK"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Vị Trí Rank Mới</Label>
                          <Input 
                            placeholder="Ví dụ: 3" 
                            className="h-16 bg-white/5 border-white/10 text-white text-xl font-black rounded-2xl focus:border-primary/50 transition-colors"
                            value={newRank}
                            onChange={(e) => setNewRank(e.target.value)}
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[10px] font-black text-slate-300 uppercase tracking-widest ml-1">Ngày Ghi Nhận Rank</Label>
                          <Input 
                            type="date"
                            className="h-16 bg-white/5 border-white/10 text-white font-bold rounded-2xl"
                            value={rankDate}
                            onChange={(e) => setRankDate(e.target.value)}
                          />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                          <Label className="text-[10px] font-black text-primary uppercase tracking-widest ml-1">Điều Chỉnh Ngày Bắt Đầu (Package Start)</Label>
                          <Input 
                            type="date"
                            className="h-16 bg-primary/5 border-primary/20 text-white font-bold rounded-2xl"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-[1.5rem] text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase leading-relaxed">
                          Hệ thống sẽ tự động tính toán thời gian chênh lệch dựa trên <br />
                          <span className="text-white">Ngày Bắt Đầu</span> và <span className="text-white">Ngày Ghi Nhận</span> bạn vừa nhập.
                        </p>
                      </div>
                      <DialogFooter className="mt-10">
                        <Button 
                          className="w-full h-16 futuristic-gradient text-white font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl"
                          onClick={handleAddRank}
                        >
                          Xác Nhận & Đồng Bộ Dữ Liệu
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="pt-10 border-t border-white/10 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Bảo Mật Dữ Liệu Rank
                  </div>
                  <p className="text-[10px] text-slate-300 font-bold uppercase leading-relaxed">
                    Thông tin rank được lưu trữ độc lập để đảm bảo tốc độ truy xuất database tối ưu nhất.
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Content: Scoreboards */}
            <div className="lg:col-span-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Initial Rank Scoreboard */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/20 to-slate-800/20 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  <div className="relative p-12 bg-black/40 rounded-[2.5rem] border border-white/10 backdrop-blur-xl space-y-8">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Position Alpha</p>
                      <div className="flex items-center gap-2">
                        {store.seoRankInitial && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                            onClick={() => openEditDialog("initial")}
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                        )}
                        <Badge className="bg-white/10 text-slate-200 border-white/20 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase">Starting Point</Badge>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-6">
                      <span className="text-8xl font-black text-white tracking-tighter">{store.seoRankInitial?.rank || "--"}</span>
                      <span className="text-sm font-black text-slate-300 uppercase tracking-widest">Global Rank</span>
                    </div>
                    <div className="pt-8 border-t border-white/10 flex items-center gap-4">
                      <div className="p-2.5 bg-white/10 rounded-xl">
                        <Calendar className="w-5 h-5 text-slate-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Recorded Date</p>
                        <p className="text-sm font-black text-slate-200 uppercase tracking-tight">{store.seoRankInitial?.date || "No Data"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Latest Rank Scoreboard */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary/40 to-primary/10 rounded-[2.5rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                  <div className="relative p-12 bg-black/40 rounded-[2.5rem] border border-primary/20 backdrop-blur-xl space-y-8 overflow-hidden">
                    <div className="absolute -right-8 -top-8 opacity-5">
                      <Trophy className="w-48 h-48 text-primary" />
                    </div>
                    <div className="flex items-center justify-between relative z-10">
                      <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Latest Insight</p>
                      <div className="flex items-center gap-2">
                        {store.seoRankLatest && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 text-primary hover:text-white hover:bg-primary/20 rounded-lg"
                            onClick={() => openEditDialog("latest")}
                          >
                            <Zap className="w-4 h-4" />
                          </Button>
                        )}
                        <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px] font-black px-4 py-1.5 rounded-lg uppercase animate-pulse">Live Status</Badge>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-6 relative z-10">
                      <span className="text-8xl font-black text-white tracking-tighter">{store.seoRankLatest?.rank || "--"}</span>
                      <span className="text-sm font-black text-primary uppercase tracking-widest">Achieved</span>
                    </div>
                    <div className="pt-8 border-t border-white/20 space-y-6 relative z-10">
                      <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-4 text-slate-200">
                          <div className="p-2.5 bg-primary/20 rounded-xl">
                            <Calendar className="w-5 h-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Cập nhật vào ngày</p>
                            <p className="text-sm font-black text-white uppercase tracking-tight">{store.seoRankLatest?.date || "N/A"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-slate-200">
                          <div className="p-2.5 bg-amber-500/20 rounded-xl">
                            <Clock className="w-5 h-5 text-amber-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thời gian triển khai</p>
                            <span className="text-sm font-black text-amber-500 uppercase tracking-tight">{store.seoRankLatest?.durationLabel || "N/A"}</span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-2/3 futuristic-gradient animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tips / Info Card */}
              <Card className="glass-card rounded-[2.5rem] p-12 bg-gradient-to-br from-white/[0.05] to-transparent border-white/10">
                <div className="flex flex-col md:flex-row items-center gap-12 text-center md:text-left">
                  <div className="w-24 h-24 bg-primary/10 rounded-[2rem] flex items-center justify-center shrink-0">
                    <Trophy className="w-10 h-10 text-primary" />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight">Chiến Lược Tăng Trưởng SEO</h4>
                    <p className="text-slate-300 text-sm font-medium leading-relaxed max-w-2xl">
                      Dữ liệu rank được tính toán dựa trên ngày bắt đầu gói dịch vụ của tiệm. Việc cập nhật thường xuyên giúp hệ thống phân tích chính xác tốc độ thăng hạng và hiệu quả của các chiến dịch SEO Google Maps.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
