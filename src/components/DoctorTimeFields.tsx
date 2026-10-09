import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTimeClock } from "@/lib/formatTime";

interface DoctorTimeFieldsProps {
  start: string;
  end: string;
  modified: boolean;
  onStartChange: (value: string) => void;
  onEndChange: (value: string) => void;
  onReset: () => void;
}

interface NativeTimeFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * Mobile Safari gives a visible type=time input an intrinsic width wider than
 * its CSS grid track. Render the selected time in our own bounded field, then
 * place the real native input over it for iOS/Android picker interaction.
 */
function NativeTimeField({ label, value, onChange }: NativeTimeFieldProps) {
  return (
    <label className="block w-full min-w-0 max-w-full">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <span className="relative flex h-11 w-full min-w-0 max-w-full items-center overflow-hidden rounded-xl border border-input bg-transparent px-3 shadow-sm focus-within:ring-2 focus-within:ring-ring">
        <span aria-hidden="true" className="block w-full min-w-0 truncate text-base font-medium text-foreground">
          {formatTimeClock(value) || "Select time"}
        </span>
        <input
          type="time"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 z-10 block h-full w-full max-w-full min-w-0 cursor-pointer border-0 p-0 opacity-0 [min-inline-size:0]"
          style={{ WebkitAppearance: "none", appearance: "none" }}
        />
      </span>
    </label>
  );
}

/** Keep iOS time controls inside each card, preserving the native picker. */
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
      className="mt-2 grid w-full min-w-0 max-w-full grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end"
    >
      <NativeTimeField label="Start time" value={start} onChange={onStartChange} />
      <NativeTimeField label="End time" value={end} onChange={onEndChange} />
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
