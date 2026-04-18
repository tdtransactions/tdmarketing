"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Store, Users, Settings, PlusCircle, LogOut, Shield, Globe, MessageSquareWarning } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFirebase, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where } from "firebase/firestore";

const navItems = [
  { label: "Bảng Điều Khiển", href: "/", icon: LayoutDashboard, roleAccess: ["Admin", "Manager", "Staff"] },
  { label: "Danh Sách Tiệm", href: "/stores", icon: Store, roleAccess: ["Admin", "Manager", "Staff"] },
  { label: "Quản Lý Website", href: "/websites", icon: Globe, roleAccess: ["Admin", "Manager", "Staff"] },
  { label: "Yêu Cầu Xử Lý", href: "/requests", icon: MessageSquareWarning, roleAccess: ["Admin", "Manager", "Staff", "Sale"] },
  { label: "Thêm Tiệm Mới", href: "/stores/new", icon: PlusCircle, roleAccess: ["Admin"] },
  { label: "Nhân Sự Nội Bộ", href: "/staff", icon: Users, roleAccess: ["Admin"] },
  { label: "Tài Khoản Hệ Thống", href: "/users", icon: Shield, roleAccess: ["Admin"] },
  { label: "Cài Đặt", href: "/settings", icon: Settings, roleAccess: ["Admin", "Manager", "Staff"] },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { profile, logout } = useFirebase();
  const role = profile?.role || "Guest";
  const firestore = useFirestore();

  const adminRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "sales_requests"), where("status", "in", ["new", "accepted", "pending"]));
  }, [firestore]);
  const { data: adminRequests } = useCollection(adminRequestsQuery);

  const salesRequestsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "sales_requests"), where("status", "==", "completed"));
  }, [firestore]);
  const { data: salesRequests } = useCollection(salesRequestsQuery);

  const adminBadgeCount = adminRequests?.length || 0;
  const salesBadgeCount = salesRequests?.length || 0;
  const isAdmin = role === "Admin";

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-10 pb-6">
        <div className="space-y-1">
          <h1 className="text-xl font-black text-white tracking-normal uppercase leading-tight">
            TD TRANSACTIONS
          </h1>
          <p className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase">marketing</p>
        </div>
      </div>
      
      <nav className="flex-1 px-6 py-6 space-y-2">
        {navItems.map((item) => {
          if (!item.roleAccess.includes(role)) return null;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300",
                isActive 
                  ? "bg-primary text-white shadow-xl shadow-primary/30 border border-white/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white border border-transparent"
              )}
            >
              <div className="flex items-center gap-4">
                <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-500")} />
                {item.label}
              </div>
              {item.href === "/requests" && isAdmin && adminBadgeCount > 0 && (
                <div className="bg-red-500 text-white text-[9px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse shadow-lg shadow-red-500/20">
                  {adminBadgeCount}
                </div>
              )}
              {item.href === "/requests" && !isAdmin && salesBadgeCount > 0 && (
                <div className="bg-red-500 w-2.5 h-2.5 rounded-full animate-pulse shadow-lg shadow-red-500/20"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto">
        <div className="p-5 bg-white/5 rounded-3xl border border-white/10 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-3 h-3 text-primary" />
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Bảo Mật Hệ Thống</span>
          </div>
          <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase tracking-normal">Dữ liệu được bảo vệ 24/7.</p>
        </div>
        <button 
          onClick={() => logout()}
          className="flex items-center gap-4 w-full px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all border border-transparent"
        >
          <LogOut className="w-4 h-4" />
          Đăng Xuất
        </button>
      </div>
    </div>
  );
}