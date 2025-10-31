import type { Metadata } from "next";
import "./globals.css";
import { ModalProvider } from "../contexts/ModalContext";
import Modal from "../components/ui/Modal";

export const metadata: Metadata = {
  title: "Notas Claras",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <ModalProvider>
          {children}
          <Modal />
        </ModalProvider>
      </body>
    </html>
  );
}
