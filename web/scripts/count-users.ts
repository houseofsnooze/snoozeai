import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

import { countUsers } from "../src/db/kvdb";

async function main(): Promise<number> {
  return await countUsers();
}

main()
  .then(console.log)
  .then(() => console.log("😴 done"))
  .catch(console.error);
