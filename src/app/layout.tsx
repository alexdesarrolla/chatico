import type { Metadata } from "next";
import { Noto_Sans_JP, Orbitron, Comic_Neue } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { initializeTheme } from "@/lib/theme-init";

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const comicNeue = Comic_Neue({
  variable: "--font-comic-neue",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Chatico - Chat IA con GLM-4.5-Flash",
  description: "Chatico - Chat de IA con modelo GLM-4.5-Flash de Z.ai con streaming, temas claro/oscuro e historial de conversación",
  keywords: ["Chatico", "Z.ai", "GLM-4.5-Flash", "Chat IA", "Inteligencia Artificial", "Next.js", "TypeScript"],
  authors: [{ name: "Chatico Team" }],
  openGraph: {
    title: "Chatico - Chat IA con GLM-4.5-Flash",
    description: "Chatico - Chat de IA con modelo GLM-4.5-Flash de Z.ai con streaming y temas",
    url: "https://chatico.z.ai",
    siteName: "Chatico",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chatico - Chat IA con GLM-4.5-Flash",
    description: "Chatico - Chat de IA con modelo GLM-4.5-Flash de Z.ai",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${orbitron.variable} ${notoSansJP.variable} ${comicNeue.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if (typeof window !== 'undefined') {
                  ${initializeTheme.toString()}
                  initializeTheme();
                }
              `,
            }}
          />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
