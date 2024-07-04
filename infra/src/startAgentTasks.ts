import launchTask from "./lib/launchTask";
import { TaskInfo } from "./utils/types";

/**
 * Starts a number of agent tasks marking them available
 * @param count number of tasks to start
 * @returns array of ws urls and task ids
 */
export default async function (count: number, makeAvailable: boolean = true): Promise<{ wsUrl: string, taskId: string }[]> {
    const cluster = 'snooz3-dev';
    const taskDefinition = 'snooze-dev-main'; // this can be family, family:revision, or arn
    const subnets = ['subnet-0608382dc93cda83d', 'subnet-03a3ae14ff2bfc05b'];
    const securityGroups = ['sg-0f65b23d9118bd255'];

    const taskPromises = [];

    for (let i = 0; i < count; i++) {
        taskPromises.push(launchTask({
            cluster,
            taskDefinition,
            subnets,
            securityGroups
        }, makeAvailable));
    }

    const tasks = await Promise.allSettled(taskPromises);
    const successfulTasks = tasks.filter((task) => task.status === 'fulfilled') as PromiseFulfilledResult<TaskInfo>[];
    return successfulTasks.map((task) => ({
        wsUrl: `ws://${task.value.publicIp}:1337`,
        taskId: task.value.id
    }));
}
