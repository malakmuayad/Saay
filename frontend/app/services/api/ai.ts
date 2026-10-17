import type { Message } from "~/types/ai/Message";
import { apiFetch } from "./main";

const Base_URL: string = "https://saay.runasp.net";

export async function getAIReply(messages: Message[]): Promise<string> {
  const url: URL = new URL("api/saay/ai", Base_URL);

  const options: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  };

  const response = await apiFetch(url, options);

  if (typeof response === "string") {
    return response;
  }

  if (response.status === 404) {
    return "User not found.";
  }
  if (response.status === 503)
    return "AI service is temporarily unavailable. Please try again later.";

  if (!response.ok) {
    return "An error occurred. Please try again later.";
  }

  return (await response.text()) as string;
}
