import type { TaskDto } from "./TaskDto";

export interface TasksByPrayerDto {
  prayerTimes: string[];
  fajrTasks: TaskDto[];
  dhuhaTasks: TaskDto[];
  dhuhrTasks: TaskDto[];
  asrTasks: TaskDto[];
  maghribTasks: TaskDto[];
  ishaTasks: TaskDto[];
  tasksWithoutPrayers: TaskDto[];
}
