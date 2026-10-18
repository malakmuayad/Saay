import { t } from "i18next";
import ComponentCard from "~/components/ui/cards/ComponentCard";
import Button from "~/components/ui/button/Button";
import ChartTab, { type Option } from "~/components/ui/ChartTab";
import TasksTable from "~/components/ui/table/TasksTable";
import { useEffect, useState } from "react";
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

export const meta = () => [{ title: "Tasks | Saay" }];

type Title = "tasks.today" | "tasks.tomorrow" | "tasks.thisWeek";

export default function Tasks() {
  const currentUserId = useAuth()?.currentUserId;

  const [title, setTitle] = useState<Title>("tasks.today");
  const [tasks, setTasks] = useState<TaskDto[] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [dueDate, setDueDate] = useState<string>(formatDate(new Date()));

  const [selectedOption, setSelectedOption] = useState<Option>("optionOne");

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
    if (currentUserId === null || currentUserId === undefined) return;

    setSelectedOption(option);

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
    loadTasks("optionOne");
  }, [currentUserId]);

  async function handleEdit(task: TaskDto) {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await markTaskAsCompleted(task.taskId);

    if (typeof result !== "string") {
      loadTasks();
    }
  }

  async function handleDelete(taskId: number) {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await deleteTask(taskId);

    if (typeof result !== "string") {
      loadTasks();
    }
  }

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
            onOptionOneSelected={() => loadTasks("optionOne")}
            onOptionTwoSelected={() => loadTasks("optionTwo")}
            onOptionThreeSelected={() => loadTasks("optionThree")}
          />
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                {t(title)}
              </h3>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalTasksCount === 0
                  ? t("tasks.noTasks")
                  : `${totalTasksCount} ${
                      totalTasksCount === 1 ? t("tasks.task") : t("tasks.tasks")
                    }`}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-full bg-green-50 px-3 py-1 font-medium text-green-600 dark:bg-green-500/10 dark:text-green-400">
                {completedTasksCount} {t("tasks.completed")}
              </span>

              <span className="rounded-full bg-yellow-50 px-3 py-1 font-medium text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-300">
                {totalTasksCount - completedTasksCount} {t("tasks.pending")}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedOption !== "optionThree" && (
          <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
            <TasksTable
              tableData={tasks ?? []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        )}

        {selectedOption === "optionThree" && (
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
          onTaskAdded={loadTasks}
          dueDate={dueDate}
        />
      </ComponentCard>
    </div>
  );
}
