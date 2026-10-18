import type { ApexOptions } from "apexcharts";
import ReactApexChart from "react-apexcharts";
import { useTranslation } from "react-i18next";

type TodayTaskProgressProps = {
  progress: number;
  tasksCount: number;
  completedTasksCount: number;
  urgentTasksCount: number;
};

export default function TodayTasksProgress({
  progress,
  tasksCount,
  completedTasksCount,
  urgentTasksCount,
}: TodayTaskProgressProps) {
  const { t } = useTranslation();

  const series = [progress];

  const options: ApexOptions = {
    colors: ["#1a3a9a"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: "80%",
        },
        track: {
          background: "#E4E7EC",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: {
            show: false,
          },
          value: {
            fontSize: "36px",
            fontWeight: "600",
            offsetY: -35,
            color: "#1a3a9a",
            formatter: function (val) {
              return val + "%";
            },
          },
        },
      },
    },
    fill: {
      type: "solid",
      colors: ["#1a3a9a"],
    },
    stroke: {
      lineCap: "round",
    },
    labels: [t("dashboard.todayTasksProgress.progress")],
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-white/3">
      <div className="shadow-default rounded-2xl bg-white px-5 pt-5 pb-5 sm:px-6 sm:pt-6 sm:pb-11 dark:bg-gray-900">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              {t("common.overview")}
            </h3>

            <p className="mt-1 text-theme-sm font-normal text-gray-500 dark:text-gray-400">
              {t("dashboard.todayTasksProgress.subtitle")}
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="max-h-45 overflow-hidden" id="chartDarkStyle">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={330}
            />
          </div>
        </div>

        <p className="mx-auto mt-2.5 w-full max-w-95 text-center text-sm text-gray-500 sm:text-base dark:text-gray-400">
          {t("dashboard.todayTasksProgress.tasksProgress")}
        </p>
      </div>

      <div className="flex items-center justify-center gap-5 px-6 py-3 sm:gap-8 sm:py-5">
        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {t("dashboard.todayTasksProgress.tasksToday")}
          </p>

          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {tasksCount}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {t("dashboard.todayTasksProgress.completed")}
          </p>

          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {completedTasksCount}
          </p>
        </div>

        <div className="h-7 w-px bg-gray-200 dark:bg-gray-800" />

        <div>
          <p className="mb-1 text-center text-theme-xs text-gray-500 sm:text-sm dark:text-gray-400">
            {t("dashboard.todayTasksProgress.urgent")}
          </p>

          <p className="flex items-center justify-center gap-1 text-base font-semibold text-gray-800 sm:text-lg dark:text-white/90">
            {urgentTasksCount}
          </p>
        </div>
      </div>
    </div>
  );
}
