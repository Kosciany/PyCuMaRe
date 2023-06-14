Rem if first argument is build or build folder does not exist
Rem then build frontend

cd frontend
if "%1" == "build" (
    CALL npm run build
    goto RUN
)

if not exist "build" (
    CALL npm run build
    goto RUN
)

:RUN

cd ..
START python backend/mandelbrot_cuda_generator.py
START python -m http.server 8000 --directory frontend/build

explorer "http://localhost:8000"
