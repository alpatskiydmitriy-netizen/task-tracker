export const STATUSES = [
  { value: "not_started", label: "Не в работе", color: "red" },
  { value: "in_progress", label: "В работе", color: "yellow" },
  { value: "waiting", label: "В ожидании", color: "blue" },
  { value: "done", label: "Готово", color: "green" },
  { value: "cancelled", label: "Отмена", color: "gray" },
] as const;

export const LEVELS = [
  { value: "high", label: "High", color: "red" },
  { value: "mid", label: "Mid", color: "yellow" },
  { value: "low", label: "Low", color: "green" },
] as const;

export type StatusValue = (typeof STATUSES)[number]["value"];
export type LevelValue = (typeof LEVELS)[number]["value"];

export function statusInfo(value: string) {
  return STATUSES.find((s) => s.value === value) ?? STATUSES[0];
}

export function levelInfo(value: string) {
  return LEVELS.find((l) => l.value === value) ?? LEVELS[1];
}

// Tailwind-классы для цветовых бейджей (light bg + dark text, читаемо)
export const COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-100 text-red-800 border border-red-300",
  yellow: "bg-yellow-100 text-yellow-800 border border-yellow-300",
  green: "bg-green-100 text-green-800 border border-green-300",
  blue: "bg-blue-100 text-blue-800 border border-blue-300",
  gray: "bg-gray-100 text-gray-800 border border-gray-300",
};
