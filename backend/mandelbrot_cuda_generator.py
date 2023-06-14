from math import log
import numpy as np
import cv2
from numba import cuda
from numba import njit

from fastapi import FastAPI
from fastapi import Response
from fastapi.middleware.cors import CORSMiddleware
import uvicorn


LIMIT = 32
CUDA_THREADS = 32


@cuda.jit
def check_cuda(mandelbrot_array, complex_coords):
    tx = cuda.threadIdx.x
    ty = cuda.blockIdx.x
    bw = cuda.blockDim.x
    pos = tx + ty * bw
    if pos < complex_coords.size:
        z = 0
        n = 0
        while abs(z) <= 2 and n < LIMIT:
            z = z * z + complex_coords[pos]
            n += 1
        mandelbrot_array[pos] = n + 1 - log(log(abs(z))) / log(2)


def generate_2d_complex_map(x, y, step, width, height):
    x_coords, y_coords = np.meshgrid(
        np.arange(0, width) * step + x,
        np.arange(0, height) * step + y,
    )
    mesh = x_coords + 1j * y_coords
    return mesh


@njit
def cast_2d_map_to_id_array(array):
    old_shape = array.shape
    return old_shape, array.flatten()


@njit
def cast_flat_array_to_2d_map(old_shape, array):
    return np.reshape(array, old_shape)


origins = [
    "*"
]

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    "/mandelbrot",
    responses={200: {"content": {"image/png": {}}}},
    response_class=Response,
)
async def mandelbrot_generator(
    x: float = -2.5,
    y: float = -2.0,
    step: float = 0.0033,
    width: int = 1920,
    height: int = 1080,
):
    coord_map = generate_2d_complex_map(x, y, step, width, height)

    shape, flat_coord_map = cast_2d_map_to_id_array(coord_map)

    cuda_arr = cuda.device_array_like(np.zeros(shape=flat_coord_map.shape))

    threads_per_block = CUDA_THREADS
    blockspergrid = (flat_coord_map.size + (threads_per_block - 1)) // threads_per_block

    cuda_coord = cuda.to_device(flat_coord_map)

    check_cuda[blockspergrid, threads_per_block](cuda_arr, cuda_coord)

    flat_mandelbrot = cuda_arr.copy_to_host()

    mandelbrot = np.nan_to_num(cast_flat_array_to_2d_map(shape, flat_mandelbrot))

    hue = np.uint8(mandelbrot * 255 / LIMIT)
    saturation = np.ones_like(hue) * 255
    value = np.ones_like(hue) * 255

    # concat hue, saturation, value into a 3D array

    hsv = np.dstack((hue, saturation, value))

    # convert hsv to rgb

    hsv = cv2.cvtColor(hsv, cv2.COLOR_HSV2RGB)
    img: bytes = cv2.imencode(".png", hsv)[1].tobytes()
    return Response(content=img, media_type="image/png")


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=8001)
