import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ModalProvider } from "../contexts/ModalContext";
import { ThemeProvider } from "../contexts/ThemeContext";
import Modal from "../components/ui/Modal";
import OfflineIndicator from "../components/ui/OfflineIndicator";

export const metadata: Metadata = {
  title: "Notas Claras",
  description: "Aplicación para estudiantes venezolanos - Gestiona tus tareas, exámenes y horarios académicos",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Notas Claras",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Notas Claras",
    title: "Notas Claras",
    description: "Aplicación para estudiantes venezolanos - Gestiona tus tareas, exámenes y horarios académicos",
  },
  twitter: {
    card: "summary",
    title: "Notas Claras",
    description: "Aplicación para estudiantes venezolanos - Gestiona tus tareas, exámenes y horarios académicos",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3B82F6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <ModalProvider>
            {children}
            <Modal />
            <OfflineIndicator />
          </ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
