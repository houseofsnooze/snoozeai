# snooze
Today it takes months to launch on-chain because writing smart contracts is complex and niche and generally requires auditing. From idea to deployment is not only slow but also expensive. Using AI we have an opportunity to speed up smart contract development from days to minutes and save teams on auditing costs.

----

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License along
    with this program; if not, write to the Free Software Foundation, Inc.,
    51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

Future Proof Collective, Inc., hereby disclaims all copyright interest in the program `snoozeai` aka `snooze` written by Val S. K. and Jin Lai.

## Run

### Run agent locally

[Set up](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) an aws cli profile with the correct credentials.

Provide an environmenet variable for the AWS profile so (Python/boto3) aws client can pick it up.

```
export AWS_PROFILE=xyz
```

```
cd snoozeai/agent
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export OPENAI_API_KEY=
python main.py
```

### Run relay locally
(You can add env vars to AWS config instead)
```
cd snoozeai/infra
npm install
export AWS_DEFAULT_REGION=
export AWS_ACCESS_KEY_ID=
export AWS_SECRET_ACCESS_KEY=
npx ts-node relay.ts
```

### Run web locally
```
cd snoozeai/web
npm install
npm run dev
```

----

Copyright (C) 2024 Future Proof Collective, Inc.
