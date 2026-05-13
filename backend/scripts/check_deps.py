import sys
try:
    import uvicorn
    print("uvicorn is installed")
except ImportError:
    print("uvicorn is NOT installed")

try:
    import fastapi
    print("fastapi is installed")
except ImportError:
    print("fastapi is NOT installed")
