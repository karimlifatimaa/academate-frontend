"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

const ROLE_ROUTES: Record<string, string> = {
  STUDENT: "/lessons",
  TEACHER: "/lessons",
  PARENT: "/family/children",
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    const target = ROLE_ROUTES[user.role] ?? "/lessons";
    router.replace(target);
  }, [user, router]);

  return null;
}
