import sys
from ancilla import Device

test_device = Device("test_device")


def handler(event, context):
    test_device.run(event)
    return "Hello"
