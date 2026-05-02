"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const ROLE_ROUTES: Record<string, string> = {
  STUDENT: "/lessons",
  TEACHER: "/lessons",
  PARENT: "/family/children",
  ADMIN: "/admin/users",
};

export default function DashboardPage() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useProfile();

  useEffect(() => {
    if (isLoading) return;
    if (isError || !profile) {
      router.replace("/login");
      return;
    }
    const target = ROLE_ROUTES[profile.role] ?? "/lessons";
    router.replace(target);
  }, [profile, isLoading, isError, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#F8F5F0" }}
    >
      <Loader2 className="size-8 animate-spin text-[#4A6741]" />
    </div>
  );
}
