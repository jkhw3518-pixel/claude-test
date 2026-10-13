import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "전화번호부",
  description: "Supabase에 저장하는 나만의 전화번호부",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
