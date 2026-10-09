import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DoctorTimeFieldsProps {
  start: string;
  end: string;
  modified: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onReset: () => void;
}

/** Keep iOS native time pickers within the card on narrow mobile screens. */
export function DoctorTimeFields({
  start,
  end,
  modified,
  onStartChange,
  onEndChange,
  onReset,
}: DoctorTimeFieldsProps) {
  return (
    <div
      data-doctor-time-fields
      className="mt-2 grid w-full min-w-0 grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
    >
      <label className="block min-w-0 max-w-full">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">Start time</span>
        <Input
          type="time"
          aria-label="Start time"
          value={start}
          onChange={(event) => onStartChange(event.target.value)}
          className="h-10 w-full min-w-0 max-w-full [min-inline-size:0]"
        />
      </label>
      <label className="block min-w-0 max-w-full">
        <span className="mb-1 block text-xs font-medium text-muted-foreground">End time</span>
        <Input
          type="time"
          aria-label="End time"
          value={end}
          onChange={(event) => onEndChange(event.target.value)}
          className="h-10 w-full min-w-0 max-w-full [min-inline-size:0]"
        />
      </label>
      {modified && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          aria-label="Reset time"
          className="h-10 w-full min-w-0 gap-2 sm:w-10 sm:shrink-0 sm:px-0"
          onClick={onReset}
        >
          <RotateCcw className="h-4 w-4" />
          <span className="sm:hidden">Reset times</span>
        </Button>
      )}
    </div>
  );
}
