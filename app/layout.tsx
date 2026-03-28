import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: {
    default: "WinterQuiz", // Tên mặc định khi ở trang chủ
    template: "%s | WinterQuiz", // Công thức: [Tên trang con] | Quiz App
  },
  description: "Ứng dụng ôn tập và kiểm tra kiến thức trực tuyến",
  icons: {
    icon: "/favicon.ico",
  },
};
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white">
        {/* Navbar */}
        <Header />

        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
