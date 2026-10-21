import type { TaskDto } from "~/types/tasks/TaskDto";
import TasksTable from "../table/TasksTable";

export type PrayerCardProps = {
  title: string;
  time: string;
  statNum: number;
  tasks: TaskDto[];
  onDelete: (taskId: number) => void;
  className?: string;
};

export default function PrayerCard({
  title,
  time,
  statNum,
  tasks,
  onDelete,
  className,
}: PrayerCardProps) {
  return (
    <div
      className={`${className ? className : ""} rounded-2xl border border-gray-200 bg-white p-2 md:p-3 dark:border-gray-800 dark:bg-white/3`}
    >
      <div className="mt-5">
        <div className="flex justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{time}</p>
          </div>
          <p className="-translate-y-2 mt-2 text-title-sm font-bold text-gray-800 dark:text-white/90">
            {statNum}
          </p>
        </div>
      </div>
      <TasksTable tableData={tasks} readOnly={false} onDelete={onDelete} />
    </div>
  );
}
