"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Contact } from "@/lib/supabase";
import ContactForm, { type ContactInput } from "./ContactForm";

export default function ContactList({ session }: { session: Session }) {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("전체");
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .order("favorite", { ascending: false })
      .order("name", { ascending: true });
    if (error) {
      setError("연락처를 불러오지 못했습니다: " + error.message);
    } else {
      setContacts(data as Contact[]);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const groups = useMemo(() => {
    const set = new Set(contacts.map((c) => c.group_name).filter((g): g is string => !!g));
    return ["전체", ...Array.from(set).sort((a, b) => a.localeCompare(b, "ko"))];
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const qDigits = q.replace(/\D/g, "");
    return contacts.filter((c) => {
      if (onlyFavorites && !c.favorite) return false;
      if (group !== "전체" && c.group_name !== group) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        (qDigits !== "" && c.phone.replace(/\D/g, "").includes(qDigits)) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.memo ?? "").toLowerCase().includes(q)
      );
    });
  }, [contacts, query, group, onlyFavorites]);

  function toRow(input: ContactInput) {
    return {
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim() || null,
      group_name: input.group_name.trim() || null,
      memo: input.memo.trim() || null,
      favorite: input.favorite,
    };
  }

  function closeForm() {
    setFormOpen(false);
    setEditing(null);
  }

  async function handleSave(input: ContactInput) {
    const row = toRow(input);
    const { error } = editing
      ? await supabase.from("contacts").update(row).eq("id", editing.id)
      : await supabase.from("contacts").insert(row);
    if (error) {
      alert("저장 실패: " + error.message);
      return;
    }
    closeForm();
    await load();
  }

  async function handleDelete(c: Contact) {
    if (!confirm(`"${c.name}" 연락처를 삭제할까요?`)) return;
    const { error } = await supabase.from("contacts").delete().eq("id", c.id);
    if (error) alert("삭제 실패: " + error.message);
    else setContacts((list) => list.filter((x) => x.id !== c.id));
  }

  async function toggleFavorite(c: Contact) {
    setContacts((list) => list.map((x) => (x.id === c.id ? { ...x, favorite: !x.favorite } : x)));
    const { error } = await supabase.from("contacts").update({ favorite: !c.favorite }).eq("id", c.id);
    if (error) {
      alert("변경 실패: " + error.message);
      load();
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">📒 전화번호부</h1>
          <p className="text-sm text-slate-500">{session.user.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
            className="btn-primary"
          >
            + 새 연락처
          </button>
          <button onClick={() => supabase.auth.signOut()} className="btn-secondary">
            로그아웃
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <input
          type="search"
          placeholder="이름, 번호, 이메일, 메모 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input min-w-0 flex-1"
        />
        <select value={group} onChange={(e) => setGroup(e.target.value)} className="input w-auto">
          {groups.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <button
          onClick={() => setOnlyFavorites((v) => !v)}
          className={onlyFavorites ? "btn-primary" : "btn-secondary"}
          aria-pressed={onlyFavorites}
        >
          ★ 즐겨찾기
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <p className="mt-4 text-sm text-slate-500">
        {loading ? "불러오는 중..." : `${filtered.length}명 / 전체 ${contacts.length}명`}
      </p>

      <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {!loading && filtered.length === 0 && (
          <li className="p-8 text-center text-sm text-slate-400">
            {contacts.length === 0
              ? "아직 연락처가 없습니다. [+ 새 연락처]로 추가해 보세요."
              : "검색 결과가 없습니다."}
          </li>
        )}
        {filtered.map((c) => (
          <li key={c.id} className="flex items-center gap-3 p-4 hover:bg-slate-50">
            <button
              onClick={() => toggleFavorite(c)}
              className={`text-xl ${c.favorite ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
              aria-label={c.favorite ? "즐겨찾기 해제" : "즐겨찾기"}
            >
              ★
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-semibold text-slate-900">{c.name}</span>
                {c.group_name && (
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">{c.group_name}</span>
                )}
              </div>
              <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="text-sm text-slate-600 hover:text-indigo-600">
                {c.phone}
              </a>
              {c.email && <p className="truncate text-xs text-slate-400">{c.email}</p>}
              {c.memo && <p className="truncate text-xs text-slate-400">{c.memo}</p>}
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => {
                  setEditing(c);
                  setFormOpen(true);
                }}
                className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                수정
              </button>
              <button
                onClick={() => handleDelete(c)}
                className="rounded-lg px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>

      {formOpen && (
        <ContactForm key={editing?.id ?? "new"} initial={editing} onSubmit={handleSave} onCancel={closeForm} />
      )}
    </div>
  );
}
