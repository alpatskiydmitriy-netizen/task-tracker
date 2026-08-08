import { COLOR_CLASSES } from "@/lib/constants";

export function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${COLOR_CLASSES[color] ?? ""}`}
    >
      {label}
    </span>
  );
}
