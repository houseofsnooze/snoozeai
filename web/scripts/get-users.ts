import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

import { getUsers } from "../src/db/kvdb";

getUsers()
  .then(console.log)
  .then(() => console.log("😴 done"))
  .catch(console.error);
