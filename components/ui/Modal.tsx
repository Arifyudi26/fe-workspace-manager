"use client";

import { ReactNode } from "react";

type ModalProps = {
  isOpen: boolean;
  title?: string;
  children?: ReactNode;
  primaryLabel?: string;
  secondaryLabel?: string;
  onClose: () => void;
  onConfirm?: () => void;
};

export function Modal({
  isOpen,
  title,
  children,
  primaryLabel = "OK",
  secondaryLabel,
  onClose,
  onConfirm,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg">
        <div className="p-4">
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>

        <div className="p-4">{children}</div>

        <div className="p-4 flex justify-end gap-2">
          {secondaryLabel && (
            <button
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
              onClick={onClose}
            >
              {secondaryLabel}
            </button>
          )}

          <button
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            onClick={() => {
              if (onConfirm) onConfirm();
              else onClose();
            }}
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Modal;
