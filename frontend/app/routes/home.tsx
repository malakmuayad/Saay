import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import TodayTasksProgress from "~/components/dashboard/TodayTasksProgress";
import ComponentCard from "~/components/ui/cards/ComponentCard";
import MissionCard from "~/components/ui/cards/MissionCard";
import TasksTable from "~/components/ui/table/TasksTable";
import { useAuth } from "~/context/AuthContext";
import { getDashboardNumbers } from "~/services/api/dashboard";
import type { DashboardNumbersDto } from "~/types/dashboard/DashboardNumbersDto";

export const meta = () => [{ title: "Home | Saay" }];

export default function Home() {
  const currentUserId = useAuth()?.currentUserId;
  const { t } = useTranslation();

  const [dashboardNumbers, setDashboardNumbers] =
    useState<DashboardNumbersDto | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadUserDashboardNumbers() {
      if (currentUserId === null || currentUserId === undefined) return;

      const result = await getDashboardNumbers(currentUserId);

      if (!ignore && typeof result !== "string") {
        setDashboardNumbers(result);
      }
    }

    loadUserDashboardNumbers();

    return () => {
      ignore = true;
    };
  }, [currentUserId]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950">
      <div className="mx-auto w-full max-w-7xl">
        <ComponentCard title={t("dashboard.title")}>
          <div className="space-y-6">
            {/* Mission */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
                {t("goals.myMission")}
              </h2>

              <MissionCard
                userId={currentUserId ?? 0}
                readOnly={true}
                initialMission={dashboardNumbers?.mission ?? ""}
                onMissionUpdated={() => {}}
              />
            </section>

            {/* Today's Progress */}
            <section>
              <h2 className="mb-3 text-lg font-semibold text-gray-800 dark:text-white">
                {t("dashboard.todayProgress")}
              </h2>

              <TodayTasksProgress
                progress={dashboardNumbers?.todayProgress ?? 0}
                tasksCount={dashboardNumbers?.todayTasksCount ?? 0}
                completedTasksCount={
                  dashboardNumbers?.todayCompletedTasksCount ?? 0
                }
                urgentTasksCount={dashboardNumbers?.todayUrgentTasksCount ?? 0}
              />
            </section>

            {/* Today's Tasks */}
            <section>
              <h2 className="mb-1.5 text-lg font-semibold text-gray-800 dark:text-white">
                {t("dashboard.todayTasks")}
              </h2>

              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <TasksTable
                  tableData={dashboardNumbers?.todayMainTasks ?? []}
                  readOnly={true}
                />
              </div>
            </section>
          </div>
        </ComponentCard>
      </div>
    </div>
  );
}
