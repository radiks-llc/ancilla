# usage: from ancilla import Device
# test_device = Device("test")
# get_devices() # returns a list of devices (["test_device"])

devices = []


class Device:
    def __init__(self, name):
        self.name = name
        devices.append(self)

    def __str__(self):
        return f"Device: {self.name}"

    def __repr__(self):
        return f"Device: {self.name}"


def get_devices():
    return list(map(lambda x: x.name, devices))
