"use client";
import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { useUIStore } from "@/store/uiStore";

export function GlobalModal() {
  const { modalIsOpen, modalContent, modalTitle, closeModal } = useUIStore();

  return (
    <AnimatePresence>
      {modalIsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={closeModal}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-card text-card-foreground border border-border shadow-lg rounded-xl w-full max-w-lg mx-4 overflow-hidden z-10 flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold font-headline">
                {modalTitle}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">{modalContent}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
