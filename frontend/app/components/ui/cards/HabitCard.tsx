import { DeleteIcon } from "~/assets/icons";
import Button from "../button/Button";
import HabitTracking from "~/components/habits/HabitTracking";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { HabitLogDto } from "~/types/habits/HabitLogDto";
import { getHabitLogs, markHabitAsCompleted } from "~/services/api/habits";
import Alert from "../Alert";
import type { HabitDto } from "~/types/habits/HabitDto";

type HabitCardProps = {
  habit: HabitDto;
  onHabitDelete: (habitId: number) => void;
};

export default function HabitCard({ habit, onHabitDelete }: HabitCardProps) {
  const { t } = useTranslation();
  const [habitLogs, setHabitLogs] = useState<HabitLogDto[] | null>();
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let ignore = false;

    async function loadHabitLogs() {
      const response = await getHabitLogs(habit.habitId);

      if (!ignore && typeof response !== "string") {
        setHabitLogs(response);
      }
    }

    loadHabitLogs();

    return () => {
      ignore = true;
    };
  }, [habit.habitId]);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [error]);

  async function handleButtonClick() {
    const response = await markHabitAsCompleted(habit.habitId, passedDays);

    if (typeof response === "string") {
      setError(true);
      return;
    }

    const logsResponse = await getHabitLogs(habit.habitId);

    if (typeof logsResponse !== "string") {
      setHabitLogs(logsResponse);
    }

    setError(false);
  }

  function getTargetDuration(targetDuration: number): number {
    switch (targetDuration) {
      case 0:
        return 30;
      case 1:
        return 60;
      case 2:
        return 90;
      default:
        return 30;
    }
  }

  function getPassedDays(startDate: string): number {
    const [year, month, day] = startDate.split("-").map(Number);

    const start = new Date(year, month - 1, day);
    start.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const difference = today.getTime() - start.getTime();

    return Math.floor(difference / (1000 * 60 * 60 * 24)) + 1;
  }

  const targetDuration = getTargetDuration(habit.targetDuration);
  const passedDays = getPassedDays(habit.habitStartDate);

  const completedDays = habitLogs?.filter((log) => log.isDone).length ?? 0;

  const progress = Math.min((completedDays / targetDuration) * 100, 100);

  const isFinished = completedDays >= targetDuration;

  return (
    <div className="relative rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Error */}
      {error && (
        <div className="mb-4">
          <Alert
            variant="warning"
            title={t("habits.card.completedTodayError")}
            message=""
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {habit.title}
          </h3>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {habit.reasonForHabit}
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onHabitDelete(habit.habitId)}
        >
          <DeleteIcon />
        </Button>
      </div>

      {/* Progress */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t("habits.card.progress")}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t("habits.card.dayOf", {
                day: passedDays,
                targetDuration,
              })}
            </p>
          </div>

          <span className="text-sm font-semibold text-gray-800 dark:text-white/90">
            {completedDays}/{targetDuration}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-brand-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="mt-5 rounded-lg bg-gray-50 p-3 dark:bg-gray-900/40">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {t("habits.card.steps")}
        </p>

        <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
          {habit.steps}
        </p>
      </div>

      {/* Tracking */}
      <div className="mt-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t("habits.card.dailyTracking")}
          </p>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t("habits.card.completed", { count: completedDays })}
          </p>
        </div>

        <HabitTracking logs={habitLogs ?? []} targetDuration={targetDuration} />
      </div>

      {/* Action */}
      <div className="mt-5">
        <Button
          size="sm"
          variant="primary"
          className="w-full"
          onClick={handleButtonClick}
          disabled={isFinished}
        >
          {isFinished
            ? t("habits.card.completedStatus")
            : t("habits.card.logProgress")}
        </Button>
      </div>
    </div>
  );
}
