import { User } from "@/helpers/types";

export async function saveUser(user: User): Promise<boolean> {
  try {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command: "saveUser", user }),
    });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}

export async function checkValidAccessCode(
  accessCode: string
): Promise<boolean> {
  try {
    const response = await fetch("/api/db", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command: "checkValidAccessCode", accessCode }),
    });
    if (response.ok) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
}
