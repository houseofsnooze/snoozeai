Today it takes months to launch on-chain because writing smart contracts is complex and niche and generally requires auditing. From idea to deployment is not only slow but also expensive. Using AI we have an opportunity to speed up smart contract development from days to minutes and save teams on auditing costs.

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
