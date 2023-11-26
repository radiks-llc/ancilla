from ancilla import Device, host
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder

app = FastAPI()

test_device = Device("test_device")


@app.get("/")
def home():
    return JSONResponse(content=jsonable_encoder(None))


host(app)
