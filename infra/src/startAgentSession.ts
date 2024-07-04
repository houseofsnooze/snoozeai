import { fromEnv } from "@aws-sdk/credential-providers";
import {
    DescribeTasksCommand,
    DescribeTasksCommandInput,
    ECSClient,
    TagResourceCommandInput,
    TagResourceCommand
} from "@aws-sdk/client-ecs"
import * as db from "./db/mem";
import startAgentTasks from "./startAgentTasks";
import { TaskInfo } from "./utils/types";

const ecs = new ECSClient({
    region: process.env.AWS_DEFAULT_REGION,
    credentials: fromEnv()
});

/**
 * Take the first available task from the availableTasks array
 * and tag it as in use
 * @param availableTasks List of available tasks
 * @returns The first available task or undefined
 */
async function takeAvailableTask(availableTasks: TaskInfo[], user: string): Promise<TaskInfo | undefined> {
    while (availableTasks.length > 0) {
        const task = availableTasks.shift();
        console.log(`Checking task: ${task?.id}`);
        const available = await checkTaskAvailable(task);
        console.log(`Task available: ${available}`);
        if (task && available) {
            let input: TagResourceCommandInput = {
                resourceArn: task.arn,
                tags: [{ key: 'inUseBy', value: user }]
            }
            await ecs.send(new TagResourceCommand(input));
            console.log(`Task taken. id: ${task.id}, user: ${user}`);
            return task;
        }
    }
}

async function checkTaskAvailable(task: TaskInfo | undefined): Promise<boolean> {
    if (!task) {
        return false;
    }
    let input: DescribeTasksCommandInput = {
        cluster: 'snooz3-dev',
        tasks: [task.arn]
    }
    const output = await ecs.send(new DescribeTasksCommand(input));
    const running = output?.tasks?.[0].lastStatus === "RUNNING";
    if (!running) {
        return false;
    }
    const inUseBy = output?.tasks?.[0].tags?.find(tag => tag.key === 'inUseBy')?.value;
    if (inUseBy !== undefined) {
        if (inUseBy !== "") {
            return false;
        }
    }
    return true;
}

export default async function (user: string): Promise<{ wsUrl: string, taskId: string } | undefined> {
    const availableTasks = await db.getAvailableTasks();
    console.log("availableTasks", availableTasks);
    const task = await takeAvailableTask(availableTasks, user);

    // run in bg instead of waiting for this
    console.log("Launching another task for the pool");
    startAgentTasks(1);

    if (task) {
        return {
            wsUrl: `ws://${task.publicIp}:1337`,
            taskId: task.id
        };
    } else {
        console.error("No available tasks. Launching one just in time.");
        // do not make it available to anyone else
        const makeAvailable = false;
        const jitTasks = await startAgentTasks(1, makeAvailable);
        if (jitTasks.length > 0) {
            return jitTasks[0];
        }
    }
}
