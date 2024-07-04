export type TaskParams = {
    cluster: string,
    taskDefinition: string,
    subnets: Array<string>,
    securityGroups: Array<string>
}

export type TaskInfo = {
    arn: string,
    publicIp: string | undefined,
    id: string
}
