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


app = None

environment = os.environ.get("ANCILLA_ENV", "prod")
dry_run = os.environ.get("ANCILLA_DRY_RUN", "False") == "True"


def host(api, host="0.0.0.0", port=int(os.environ.get("PORT", "8080"))):
    global app
    app = api
    if not dry_run:
        uvicorn.run(api, host=host, port=port)


def get_app():
    global app
    if app is None:
        raise Exception("App not initialized. Use host() to initialize.")
    return app
