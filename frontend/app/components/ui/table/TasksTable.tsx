import { TableLayout, TableRow, TableCell, TableBody } from ".";
import Badge from "../Badge";
import Button from "../button/Button";
import type { TaskDto } from "~/types/tasks/TaskDto";
import Checkbox from "~/components/form/input/Checkbox";
import { DeleteIcon } from "~/assets/icons";
import { t } from "i18next";

type TasksTableProps = {
  tableData: TaskDto[];
  readOnly?: boolean;
  onEdit?: (task: TaskDto) => void;
  onDelete?: (taskId: number) => void;
};

export default function TasksTable({
  tableData,
  readOnly = false,
  onEdit,
  onDelete,
}: TasksTableProps) {
  if (tableData.length === 0) {
    return (
      <div className="py-8 text-center text-theme-sm text-gray-500 dark:text-gray-400">
        {t("tasks.noTasksDescription")}
      </div>
    );
  }

  return (
    <TableLayout>
      <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
        {tableData.map((task) => (
          <TableRow key={task.taskId}>
            {/* Complete */}
            <TableCell className="px-2 py-3 text-theme-sm text-gray-500 sm:px-4 dark:text-gray-400">
              <Checkbox
                checked={task.isDone}
                disabled={readOnly}
                onChange={() => onEdit?.(task)}
              />
            </TableCell>

            {/* Title */}
            <TableCell className="px-2 py-3 sm:px-4">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {task.title}
              </p>
            </TableCell>

            {/* Category */}
            <TableCell className="px-2 py-3 text-theme-sm text-gray-500 sm:px-4 dark:text-gray-400">
              <Badge color="light">
                {t(`tasks.categories.${task.taskCategoryTitle}`)}
              </Badge>
            </TableCell>

            {/* Delete */}
            {!readOnly && (
              <TableCell className="px-2 py-3 text-theme-sm text-gray-500 sm:px-4 dark:text-gray-400">
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2 sm:px-3"
                  onClick={() => onDelete?.(task.taskId)}
                >
                  <DeleteIcon />
                </Button>
              </TableCell>
            )}
            {/* Time */}
            <TableCell className="px-2 py-3 text-theme-sm text-gray-500 sm:px-4 dark:text-gray-400">
              <p className="text-theme-sm font-medium text-gray-800 dark:text-white/90">
                {task.dueTime}
              </p>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </TableLayout>
  );
}
