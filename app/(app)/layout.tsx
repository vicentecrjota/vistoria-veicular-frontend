"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 ml-64 min-h-full">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
