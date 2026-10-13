"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "info"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage({ type: "error", text: "로그인 실패: " + error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setMessage({ type: "error", text: "회원가입 실패: " + error.message });
      } else if (!data.session) {
        setMessage({ type: "info", text: "확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인하세요." });
        setMode("login");
      }
    }
    setLoading(false);
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <h1 className="text-2xl font-bold text-slate-900">📒 전화번호부</h1>
      <p className="mt-1 text-sm text-slate-500">
        {mode === "login" ? "로그인하고 내 연락처를 관리하세요." : "새 계정을 만드세요."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">이메일</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input mt-1"
            autoComplete="email"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">비밀번호</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input mt-1"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </label>

        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-red-600" : "text-emerald-600"}`}>
            {message.text}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "signup" : "login");
          setMessage(null);
        }}
        className="mt-4 w-full text-center text-sm text-indigo-600 hover:underline"
      >
        {mode === "login" ? "계정이 없나요? 회원가입" : "이미 계정이 있나요? 로그인"}
      </button>
    </div>
  );
}
