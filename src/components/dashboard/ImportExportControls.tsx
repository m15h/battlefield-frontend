import { useRef } from "react";
import { useExportAppState, useImportAppState } from "@/hooks/useTemplates";
import { useModal } from "@/context/ModalContext";

function downloadJson(jsonString: string, filename: string) {
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface ImportExportControlsProps {
  onImported: () => void;
}

export function ImportExportControls({ onImported }: ImportExportControlsProps) {
  const { export: doExport } = useExportAppState();
  const { alert } = useModal();
  const fileRef = useRef<HTMLInputElement>(null);

  const importApp = useImportAppState({
    onSuccess: () => {
      onImported();
    },
    onError: (err: unknown) => {
      void alert({
        title: "Import failed",
        message:
          err instanceof Error ? err.message : "Invalid state file.",
      });
    },
  });

  const handleExport = () => {
    const json = doExport();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(json, `battlefield-backup-${stamp}.json`);
  };

  const handleImportFile = async (file: File) => {
    const text = await file.text();
    importApp.mutate(text);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImportFile(file).catch(() => {
        void alert({
          title: "Import failed",
          message: "Could not read the selected file.",
        });
      });
    }
    e.target.value = "";
  };

  return (
    <div className="bf-impexp">
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        onChange={onFileChange}
        hidden
      />
      <button
        type="button"
        className="bf-btn--ghost"
        onClick={() => fileRef.current?.click()}
      >
        Import state (JSON)
      </button>
      <button type="button" className="bf-btn--ghost" onClick={handleExport}>
        Export state (JSON)
      </button>
    </div>
  );
}
