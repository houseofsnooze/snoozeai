import { fromEnv } from "@aws-sdk/credential-providers";
import { DescribeNetworkInterfacesCommand, DescribeNetworkInterfacesCommandInput, EC2Client } from "@aws-sdk/client-ec2";
import { DescribeTasksCommand, DescribeTasksCommandInput, ECSClient, RunTaskCommand, RunTaskCommandInput, RunTaskCommandOutput } from "@aws-sdk/client-ecs"

const ecs = new ECSClient({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: fromEnv()
});
const ec2 = new EC2Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: fromEnv()
});

async function launchTask(cluster: string, taskDefinition: string, subnets: Array<string>, securityGroups: Array<string>) {
    try {
        const runTaskRequest: RunTaskCommandInput = {
            startedBy: "central-relay",
            cluster,
            launchType: 'FARGATE',
            taskDefinition,
            count: 1,
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets,
                    securityGroups,
                    assignPublicIp: 'ENABLED'
                }
            }
        };
        const runTaskResponse = await ecs.send(new RunTaskCommand(runTaskRequest))
        const task = runTaskResponse.tasks?.[0];
        const taskArn = task?.taskArn;
        const id = taskArn?.split('/').pop() || "";

        console.log(`Task launched successfully: ${id}`);

        const ENI = await getRunningENI(taskArn as string);

        const describeNetworkInterfacesRequest: DescribeNetworkInterfacesCommandInput = {
            Filters: [
                {
                    Name: 'network-interface-id',
                    Values: [ENI || '']
                }
            ]
        }
        const describeNetworkInterfacesResponse = await ec2.send(new DescribeNetworkInterfacesCommand(describeNetworkInterfacesRequest))
        const publicIp = describeNetworkInterfacesResponse?.NetworkInterfaces?.[0]?.Association?.PublicIp;

        return { publicIp, id };
    } catch (error) {
        console.error(`Failed to complete task launch: ${error}`);
        return;
    }
}

async function getRunningENI(taskArn: string): Promise<string | undefined> {
    let startTime = Date.now();
        let timeout = 120000; // 2 minutes in milliseconds

        let input: DescribeTasksCommandInput = {
            cluster: 'snooz3-dev',
            tasks: [taskArn]
        }

        let output;
        let taskStatus;
        while (taskStatus !== 'RUNNING' && (Date.now() - startTime) < timeout) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before polling again
            output = await ecs.send(new DescribeTasksCommand(input));
            taskStatus = output?.tasks?.[0]?.lastStatus;
            console.log(`Task status: ${taskStatus}`);
        }

        if (taskStatus !== 'RUNNING') {
            console.error('Task did not reach RUNNING status within 2 minutes.');
            return;
        }

        return output?.tasks?.[0]?.attachments?.[0]?.details?.find(detail => detail.name === 'networkInterfaceId')?.value as string;

}

export default async function (): Promise<{ wsUrl: string, taskId: string } | undefined> {
    const cluster = 'snooz3-dev';
    const taskDefinition = 'snooze-dev-main'; // this can be family, family:revision, or arn
    const subnets = ['subnet-0608382dc93cda83d', 'subnet-03a3ae14ff2bfc05b'];
    const securityGroups = ['sg-0f65b23d9118bd255'];

    const task = await launchTask(cluster, taskDefinition, subnets, securityGroups);

    if (task) {
        return {
            wsUrl: `ws://${task.publicIp}:1337`,
            taskId: task.id
        };
    }
}
