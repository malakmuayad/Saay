import { t } from "i18next";
import { useEffect, useState } from "react";
import ComponentCard from "~/components/ui/cards/ComponentCard";
import Button from "~/components/ui/button/Button";
import ChartTab, { type Option } from "~/components/ui/ChartTab";
import TasksTable from "~/components/ui/table/TasksTable";
import { useAuth } from "~/context/AuthContext";
import {
  deleteTask,
  getUserTasksForWeek,
  getUserTasksToday,
  getUserTasksTomorrow,
  markTaskAsCompleted,
} from "~/services/api/tasks";
import type { TaskDto } from "~/types/tasks/TaskDto";
import { AddTaskModal } from "~/components/tasks/AddTaskModal";
import WeeklyCalendar from "~/components/ui/calendar/WeeklyCaledar";
import TasksByPrayers from "~/components/tasks/TasksByPrayers";

export const meta = () => [{ title: t("routes.tasks") }];

type Title = "tasks.today" | "tasks.tomorrow" | "tasks.thisWeek";

export default function Tasks() {
  const currentUserId = useAuth()?.currentUserId;

  const [title, setTitle] = useState<Title>("tasks.today");
  const [tasks, setTasks] = useState<TaskDto[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [dueDate, setDueDate] = useState<string>(formatDate(new Date()));
  const [selectedOption, setSelectedOption] = useState<Option>("optionOne");

  const [filterByPrayerTimes, setFilterByPrayerTimes] = useState(false);
  const [latitude, setLatitude] = useState("");
  const [longtitude, setLongtitude] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [prayerLocationError, setPrayerLocationError] = useState<string | null>(
    null,
  );

  const completedTasksCount = tasks?.filter((task) => task.isDone).length ?? 0;

  const totalTasksCount = tasks?.length ?? 0;

  function formatDate(date: Date): string {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }

  async function loadTasks(option: Option = selectedOption) {
    if (currentUserId == null) return;

    setSelectedOption(option);

    if (option !== "optionOne") {
      setFilterByPrayerTimes(false);
      setPrayerLocationError(null);
      setIsGettingLocation(false);
    }

    switch (option) {
      case "optionOne": {
        const today = new Date();

        setDueDate(formatDate(today));
        setTitle("tasks.today");

        const result = await getUserTasksToday(currentUserId);

        if (typeof result !== "string") {
          setTasks(result);
        }

        break;
      }

      case "optionTwo": {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        setDueDate(formatDate(tomorrow));
        setTitle("tasks.tomorrow");

        const result = await getUserTasksTomorrow(currentUserId);

        if (typeof result !== "string") {
          setTasks(result);
        }

        break;
      }

      case "optionThree": {
        const result = await getUserTasksForWeek(currentUserId);

        setTitle("tasks.thisWeek");

        if (typeof result !== "string") {
          setTasks(result);
        }

        break;
      }
    }
  }

  useEffect(() => {
    void loadTasks("optionOne");
  }, [currentUserId]);

  async function handleEdit(task: TaskDto) {
    if (currentUserId == null) return;

    const result = await markTaskAsCompleted(task.taskId);

    if (typeof result !== "string") {
      await loadTasks();
    }
  }

  async function handleDelete(taskId: number) {
    if (currentUserId == null) return;

    const result = await deleteTask(taskId);

    if (typeof result !== "string") {
      await loadTasks();
    }
  }

  function handleFilterByPrayerTimesClick() {
    if (filterByPrayerTimes) {
      setFilterByPrayerTimes(false);
      setPrayerLocationError(null);
      return;
    }

    if (!navigator.geolocation) {
      setPrayerLocationError("Your browser does not support location access.");
      return;
    }

    setIsGettingLocation(true);
    setPrayerLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toString());
        setLongtitude(position.coords.longitude.toString());
        setFilterByPrayerTimes(true);
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            setPrayerLocationError(
              "Location permission was denied. Please allow location access in your browser.",
            );
            break;

          case error.POSITION_UNAVAILABLE:
            setPrayerLocationError(
              "Your current location is unavailable. Please try again.",
            );
            break;

          case error.TIMEOUT:
            setPrayerLocationError(
              "Getting your location timed out. Please try again.",
            );
            break;

          default:
            setPrayerLocationError(
              "Unable to get your location. Please try again.",
            );
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    );
  }

  const isPrayerViewActive =
    selectedOption === "optionOne" && filterByPrayerTimes;

  return (
    <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-2 dark:border-gray-800 dark:bg-gray-900">
      <ComponentCard title={t("tasks.myTasks")}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {t("common.overview")}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("tasks.description")}
            </p>
          </div>

          {selectedOption !== "optionThree" && (
            <Button size="sm" onClick={() => setModalOpen(true)}>
              {t("tasks.addTask")}
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <ChartTab
            onOptionOneSelected={() => void loadTasks("optionOne")}
            onOptionTwoSelected={() => void loadTasks("optionTwo")}
            onOptionThreeSelected={() => void loadTasks("optionThree")}
          />
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:p-5 dark:border-gray-800 dark:bg-gray-900/30">
          <div className="flex flex-col gap-4">
            {/* Title and prayer-time toggle */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                  {t(title)}
                </h3>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {totalTasksCount === 0
                    ? t("tasks.noTasks")
                    : `${totalTasksCount} ${
                        totalTasksCount === 1
                          ? t("tasks.task")
                          : t("tasks.tasks")
                      }`}
                </p>
              </div>

              {/* Prayer-time toggle: Today only */}
              {selectedOption === "optionOne" && (
                <div className="flex w-fit max-w-full flex-col gap-2">
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-800">
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t("tasks.view")}
                    </span>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={filterByPrayerTimes}
                      aria-label="عرض حسب أوقات الصلوات"
                      aria-busy={isGettingLocation}
                      disabled={isGettingLocation}
                      onClick={handleFilterByPrayerTimesClick}
                      className={`flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-200 disabled:cursor-wait disabled:opacity-60 ${
                        filterByPrayerTimes
                          ? "justify-end bg-[#1a3a9a]"
                          : "justify-start bg-gray-300 dark:bg-gray-600"
                      }`}
                    >
                      <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                    </button>

                    {isGettingLocation && (
                      <span
                        className="text-xs text-gray-500 dark:text-gray-400"
                        role="status"
                      >
                        {t("tasks.locating")}
                      </span>
                    )}
                  </div>

                  {prayerLocationError && (
                    <p
                      role="alert"
                      className="max-w-xs text-sm text-red-600 dark:text-red-400"
                    >
                      {prayerLocationError}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Task status counts */}
            <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
              <span className="rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-600 dark:bg-green-500/10 dark:text-green-400">
                {completedTasksCount} {t("tasks.completed")}
              </span>

              <span className="rounded-full bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-300">
                {totalTasksCount - completedTasksCount} {t("tasks.pending")}
              </span>
            </div>
          </div>
        </div>

        {/* Tasks content */}
        {isPrayerViewActive ? (
          <TasksByPrayers
            latitude={latitude}
            longtitude={longtitude}
            onDelete={handleDelete}
          />
        ) : selectedOption !== "optionThree" ? (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <TasksTable
              tableData={tasks ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
              <WeeklyCalendar />
            </div>

            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              {t("tasks.calendarDescription")}
            </p>
          </div>
        )}

        {/* Add Task Modal */}
        <AddTaskModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onTaskAdded={() => void loadTasks()}
          dueDate={dueDate}
        />
      </ComponentCard>
    </div>
  );
}
