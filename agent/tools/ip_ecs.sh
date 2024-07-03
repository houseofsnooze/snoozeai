#!/bin/bash

CLUSTER_NAME="snooz3-dev"
SERVICE_NAME="agents"

# List all task ARNs in the service
TASK_ARNS=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME --query 'taskArns[*]' --output text)

# Loop through each task ARN
for TASK_ARN in $TASK_ARNS; do
  # Get the network interface ID for the task
  NETWORK_INTERFACE_ID=$(aws ecs describe-tasks --cluster $CLUSTER_NAME --tasks $TASK_ARN --query 'tasks[*].attachments[*].details[?name==`networkInterfaceId`].value' --output text)
  
  # Get the IP addresses for the network interface
  IP_ADDRESSES=$(aws ec2 describe-network-interfaces --network-interface-ids $NETWORK_INTERFACE_ID --query 'NetworkInterfaces[*].{PrivateIP:PrivateIpAddress, PublicIP:Association.PublicIp}' --output text)
  
  echo "Task ARN: $TASK_ARN"
  echo "Network Interface ID: $NETWORK_INTERFACE_ID"
  echo "IP Addresses: $IP_ADDRESSES"
  echo "-----------------------------"
done
