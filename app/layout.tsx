import { Nunito } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import Header from "@/components/Header";

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
const nunitoSans = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nunitoSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-white font-sans">
        {/* Navbar */}
        <Header />

        {/* Main Content */}
        {children}
      </body>
    </html>
  );
}
