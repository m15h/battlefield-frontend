import { useEffect } from "react";
import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  title: string;
  children?: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export function Modal({
  open,
  title,
  children,
  footer,
  onClose,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="bf-modal__backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bf-modal"
      >
        <div className="bf-modal__header">
          <h3 className="bf-modal__title">{title}</h3>
        </div>
        {children && <div className="bf-modal__body">{children}</div>}
        {footer && <div className="bf-modal__footer">{footer}</div>}
      </div>
    </div>
  );
}
