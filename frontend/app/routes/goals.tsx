import Card from "../components/ui/cards/Card";
import { DoneIcon, PendingIcon, TotalIcon } from "~/assets/icons";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "~/context/AuthContext";
import {
  deleteGoal,
  getCompletedGoalsCount,
  getPendingGoalsCount,
  getUserGoals,
} from "~/services/api/goals";
import { getUserMission } from "~/services/api/users";
import type { Goal } from "~/types/goals/Goal";
import GoalsTable from "~/components/ui/table/GoalsTable";
import ComponentCard from "~/components/ui/cards/ComponentCard";
import Button from "~/components/ui/button/Button";
import { AddEditGoalModal } from "~/components/goals/Modals/AddEditGoalModal";
import MissionCard from "~/components/ui/cards/MissionCard";
import { PaginationRow } from "~/components/ui/PaginationRow";
import { DeleteModal } from "~/components/ui/modal/DeleteModal";
import { t } from "i18next";

export const meta = () => [{ title: t("routes.goals") }];

export default function Goals() {
  const currentUserId = useAuth()?.currentUserId;

  const { t } = useTranslation();

  const [completedGoalsCount, setCompletedGoalsCount] = useState<number | null>(
    null,
  );
  const [pendingGoalsCount, setPendingGoalsCount] = useState<number | null>(
    null,
  );
  const [mission, setMission] = useState<string | null>();
  const [goals, setGoals] = useState<Goal[] | null>(null);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null); // Used for AddEditGoalModal
  const [deleteResult, setDeleteResult] = useState<boolean | null>(null);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null); // Used for DeleteGoalModal
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalGoals = (completedGoalsCount ?? 0) + (pendingGoalsCount ?? 0);

  async function loadCompletedGoalsCount() {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await getCompletedGoalsCount(currentUserId);

    if (typeof result !== "string") {
      setCompletedGoalsCount(result);
    }
  }
  useEffect(() => {
    loadCompletedGoalsCount();
  }, [currentUserId]);

  async function loadPendingGoalsCount() {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await getPendingGoalsCount(currentUserId);

    if (typeof result !== "string") {
      setPendingGoalsCount(result);
    }
  }

  useEffect(() => {
    loadPendingGoalsCount();
  }, [currentUserId]);

  async function loadUserMission() {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await getUserMission(currentUserId);

    setMission(result);
  }

  useEffect(() => {
    loadUserMission();
  }, [currentUserId]);

  async function loadUserGoals() {
    if (currentUserId === null || currentUserId === undefined) return;

    const result = await getUserGoals(currentUserId, currentPage);

    if (typeof result !== "string") {
      setGoals(result);
    }
  }

  function handleAdd() {
    setSelectedGoal(null);
    setGoalModalOpen(true);
  }

  function handleEdit(goal: Goal) {
    setSelectedGoal(goal);
    setGoalModalOpen(true);
  }

  function handleCloseModal() {
    setGoalModalOpen(false);
    setSelectedGoal(null);
  }

  function handleDeleteClick(goalId: number) {
    setSelectedGoalId(goalId);
    setDeleteResult(null);
    setOpenDeleteModal(true);
  }

  async function loadGoalData() {
    await Promise.all([
      loadUserGoals(),
      loadCompletedGoalsCount(),
      loadPendingGoalsCount(),
    ]);
  }

  async function handleDeleteGoal() {
    if (selectedGoalId === null) return;

    const response = await deleteGoal(selectedGoalId);

    if (typeof response === "string" || response === false) {
      setDeleteResult(false);
      return;
    }

    if (response === true) {
      setDeleteResult(true);
      await loadGoalData();
    }
  }

  useEffect(() => {
    loadUserGoals();
  }, [currentUserId, currentPage]);

  const to = totalGoals < currentPage * 10 ? totalGoals : currentPage * 10;
  const from = currentPage === 1 ? 1 : (currentPage - 1) * 11;

  return (
    <div>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white p-2 xl:py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto w-full ">
          <ComponentCard title={t("goals.myGoals")}>
            <div className="flex justify-between">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                {t("common.overview")}
              </h3>

              <Button size="sm" onClick={handleAdd}>
                {t("goals.addGoal")}
              </Button>
            </div>

            <div className="grid grid-cols-3 grid-rows-2 gap-2">
              <MissionCard
                userId={currentUserId ?? 0}
                initialMission={mission || ""}
                cardClassName="col-span-3"
                onMissionUpdated={loadUserMission}
              />

              <Card
                title={t("goals.total")}
                statNum={totalGoals}
                Icon={TotalIcon}
              />

              <Card
                title={t("goals.completed")}
                statNum={completedGoalsCount ?? 0}
                Icon={DoneIcon}
              />

              <Card
                title={t("goals.pending")}
                statNum={pendingGoalsCount ?? 0}
                Icon={PendingIcon}
              />
            </div>

            <GoalsTable
              tableData={goals ?? []}
              headers={[
                t("goals.headers.title"),
                t("goals.headers.category"),
                t("goals.headers.timeFrame"),
                t("goals.headers.deadline"),
                t("goals.headers.status"),
                t("goals.headers.actions.title"),
              ]}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
            />
            <PaginationRow
              from={from}
              to={to}
              total={totalGoals}
              onPreviousClick={() => setCurrentPage(currentPage - 1)}
              onNextClick={() => setCurrentPage(currentPage + 1)}
            />
          </ComponentCard>

          <AddEditGoalModal
            isOpen={goalModalOpen}
            onClose={handleCloseModal}
            onGoalChanged={loadGoalData}
            goal={selectedGoal}
          />
          <DeleteModal
            isOpen={openDeleteModal}
            onCancel={() => {
              setOpenDeleteModal(false);
              setSelectedGoalId(null);
            }}
            onSave={handleDeleteGoal}
            title="Are you sure you want to delete this goal?"
            description="This action cannot be undone."
            error={deleteResult === false ? "Failed to delete goal" : null}
            success={deleteResult === true}
            successMessage="Goal is deleted successfully"
          />
        </div>
      </div>
    </div>
  );
}
