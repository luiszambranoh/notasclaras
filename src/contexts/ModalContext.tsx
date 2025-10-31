"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ModalContextType {
  isOpen: boolean;
  content: ReactNode | null;
  title: string;
  size: "sm" | "md" | "lg" | "xl";
  openModal: (content: ReactNode, title?: string, size?: "sm" | "md" | "lg" | "xl") => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState<ReactNode | null>(null);
  const [title, setTitle] = useState("");
  const [size, setSize] = useState<"sm" | "md" | "lg" | "xl">("md");

  const openModal = (modalContent: ReactNode, modalTitle = "", modalSize = "md" as "sm" | "md" | "lg" | "xl") => {
    setContent(modalContent);
    setTitle(modalTitle);
    setSize(modalSize);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setContent(null);
    setTitle("");
    setSize("md");
  };

  return (
    <ModalContext.Provider value={{ isOpen, content, title, size, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}