## Run

### Upload artifacts to S3 

#### With an agent running locally

[Set up](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) an aws cli profile with the correct credentials.

Provide an environmenet variable for the AWS profile so (Python/boto3) aws client can pick it up.

```
export AWS_PROFILE=xyz
```


### Run agent locally
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

## Deploy

### Deploy web to vercel
(Run the commands in the root directory. When you're ready for prod it will give you instructions for promoting.)
```
cd snoozeai
vercel
```

### Push image for agent
(Remember to manually update ECS relay service with a new task def to pull the latest image)
```
cd snoozeai/agent
docker buildx build -t snooze-main --platform linux/amd64 -f Dockerfile.main . 
ID=$(docker images --filter=reference=snooze-main --format "{{.ID}}")
docker tag $ID 084782361886.dkr.ecr.us-east-2.amazonaws.com/snooz3-dev:main
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 084782361886.dkr.ecr.us-east-2.amazonaws.com
docker push 084782361886.dkr.ecr.us-east-2.amazonaws.com/snooz3-dev:main
```

### Push image for relay
```
cd snoozeai/infra
docker buildx build -t snooze-relay-ts --platform linux/amd64 -f Dockerfile.relay . 
ID=$(docker images --filter=reference=snooze-relay-ts --format "{{.ID}}")
docker tag $ID 084782361886.dkr.ecr.us-east-2.amazonaws.com/snooz3-dev:relay-ts
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 084782361886.dkr.ecr.us-east-2.amazonaws.com
docker push 084782361886.dkr.ecr.us-east-2.amazonaws.com/snooz3-dev:relay-ts
```

## Scripts

From `web` directory you can run scripts with ts-node:

```
npx ts-node scripts/issue-access-code ray-sizl
```

```
npx ts-node scripts/revoke-access-code ray-sizl
```

```
npx ts-node scripts/check-access-code ray-sizl
```