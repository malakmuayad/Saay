import type { LoginResponseDto } from "~/types/auth/loginResponseDto";
import { removeAccessToken, setAccessToken } from "../sessionStorage/auth";
import { removeRefreshToken, setRefreshToken } from "../localStorage/auth";
import { getCurrentUser, removeCurrentUser } from "../localStorage/users";
import type { LogoutDto } from "~/types/auth/LogoutDto";
import { apiFetch } from "./main";

const Base_URL = "https://saay.runasp.net/api/saay/auth/";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponseDto | string> {
  const url = new URL("login", Base_URL);

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  };

  try {
    const response = await fetch(url, options);

    if (response.status === 401 || response.status === 404) {
      return "Invalid Credentials.";
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    return "An error occurred. Please try again later.";
  }
}

export async function refreshAccessToken(): Promise<
  { accessToken: string; refreshToken: string } | string
> {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    const userId = getCurrentUser();

    if (!refreshToken || !userId) {
      return "Session expired. Please sign in again.";
    }

    const response = await fetch(new URL("refresh", Base_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        userId,
      }),
    });

    if (response.status === 401) {
      removeAccessToken();
      removeRefreshToken();
      removeCurrentUser();
      return "Session expired. Please sign in again.";
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);

    return data;
  } catch (error) {
    console.error("Refresh token error:", error);

    return "An error occurred. Please try again later.";
  }
}

export async function logout(logoutDto: LogoutDto): Promise<boolean | string> {
  try {
    const response = await fetch(new URL("logout", Base_URL), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: logoutDto.email,
        refreshToken: logoutDto.refreshToken,
      }),
    });

    if (response.status === 401) {
      removeAccessToken();
      removeRefreshToken();
      removeCurrentUser();
      return "Session expired. Please sign in again.";
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as boolean;
  } catch (error) {
    console.error("Logout error:", error);
    return "An error occurred. Please try again later.";
  }
}

export async function confirm(token: string): Promise<boolean | string> {
  const url = new URL("/api/saay/users/confirm-email", Base_URL);

  const options: RequestInit = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }

  if (response.status === 429) {
    return "You tried too many times. Please try again later.";
  }

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.json()) as boolean;
}
