import { useAuth } from "~/context/AuthContext";
import { useEffect, useState } from "react";
import type { TasksByPrayerDto } from "~/types/tasks/TasksByPrayerDto";
import { getTasksByPrayers } from "~/services/api/tasks";
import PrayerCard from "../ui/cards/PrayerCard";
import { t } from "i18next";

type TasksByPrayersProps = {
  latitude: string;
  longtitude: string;
  onDelete: (taskId: number) => void;
};

export default function TasksByPrayers({
  latitude,
  longtitude,
  onDelete,
}: TasksByPrayersProps) {
  const currentUserId = useAuth()?.currentUserId;

  const [tasksByPrayersData, setTasksByPrayersData] =
    useState<TasksByPrayerDto | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadTasksByPrayers() {
      if (currentUserId == null || !latitude || !longtitude) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getTasksByPrayers(
          currentUserId,
          latitude,
          longtitude,
        );

        if (ignore) return;

        if (typeof response === "string") {
          setError(response);
          return;
        }

        setTasksByPrayersData(response);
        console.log(response);
      } catch {
        if (!ignore) {
          setError("Failed to load tasks by prayer times.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    void loadTasksByPrayers();

    return () => {
      ignore = true;
    };
  }, [currentUserId, latitude, longtitude]);

  if (isLoading) {
    return (
      <div className="py-8 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-theme-sm text-red-500">{error}</div>
    );
  }

  if (!tasksByPrayersData) {
    return (
      <div className="py-8 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {t("tasks.noTasksDescription")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <PrayerCard
        title={t("tasks.prayers.fajr")}
        time={tasksByPrayersData.prayerTimes[0]}
        statNum={tasksByPrayersData.fajrTasks.length}
        tasks={tasksByPrayersData.fajrTasks}
        onDelete={onDelete}
      />

      <PrayerCard
        title={t("tasks.prayers.dhuha")}
        time={tasksByPrayersData.prayerTimes[1]}
        statNum={tasksByPrayersData.dhuhaTasks.length}
        tasks={tasksByPrayersData.dhuhaTasks}
        onDelete={onDelete}
      />

      <PrayerCard
        title={t("tasks.prayers.dhuhr")}
        time={tasksByPrayersData.prayerTimes[2]}
        statNum={tasksByPrayersData.dhuhrTasks.length}
        tasks={tasksByPrayersData.dhuhrTasks}
        onDelete={onDelete}
      />

      <PrayerCard
        title={t("tasks.prayers.asr")}
        time={tasksByPrayersData.prayerTimes[3]}
        statNum={tasksByPrayersData.asrTasks.length}
        tasks={tasksByPrayersData.asrTasks}
        onDelete={onDelete}
      />

      <PrayerCard
        title={t("tasks.prayers.maghrib")}
        time={tasksByPrayersData.prayerTimes[4]}
        statNum={tasksByPrayersData.maghribTasks.length}
        tasks={tasksByPrayersData.maghribTasks}
        onDelete={onDelete}
      />

      <PrayerCard
        title={t("tasks.prayers.isha")}
        time={tasksByPrayersData.prayerTimes[5]}
        statNum={tasksByPrayersData.ishaTasks.length}
        tasks={tasksByPrayersData.ishaTasks}
        onDelete={onDelete}
      />
      <PrayerCard
        title={t("tasks.tasksWithoutPrayers")}
        time=""
        statNum={tasksByPrayersData.tasksWithoutPrayers.length}
        tasks={tasksByPrayersData.tasksWithoutPrayers}
        onDelete={onDelete}
        className="md:col-span-2"
      />
    </div>
  );
}
