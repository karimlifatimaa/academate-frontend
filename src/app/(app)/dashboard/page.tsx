"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { useProfile } from "@/hooks/useProfile";
import StudentDashboard from "@/components/dashboards/StudentDashboard";
import TeacherDashboard from "@/components/dashboards/TeacherDashboard";
import ParentDashboard from "@/components/dashboards/ParentDashboard";
import AdminDashboard from "@/components/dashboards/AdminDashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { data: profile, isLoading, isError } = useProfile();

  useEffect(() => {
    if (!isLoading && (isError || !profile)) {
      router.replace("/login");
    }
  }, [profile, isLoading, isError, router]);

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-[#4A6741]" />
      </div>
    );
  }

  switch (profile.role) {
    case "STUDENT":
      return <StudentDashboard />;
    case "TEACHER":
      return <TeacherDashboard />;
    case "PARENT":
      return <ParentDashboard />;
    case "ADMIN":
      return <AdminDashboard />;
    default:
      return null;
  }
}
