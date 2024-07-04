import { TaskInfo } from "../utils/types";

let availableTasks: TaskInfo[] = [];

export async function getAvailableTasks(): Promise<TaskInfo[]> {
    return availableTasks;
}

export async function addAvailableTask(task: TaskInfo): Promise<boolean> {
    const tasks = await getAvailableTasks();
    const nextTasks = [...tasks, task];
    return await saveAvailableTasks(nextTasks);
}

/**
 * Adds task to available tasks list
 * @param task
 * @returns True if the task is added
 */
export async function saveAvailableTasks(tasks: TaskInfo[]): Promise<boolean> {
    availableTasks = tasks;
    return true;
    // TODO: use the db
    // try {
    //     await kv.hset(`infra:agentTasksAvailable`, tasks);
    //     return true;
    // } catch (error) {
    //     console.error("Failed to add available task", error);
    // }
    // return false;
}

