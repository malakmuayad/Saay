import type AddUserDto from "~/types/users/AddUserDto";
import type { UserDto } from "~/types/users/UserDto";
import { apiFetch } from "./main";
import type { UpdateUserDto } from "~/types/users/UpdateUserDto";

const Base_URL = "https://saay.runasp.net";

export async function addUser(
  user: AddUserDto,
): Promise<string | [number, string]> {
  const url: URL = new URL("api/saay/users", Base_URL);

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: user.password,
      profilePictureURL: user.profilePictureURL,
    }),
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 400) {
      return "Email already registered! Sign In instead.";
    }

    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const createdUser = await response.json();
    return [createdUser.userId, createdUser.email]; // registeration successed
  } catch (error) {
    return "An error occurred. Please try again later.";
  }
}

export async function getUser(userId: number): Promise<UserDto | string> {
  const url: URL = new URL(`api/saay/users/${userId}`, Base_URL);

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

  return (await response.json()) as UserDto;
}

export async function getUserMission(userId: number): Promise<string | null> {
  const url: URL = new URL(`api/saay/users/mission/${userId}`, Base_URL);

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

  return (await response.text()) as string | null;
}

export async function updateMission(
  userId: number,
  mission: string,
): Promise<boolean | string> {
  const url: URL = new URL("api/saay/users/missions", Base_URL);

  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      newMission: mission,
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

  return (await response.json()) as boolean;
}

export async function updateUser(
  updateUserDto: UpdateUserDto,
): Promise<boolean | string> {
  const url: URL = new URL("api/saay/users/", Base_URL);

  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: updateUserDto.userId,
      firstName: updateUserDto.firstName,
      lastName: updateUserDto.lastName,
      email: updateUserDto.email,
      profilePictureURL: null,
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

  return (await response.json()) as boolean;
}

export async function updatePassword(
  userId: number,
  newPassword: string,
): Promise<boolean | string> {
  const url: URL = new URL("api/saay/users/passwords", Base_URL);

  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      newPassword,
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

  return (await response.json()) as boolean;
}

export async function deleteUser(userId: number): Promise<boolean | string> {
  const url: URL = new URL(`api/saay/users/${userId}`, Base_URL);

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

export async function getUserConfirmationStatus(
  userId: number,
): Promise<string | boolean> {
  const url: URL = new URL(`api/saay/users/confirmation/${userId}`, Base_URL);

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

  return (await response.json()) as boolean;
}
