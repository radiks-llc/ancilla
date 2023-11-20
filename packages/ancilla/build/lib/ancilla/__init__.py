import json
import json
import os
import uvicorn
from fastapi import FastAPI
from fastapi.logger import logger
import logging

gunicorn_logger = logging.getLogger("gunicorn.error")
logger.handlers = gunicorn_logger.handlers
if __name__ != "main":
    logger.setLevel(gunicorn_logger.level)
else:
    logger.setLevel(logging.DEBUG)


devices = []


class Device:
    def __init__(self, name):
        self.name = name
        devices.append(self)

    def __str__(self):
        return f"Device: {self.name}"

    def __repr__(self):
        return f"Device: {self.name}"

    def run(self, event):
        print(f"Running event: {event}")


def get_devices():
    return json.dumps([device.name for device in devices])


def AncillaAPI():
    return FastAPI()


print("wow", flush=True)


def run(api, host="0.0.0.0", port=int(os.environ.get("PORT", "8080"))):
    uvicorn.run(api, host=host, port=port)
