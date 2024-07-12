import { fromEnv } from "@aws-sdk/credential-providers";
import { DescribeNetworkInterfacesCommand, DescribeNetworkInterfacesCommandInput, EC2Client } from "@aws-sdk/client-ec2";
import {
    DescribeTasksCommand,
    DescribeTasksCommandInput,
    ECSClient,
    RunTaskCommand,
    RunTaskCommandInput,
} from "@aws-sdk/client-ecs"
import { TASK_STARTED_BY } from "../utils/constants";
import { TaskInfo, TaskParams } from "../utils/types";
import * as db from "../db/mem";

const ecs = new ECSClient({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: fromEnv()
});
const ec2 = new EC2Client({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: fromEnv()
});

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

export default async function({ cluster, taskDefinition, subnets, securityGroups }: TaskParams, makeAvailable: boolean = true): Promise<TaskInfo | undefined> {
    try {
        const runTaskRequest: RunTaskCommandInput = {
            startedBy: TASK_STARTED_BY,
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
        const id = taskArn?.split('/').pop();

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

        if (!publicIp || !id || !taskArn) {
            console.error(`Failed to launch task with arn: ${taskArn}`);
            return;
        }

        const info = { publicIp, id, arn: taskArn };
        if (makeAvailable) {
            await db.addAvailableTask(info);
        }
        return info;
    } catch (error) {
        console.error(`Failed to complete task launch: ${error}`);
        return;
    }
}
