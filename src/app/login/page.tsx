
"use client";

import { useState } from "react";
import { useFirebase } from "@/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const { login } = useFirebase();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      await login(email, password);
      toast({ title: "XÁC THỰC THÀNH CÔNG", description: "Định danh đã được xác nhận. Chào mừng trở lại." });
      router.push("/");
    } catch (error: any) {
      setErrorMessage(error.message || "Xác thực thất bại.");
      toast({
        variant: "destructive",
        title: "TRUY CẬP BỊ TỪ CHỐI",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 font-sans overflow-hidden relative">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[150px]"></div>
      <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/tech/1920/1080')] bg-no-repeat bg-cover bg-center opacity-[0.03] grayscale"></div>

      <div className="w-full max-w-lg relative z-10 space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black text-white tracking-tighter uppercase leading-tight">
            TD TRANSACTIONS
          </h1>
        </div>

        <Card className="glass-card shadow-2xl border-white/5 overflow-hidden rounded-[2.5rem]">
          <CardHeader className="p-12 pb-4 text-center">
            <p className="text-slate-400 font-black uppercase text-[15px] tracking-widest">ĐĂNG NHẬP HỆ THỐNG</p>
          </CardHeader>
          <CardContent className="p-12 pt-4">
            <form onSubmit={handleLogin} className="space-y-8">
              {errorMessage && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3 text-red-400 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="uppercase">{errorMessage}</p>
                </div>
              )}

              <div className="space-y-3">
                <Label htmlFor="email" className="text-slate-400 font-black text-[10px] uppercase tracking-widest ml-1">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-slate-600" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@tdtransactions.com"
                    className="pl-12 h-14 bg-slate-900/50 border-white/5 focus:border-primary/50 focus:ring-primary/20 text-white font-bold rounded-2xl placeholder:text-slate-700"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="password" className="text-slate-400 font-black text-[10px] uppercase tracking-widest ml-1">Mật Khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-slate-600" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-12 h-14 bg-slate-900/50 border-white/5 focus:border-primary/50 focus:ring-primary/20 text-white font-bold rounded-2xl placeholder:text-slate-700"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 futuristic-gradient hover:opacity-90 font-black shadow-2xl shadow-primary/30 transition-all active:scale-[0.98] uppercase tracking-[0.2em] text-[11px] rounded-2xl" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "TRUY CẬP HỆ THỐNG"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black pt-8">
          © TD TRANSACTIONS LLC 
        </p>
      </div>
    </div>
  );
}
