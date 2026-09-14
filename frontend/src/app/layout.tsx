import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Projeto Aplicado - Next.js + Django + MySQL (Material UI)",
  description: "MUI Free Templates: Dashboard, Sign-in e Sign-in Side com integração Django e JWT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
