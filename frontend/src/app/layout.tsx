import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Denúncias Ambientais",
    template: "%s | Denúncias Ambientais",
  },
  description: "Plataforma cidadã para registro de denúncias ambientais. Ajude a proteger o meio ambiente da sua cidade.",
  keywords: ["denúncia", "ambiental", "queimada", "desmatamento", "poluição", "meio ambiente"],
  authors: [{ name: "Denúncias Ambientais" }],
  openGraph: {
    title: "Denúncias Ambientais",
    description: "Plataforma cidadã para registro de denúncias ambientais",
    type: "website",
    locale: "pt_BR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-gray-50`}
      >
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
