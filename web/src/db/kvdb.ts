import { kv } from "@vercel/kv";
import { User } from "../helpers/types";
import { sha256 } from "../lib/utils";

/**
 * Returns true if the access code is valid
 * @param code
 * @returns True if the access code is valid
 */
export async function checkValidAccessCode(code: string): Promise<boolean> {
  const data = await kv.get(`accessCode:${code}`);
  return data !== null;
}

/**
 * Saves user to db
 * @param user
 * @returns True if the user is saved
 */
export async function saveUser(user: User): Promise<boolean> {
  const id = sha256(user.email);
  try {
    await kv.set(`user:${id}`, user);
    return true;
  } catch (error) {
    console.error("Failed to save user", error);
  }
  return false;
}
