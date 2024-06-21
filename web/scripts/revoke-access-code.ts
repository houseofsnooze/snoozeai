import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });

import { revokeAccessCode } from "../src/db/kvdb";

const code = process.argv[2];

if (!code) {
  console.error("Please provide an access code");
  process.exit(1);
}

revokeAccessCode(code)
  .then(console.log)
  .then(() => console.log("😴 done"))
  .catch(console.error);
