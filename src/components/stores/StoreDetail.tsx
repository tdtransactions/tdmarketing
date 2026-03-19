"use client";

import { StoreEntry } from "@/types/store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Phone, Facebook, Instagram, Globe, MessageSquare, ShieldCheck, Store as StoreIcon, ExternalLink, Calendar, User, CreditCard, Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const EmptyValue = ({ label }: { label?: string }) => (
  <span className="text-red-500 font-black text-xs bg-red-500/10 px-3 py-1 rounded-lg border border-red-500/20 uppercase tracking-normal animate-pulse">
    THIẾU {label || "DỮ LIỆU"}
  </span>
);

export function StoreDetail({ store }: { store: StoreEntry }) {
  const assignedList = Array.isArray(store.assignedTo) 
    ? store.assignedTo 
    : (store.assignedTo ? [store.assignedTo as unknown as string] : []);

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Cinematic Hero Card */}
      <Card className="glass-card podium-card rounded-[3rem] border-none overflow-hidden podium-animated">
        <CardContent className="p-12 md:p-20 relative">
          <div className="absolute top-10 right-10 opacity-10">
            <Zap className="w-32 h-32 text-primary fill-current" />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 relative z-10">
            <div className="space-y-6 max-w-3xl">
              <div className="flex flex-wrap gap-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-xl">
                  GÓI {store.package || "N/A"}
                </Badge>
                <Badge 
                  className={cn(
                    "font-black text-[10px] uppercase tracking-widest px-5 py-2 rounded-xl border-none",
                    store.googleVerified 
                      ? "bg-emerald-500/20 text-emerald-400" 
                      : "bg-red-500/20 text-red-500"
                  )}
                >
                  {store.googleVerified ? "ĐÃ XÁC MINH GOOGLE" : "UNVERIFIED GOOGLE"}
                </Badge>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none uppercase">
                {store.storeName || <EmptyValue label="TÊN TIỆM" />}
              </h1>
              <div className="flex items-center gap-3 text-slate-400">
                <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <span className="text-lg font-bold uppercase tracking-normal">{store.address || <EmptyValue label="ĐỊA CHỈ" />}</span>
              </div>
            </div>
            
            <div className="bg-white/5 p-10 rounded-[2rem] border border-white/10 backdrop-blur-xl min-w-[280px] shadow-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CreditCard className="w-3 h-3" /> GIÁ TRỊ GÓI
              </p>
              <div className="text-5xl font-black text-white flex items-baseline gap-2 tracking-tight">
                <span className="text-2xl text-primary font-black">$</span>{store.amount || <EmptyValue label="SỐ TIỀN" />}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <h3 className="text-xs font-black uppercase tracking-normal text-slate-500">Thông Tin Khách Hàng</h3>
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Người Liên Hệ</p>
                    <p className="text-2xl font-black text-white uppercase">{store.customerName || <EmptyValue label="TÊN KHÁCH" />}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Điện Thoại</p>
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
                  <h3 className="text-xs font-black uppercase tracking-normal text-slate-500">Thời Hạn Dịch Vụ</h3>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Bắt Đầu</p>
                    <p className="text-xl font-black text-white">{store.startDate || <EmptyValue label="NGÀY" />}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Kết Thúc</p>
                    <p className="text-xl font-black text-red-500">{store.endDate || <EmptyValue label="NGÀY" />}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Nhân Viên Bán Hàng</p>
                  <p className="text-xl font-black text-white uppercase">{store.salesPerson || <EmptyValue label="NHÂN VIÊN" />}</p>
                </div>
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
                <h3 className="text-xs font-black uppercase tracking-normal text-slate-500">Liên Kết Trực Tuyến</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { icon: Facebook, label: "FACEBOOK", link: store.facebookLink, color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: Instagram, label: "INSTAGRAM", link: store.instagramLink, color: "text-pink-500", bg: "bg-pink-500/10" },
                  { icon: Globe, label: "WEBSITE", link: store.googleWebsiteLink, color: "text-slate-400", bg: "bg-white/5" },
                  { icon: StoreIcon, label: "GOOGLE BUSINESS", link: store.googleBusinessLink, color: "text-emerald-500", bg: "bg-emerald-500/10" }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-4 p-6 rounded-[1.5rem] bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl transition-all", item.bg)}>
                        <item.icon className={cn("w-4 h-4", item.color)} />
                      </div>
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{item.label}</span>
                    </div>
                    {item.link ? (
                      <a href={item.link} target="_blank" className="text-[11px] font-black text-white uppercase tracking-normal flex items-center justify-between hover:text-primary transition-colors">
                        TRUY CẬP <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <EmptyValue label={item.label} />}
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
                <h3 className="text-xs font-black uppercase tracking-normal text-slate-500">Quản Lý Nội Bộ</h3>
              </div>
              
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Đội Ngũ Phụ Trách</p>
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
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ghi Chú Hệ Thống</p>
                </div>
                <div className="p-8 bg-white/5 rounded-[2rem] text-sm text-slate-400 leading-relaxed min-h-[250px] border border-white/5 font-medium">
                  {store.note || "Hệ thống chưa ghi nhận ghi chú cụ thể nào cho tiệm này."}
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 text-center">
                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">DỮ LIỆU ĐÃ ĐƯỢC MÃ HÓA</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
