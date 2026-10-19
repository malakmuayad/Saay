import { t } from "i18next";
import type { HabitLogDto } from "~/types/habits/HabitLogDto";

type HabitTrackingProps = {
  logs: HabitLogDto[];
  targetDuration: number;
};

export default function HabitTracking({
  logs,
  targetDuration,
}: HabitTrackingProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: targetDuration }, (_, index) => {
          const dayNumber = index + 1;

          const log = logs.find((log) => log.dayNumber === dayNumber);

          return (
            <div
              key={dayNumber}
              title={t("habits.tracking.day", { count: dayNumber })}
              className={`h-3 w-3 rounded-sm ${
                log?.isDone ? "bg-brand-500" : "bg-gray-300 dark:bg-gray-600"
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
