import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Tracker",
  description: "Личный трекер задач",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
