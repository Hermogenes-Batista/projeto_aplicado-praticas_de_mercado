import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry/ThemeRegistry";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Projeto Aplicado - Next.js + Django + MySQL (Material UI)",
  description: "Modelo MUI: painel, login e integração com Django e JWT",
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
