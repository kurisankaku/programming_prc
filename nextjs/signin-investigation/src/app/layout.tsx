import type { Metadata } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AuthSessionProvider } from "@/providers/auth-session-provider";
import { SwrProvider } from "@/providers/swr-provider";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "工具 Kōgu — 京都・西陣の道具屋",
    template: "%s — 工具 Kōgu",
  },
  description:
    "作り手の分かる道具だけを扱う、京都・西陣の道具屋です。筆記・裁断・計測・収納の道具を取り揃えています。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className={`${archivo.variable} ${plexMono.variable} h-full`}>
      <body className="flex min-h-full flex-col">
        <SwrProvider>
          {/* ヘッダーも含めて囲むので、ヘッダーとページ内の呼び出しが同じ取得を共有します。 */}
          <AuthSessionProvider>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </AuthSessionProvider>
        </SwrProvider>
      </body>
    </html>
  );
}
