"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import AuthForm from "@/components/AuthForm";
import ContactList from "@/components/ContactList";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <main className="mx-auto mt-16 max-w-lg rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <h1 className="text-xl font-bold text-slate-900">Supabase 설정이 필요합니다</h1>
        <p className="mt-2 text-sm text-slate-600">
          환경 변수 <code>NEXT_PUBLIC_SUPABASE_URL</code>과 <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>를
          설정하세요. 로컬에서는 <code>.env.local</code> 파일에, Vercel에서는 Project Settings &gt; Environment
          Variables에 넣으면 됩니다.
        </p>
      </main>
    );
  }

  if (!ready) return <p className="mt-16 text-center text-slate-400">불러오는 중...</p>;

  return <main>{session ? <ContactList session={session} /> : <AuthForm />}</main>;
}
