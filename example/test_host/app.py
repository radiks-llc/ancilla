import sys
from ancilla import Device, AncillaAPI, run
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
import json

app = AncillaAPI()

test_device = Device("test_device")


@app.get("/")
def handler():
    # test_device.run(event)
    # print("fatal error", file=sys.stderr)
    # return json.dumps({"status": "ok"})
    json_compatible_item_data = jsonable_encoder(None)

    return JSONResponse(content=json_compatible_item_data)


if __name__ == "__main__":
    run(app)
