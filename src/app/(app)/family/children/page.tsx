"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, UserPlus, Loader2, Link2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useChildren } from "@/hooks/useChildren";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";
import type { ChildResponse } from "@/types/profile";
import { UserAvatar } from "@/components/ui/user-avatar";

function ChildCard({ child }: { child: ChildResponse }) {
  return (
    <div className="rounded-2xl bg-white ring-1 ring-black/5 p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
      <UserAvatar name={child.fullName} url={child.avatarUrl} size="lg" className="h-14 w-14 text-lg" />

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#1A1A1A]">{child.fullName}</p>
        <p className="text-sm text-muted-foreground mt-0.5">Şagird</p>
      </div>

      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium shrink-0 ${
          child.emailVerified
            ? "bg-emerald-100 text-emerald-700"
            : "bg-amber-100 text-amber-700"
        }`}
      >
        {child.emailVerified ? "Aktiv" : "Gözlənilir"}
      </span>
    </div>
  );
}

function LinkChildModal({ onClose }: { onClose: () => void }) {
  const [inviteCode, setInviteCode] = useState("");
  const [relation, setRelation] = useState("MOTHER");
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const RELATIONS = [
    { value: "MOTHER", label: "Ana" },
    { value: "FATHER", label: "Ata" },
    { value: "GUARDIAN", label: "Qəyyum" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) {
      toast.error("Dəvət kodunu daxil edin");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/v1/family/link", {
        inviteCode: inviteCode.trim().toUpperCase(),
        relation,
      });
      toast.success("Uşaq uğurla əlavə edildi!");
      qc.invalidateQueries({ queryKey: ["children"] });
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Kod yanlışdır");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="w-full max-w-sm rounded-2xl bg-white ring-1 ring-black/10 shadow-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#1A1A1A]">Uşaq əlavə et</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Şagirdin hesabından alınan dəvət kodunu daxil edin
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Dəvət kodu
            </label>
            <input
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="ABC123"
              maxLength={10}
              className="w-full h-11 rounded-xl border border-[#E2DDD5] bg-white px-3 text-sm font-mono tracking-widest focus:outline-none focus:border-[#4A6741] focus:ring-3 focus:ring-[#4A6741]/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[#1A1A1A]">
              Münasibət
            </label>
            <div className="grid grid-cols-3 gap-2">
              {RELATIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRelation(value)}
                  className="h-10 rounded-xl border text-sm font-medium transition-colors"
                  style={
                    relation === value
                      ? { background: "#4A6741", color: "white", borderColor: "#4A6741" }
                      : { borderColor: "#E2DDD5", color: "#4A4A4A" }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-[#E2DDD5] text-sm font-medium text-[#4A4A4A] hover:bg-muted/50 transition-colors"
            >
              Ləğv et
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-11 rounded-xl text-sm font-semibold text-white disabled:opacity-70 transition-opacity"
              style={{
                background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)",
              }}
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin mx-auto" />
              ) : (
                "Əlavə et"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ChildrenPage() {
  const { data: children, isLoading } = useChildren();
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A]">Uşaqlarım</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hesabınıza bağlı uşaqların siyahısı
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/family/children/new"
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold border border-[#4A6741] text-[#4A6741] hover:bg-[#F0F5EE] transition-colors"
          >
            <Plus className="size-4" />
            Yeni uşaq
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{
              background: "linear-gradient(135deg, #4A6741 0%, #6B8F6E 100%)",
            }}
          >
            <UserPlus className="size-4" />
            Kodla bağla
          </button>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl bg-[#F0F5EE] border border-[#D4E5D0] p-4 flex gap-3">
        <Link2 className="size-5 text-[#4A6741] shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-[#1A1A1A]">
            Necə əlavə etmək olar?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Uşağınızın hesabından <strong>Profil → Valideyn dəvəti</strong> bölməsindən
            dəvət kodu alın. Sonra "Uşaq əlavə et" düyməsi ilə kodu daxil edin.
          </p>
        </div>
      </div>

      {/* Children list */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-8 animate-spin text-[#4A6741]" />
        </div>
      ) : !children || children.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-white ring-1 ring-black/5">
          <Users className="size-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-[#1A1A1A]">Uşaq tapılmadı</p>
          <p className="text-sm text-muted-foreground mt-1">
            "Uşaq əlavə et" düyməsi ilə uşağınızı hesabınıza bağlayın
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </div>
      )}

      {showModal && <LinkChildModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
