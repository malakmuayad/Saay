import { t } from "i18next";
import ComponentCard from "~/components/ui/cards/ComponentCard";
import Button from "~/components/ui/button/Button";
import { useEffect, useState } from "react";
import HabitCard from "~/components/ui/cards/HabitCard";
import type { HabitDto } from "~/types/habits/HabitDto";
import { useAuth } from "~/context/AuthContext";
import { deleteHabit, getUserHabits } from "~/services/api/habits";
import { DeleteModal } from "~/components/ui/modal/DeleteModal";
import { AddHabitModal } from "~/components/habits/AddHabitModal";

export const meta = () => [{ title: "Habits | Saay" }];

export default function Habits() {
  const currentUserId = useAuth()?.currentUserId;
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [habits, setHabits] = useState<HabitDto[] | null>(null);
  const [deleteError, setDeleteError] = useState<boolean | null>(null);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);

  const totalHabitsCount = habits?.length;

  async function loadUserHabits() {
    if (currentUserId === undefined || currentUserId === null) return;

    const result = await getUserHabits(currentUserId, 1, 100);

    if (typeof result !== "string") {
      setHabits(result);
    }
  }

  useEffect(() => {
    loadUserHabits();
  }, [currentUserId]);

  function handleDeleteClick(habitId: number) {
    setSelectedHabitId(habitId);
    setDeleteError(null);
    setDeleteModalOpen(true);
  }

  async function handleHabitDelete() {
    if (selectedHabitId === null) return;
    const result = await deleteHabit(selectedHabitId);

    if (typeof result === "string" || result === false) {
      setDeleteError(false);
      return;
    }
    if (result === true) {
      setDeleteError(true);
      await loadUserHabits();
    }
  }

  return (
    <div className="p-2 min-h-screen rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
      <ComponentCard title={t("habits.myHabits")}>
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              {t("common.overview")}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("habits.description")}
            </p>
          </div>

          <Button size="sm" onClick={() => setAddModalOpen(true)}>
            {t("habits.addHabit")}
          </Button>
        </div>

        {/* Summary */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {totalHabitsCount === 0
                  ? t("tasks.noTasks")
                  : `${totalHabitsCount} ${
                      totalHabitsCount === 1
                        ? t("tasks.task")
                        : t("tasks.tasks")
                    }`}
              </p>
            </div>
          </div>
        </div>
        {habits?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900/30">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 dark:bg-primary-500/10">
              <span className="text-2xl">🌱</span>
            </div>

            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              No habits yet
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400">
              Start building better routines by adding your first habit. You can
              track your progress and stay consistent over time.
            </p>

            <Button
              size="sm"
              className="mt-5"
              onClick={() => setAddModalOpen(true)}
            >
              Add your first habit
            </Button>
          </div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {habits?.map((habit) => (
              <HabitCard
                key={habit.habitId}
                habit={habit}
                onHabitDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}

        <AddHabitModal
          isOpen={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onHabitAdded={loadUserHabits}
        />

        <DeleteModal
          isOpen={deleteModalOpen}
          onCancel={() => setDeleteModalOpen(false)}
          onSave={handleHabitDelete}
          title="Are you sure you want to delete this habit?"
          description="This action cannot be undone."
          error={deleteError === false ? "Failed to delete habit" : null}
          success={deleteError === true}
          successMessage="Habit is deleted successfully!"
        />
      </ComponentCard>
    </div>
  );
}
