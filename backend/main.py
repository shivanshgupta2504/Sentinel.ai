from fastapi import FastAPI

from app.config import configure_cloudinary, init_cors, lifespan, app_secrets
from app.logger import configure_logging
from app.api.api_handlers import router

configure_logging()

app = FastAPI(
    title="Sentinel API",
    description="A simple FastAPI backend of Sentinel",
    version="0.1.0",
    lifespan=lifespan
)

init_cors(app)
app.include_router(router)
configure_cloudinary(app_secrets)