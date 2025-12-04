import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 패션 스타일 평가 시스템",
  description: "AI 기반 패션 스타일 종합 평가 서비스",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

