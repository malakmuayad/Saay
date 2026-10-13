const Base_URL: string = "https://saay.runasp.net/api/saay/emails";

export async function sendPasswordResetEmail(
  email: string,
): Promise<boolean | string> {
  try {
    const response = await fetch(`${Base_URL}/reset-password/${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 404) {
      return "User with this email is not found. Sign up instead.";
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as boolean;
  } catch (error) {
    console.error("API request error:", error);
    return "An error occurred. Please try again later.";
  }
}

export async function resendConfirmationEmail(
  email: string,
): Promise<boolean | string> {
  try {
    const response = await fetch(`${Base_URL}/resend-confirmation/${email}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (response.status === 404) {
      return "User with this email is not found. Sign up instead.";
    }

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return (await response.json()) as boolean;
  } catch (error) {
    console.error("API request error:", error);
    return "An error occurred. Please try again later.";
  }
}
