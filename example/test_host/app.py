import sys
from ancilla import Device

device = Device("test_device")


def handler(event, context):
    device.run(event)
    return "Hello"
