import { kv } from "npm:@vercel/kv";

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
