# Ancilla Monitor

Monitors exist in an array and orchestrate the deployment and usage of some ML infrastructure

 - They're python modules
 - They deploy their own infrastructure
 - They scale themselves

## `deploy.py`

This file deploys some infrastructure somewhere. It's run every time the container is started

## `start.sh`

Start your monitor service on port 80. You should accept `POST /`

## `stop.sh`

Stop the monitor service. Called to gracefully stop the container. Once port 80 is ded, container is kil
