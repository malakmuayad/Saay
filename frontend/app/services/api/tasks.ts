import type { TaskDto } from "~/types/tasks/TaskDto";
import { apiFetch } from "./main";
import type { AddTaskDto } from "~/types/tasks/AddTaskDto";
import type { TaskCategoryDto } from "~/types/tasks/TaskCategoryDto";
import type { TasksByPrayerDto } from "~/types/tasks/TasksByPrayerDto";

const Base_URL: string = "https://saay.runasp.net";

export async function getUserTasksToday(
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<TaskDto[] | string> {
  const url: URL = new URL(
    `api/saay/tasks/today/${userId}/${pageNumber}/${pageSize}`,
    Base_URL,
  );

  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as TaskDto[];
}

export async function getUserTasksTomorrow(
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<TaskDto[] | string> {
  const url: URL = new URL(
    `api/saay/tasks/tomorrow/${userId}/${pageNumber}/${pageSize}`,
    Base_URL,
  );

  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as TaskDto[];
}

export async function getUserTasksForWeek(
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 10,
): Promise<TaskDto[] | string> {
  const url: URL = new URL(
    `api/saay/tasks/week/${userId}/${pageNumber}/${pageSize}`,
    Base_URL,
  );

  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as TaskDto[];
}

export async function markTaskAsCompleted(
  taskId: number,
): Promise<boolean | string> {
  const url: URL = new URL(`api/saay/tasks/mark-completed/${taskId}`, Base_URL);

  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as boolean;
}

export async function deleteTask(taskId: number): Promise<boolean | string> {
  const url: URL = new URL(`api/saay/tasks/${taskId}`, Base_URL);

  const options: RequestInit = {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as boolean;
}

export async function addTask(
  addTaskDto: AddTaskDto,
): Promise<TaskDto | string> {
  const url: URL = new URL(`api/saay/tasks`, Base_URL);

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: addTaskDto.userId,
      taskCategoryId: addTaskDto.taskCategoryId,
      title: addTaskDto.title,
      repetition: addTaskDto.repetition,
      dueDate: addTaskDto.dueDate,
      dueTime: addTaskDto.dueTime,
    }),
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as TaskDto;
}

export async function getCategories(): Promise<TaskCategoryDto[] | string> {
  const url: URL = new URL("api/saay/tasks/categories", Base_URL);

  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as TaskCategoryDto[];
}

export async function getTasksByPrayers(
  userId: number,
  latitude: string,
  longtitude: string,
): Promise<TasksByPrayerDto | string> {
  const url: URL = new URL(
    `api/saay/tasks/${userId}/${latitude}/${longtitude}`,
    Base_URL,
  );

  const options: RequestInit = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as TasksByPrayerDto;
}
