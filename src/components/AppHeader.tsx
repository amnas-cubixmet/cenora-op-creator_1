import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/pwa/useInstallPrompt";

export function AppHeader() {
  const install = useInstallPrompt();

  return (
    <header className="sticky top-0 z-20 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <img src="/assets/logo-mark.png" alt="Cenora" className="h-9 w-9 shrink-0 object-contain" />
        <div className="min-w-0 flex-1 leading-tight">
          <div className="font-ml text-lg font-bold text-brand-gradient">ഓ.പി പോസ്റ്റർ</div>
          <div className="truncate text-xs text-muted-foreground">Cenora OP Poster Creator</div>
        </div>
        {install ? (
          <Button type="button" size="sm" className="shrink-0" onClick={() => void install()}>
            <Download />
            Install
          </Button>
        ) : null}
      </div>
    </header>
  );
}
