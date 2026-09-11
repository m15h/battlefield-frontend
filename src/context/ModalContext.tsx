import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { Modal } from "@/components/common/Modal";

type ModalKind = "confirm" | "alert";

interface ActiveModal {
  kind: ModalKind;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

interface AlertOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
}

interface ModalContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<ActiveModal | null>(null);
  const resolverRef = useRef<((value: boolean | void) => void) | null>(null);

  const settle = useCallback((value: boolean | void) => {
    const resolver = resolverRef.current;
    resolverRef.current = null;
    setActive(null);
    if (resolver) resolver(value);
  }, []);

  const openModal = useCallback(
    (modal: ActiveModal): Promise<boolean | void> => {
      setActive(modal);
      return new Promise<boolean | void>((resolve) => {
        resolverRef.current = resolve;
      });
    },
    []
  );

  const confirm = useCallback(
    async (options: ConfirmOptions): Promise<boolean> => {
      const result = await openModal({
        kind: "confirm",
        title: options.title ?? "Please confirm",
        message: options.message,
        confirmLabel: options.confirmLabel,
        cancelLabel: options.cancelLabel,
      });
      return result === true;
    },
    [openModal]
  );

  const alert = useCallback(
    async (options: AlertOptions): Promise<void> => {
      await openModal({
        kind: "alert",
        title: options.title ?? "Notice",
        message: options.message,
        confirmLabel: options.confirmLabel,
      });
    },
    [openModal]
  );

  const value = useMemo<ModalContextValue>(
    () => ({ confirm, alert }),
    [confirm, alert]
  );

  const renderFooter = () => {
    if (!active) return null;
    if (active.kind === "confirm") {
      return (
        <>
          <button
            type="button"
            className="bf-btn--ghost"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => settle(false)}
          >
            {active.cancelLabel ?? "Cancel"}
          </button>
          <button
            type="button"
            className="bf-btn--primary"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => settle(true)}
          >
            {active.confirmLabel ?? "Confirm"}
          </button>
        </>
      );
    }
    return (
      <button
        type="button"
        className="bf-btn--primary"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => settle()}
      >
        {active.confirmLabel ?? "OK"}
      </button>
    );
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
      <Modal
        open={active !== null}
        title={active?.title ?? ""}
        onClose={() => settle(active?.kind === "confirm" ? false : undefined)}
        footer={renderFooter()}
      >
        {active && <p className="bf-modal__message">{active.message}</p>}
      </Modal>
    </ModalContext.Provider>
  );
}

export function useModal(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return ctx;
}
