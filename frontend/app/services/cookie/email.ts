export function addEmailCookie(email: string) {
  document.cookie = `email=${email}; expires=${new Date().getDate() + 1}; path=/confirm`;
}

export function removeEmailCookie() {
  document.cookie =
    "email=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/confirm";
}

export function getEmailCookie(): string | null {
  for (let c of document.cookie.split(";")) {
    c = c.trim();
    if (c.startsWith("email" + "=")) {
      // Return only the value
      return c.substring("email".length + 1);
    }
  }
  return null;
}
