import { format, parseISO } from "date-fns";

interface ResponsiveDateFieldProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * iOS date controls keep a large intrinsic inline size, even inside a 1fr grid.
 * Render the date in a clipped, fixed-width field while the transparent native
 * input remains tappable and opens the device's date picker.
 */
export function ResponsiveDateField({ value, onChange }: ResponsiveDateFieldProps) {
  const label = value ? format(parseISO(value), "dd MMM yyyy") : "Choose date";

  return (
    <div
      data-poster-date-field
      className="relative grid h-10 w-full min-w-0 max-w-full place-items-center overflow-hidden rounded-xl border border-input bg-card shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-ring sm:h-11"
    >
      <span aria-hidden="true" className="w-full min-w-0 truncate px-2 text-center text-base font-medium text-foreground sm:text-lg">
        {label}
      </span>
      <input
        type="date"
        aria-label="Choose poster date"
        value={value}
        onChange={(event) => {
          if (event.target.value) onChange(event.target.value);
        }}
        className="absolute inset-0 block h-full w-full max-w-full min-w-0 cursor-pointer appearance-none opacity-0 [min-inline-size:0]"
      />
    </div>
  );
}
