import { kv } from "@vercel/kv";
import { User } from "../helpers/types";
import { sha256 } from "../lib/utils";

/**
 * Returns true if the access code is valid
 * @param code
 * @returns True if the access code is valid
 */
export async function checkValidAccessCode(code: string): Promise<boolean> {
  const data = await kv.hget(`accessCode:${code}`, "active");
  return data === true;
}

/**
 * Saves user to db
 * @param user
 * @returns True if the user is saved
 */
export async function saveUser(user: User): Promise<boolean> {
  const id = sha256(user.email);
  try {
    await kv.hset(`user:${id}`, user);
    return true;
  } catch (error) {
    console.error("Failed to save user", error);
  }
  return false;
}

/**
 * Issues an access code
 * @param code
 * @returns True if the access code is issued
 */
export async function issueAccessCode(code: string): Promise<boolean> {
  try {
    await kv.hset(`accessCode:${code}`, {
      issued: new Date().toUTCString(),
      updated: new Date().toUTCString(),
      active: true,
    });
    return true;
  } catch (error) {
    console.error("Failed to issue access code", error);
  }
  return false;
}

export async function revokeAccessCode(code: string): Promise<boolean> {
  try {
    const data = await kv.hgetall(`accessCode:${code}`);
    if (data === null) {
      console.error("Access code not found");
      return false;
    }
    await kv.hset(`accessCode:${code}`, {
      issued: data.issued,
      updated: new Date().toUTCString(),
      active: false,
    });
    return true;
  } catch (error) {
    console.error("Failed to revoke access code", error);
  }
  return false;
}
