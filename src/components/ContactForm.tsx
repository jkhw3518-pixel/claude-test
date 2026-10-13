"use client";

import { useState } from "react";
import type { Contact } from "@/lib/supabase";

export type ContactInput = {
  name: string;
  phone: string;
  email: string;
  group_name: string;
  memo: string;
  favorite: boolean;
};

const empty: ContactInput = { name: "", phone: "", email: "", group_name: "", memo: "", favorite: false };

export function formatPhone(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.startsWith("02")) {
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
    if (d.length <= 9) return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
    return `${d.slice(0, 2)}-${d.slice(2, 6)}-${d.slice(6, 10)}`;
  }
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export default function ContactForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Contact | null;
  onSubmit: (input: ContactInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ContactInput>(
    initial
      ? {
          name: initial.name,
          phone: initial.phone,
          email: initial.email ?? "",
          group_name: initial.group_name ?? "",
          memo: initial.memo ?? "",
          favorite: initial.favorite,
        }
      : empty,
  );
  const [saving, setSaving] = useState(false);

  function set<K extends keyof ContactInput>(key: K, value: ContactInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4" onClick={onCancel}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-slate-900">{initial ? "연락처 수정" : "새 연락처"}</h2>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">이름 *</span>
          <input required maxLength={100} value={form.name} onChange={(e) => set("name", e.target.value)} className="input mt-1" autoFocus />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">전화번호 *</span>
          <input
            required
            type="tel"
            inputMode="tel"
            maxLength={30}
            placeholder="010-1234-5678"
            value={form.phone}
            onChange={(e) => set("phone", formatPhone(e.target.value))}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">이메일</span>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">그룹</span>
          <input
            placeholder="가족, 친구, 회사..."
            value={form.group_name}
            onChange={(e) => set("group_name", e.target.value)}
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">메모</span>
          <textarea rows={3} value={form.memo} onChange={(e) => set("memo", e.target.value)} className="input mt-1 resize-none" />
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.favorite} onChange={(e) => set("favorite", e.target.checked)} className="h-4 w-4 accent-amber-500" />
          즐겨찾기
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onCancel} className="btn-secondary">취소</button>
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "저장 중..." : "저장"}</button>
        </div>
      </form>
    </div>
  );
}
