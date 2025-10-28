from contextlib import asynccontextmanager
import logging
import os
from pathlib import Path
import shutil

import cloudinary
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import torchreid

from google import genai

from app.db import get_huid_collection, setup_sqllite_database, setup_vector_db

logger = logging.getLogger(__name__)

APP_ROOT_DIR = Path(__file__).parent.resolve()

class AppSecrets(BaseSettings):

    CLOUDINARY_CLOUD_NAME: SecretStr
    CLOUDINARY_API_KEY: SecretStr
    CLOUDINARY_API_SECRET: SecretStr
    GEMINI_API_KEY: SecretStr

    model_config = SettingsConfigDict(env_file="secrets.env", env_file_encoding="utf-8")

@asynccontextmanager
async def lifespan(app: FastAPI):

    shutil.rmtree("app/crops/",ignore_errors=True)

    try:
        os.remove("app.db")
    except Exception as e:
        logger.warning("Failed to remove app.db")
    
    logger.info("------FastAPI is starting UP------")

    setup_sqllite_database()
    setup_vector_db()

    yield
    logger.info("------FastAPI is shutting DOWN------")


def init_cors(app: FastAPI):
    origins = ["*"] # Allow all origins; modify as needed for production

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
        allow_headers=["*"],  # Allows all headers
    )

    logger.info(f"CORS Configured, Allowed Origins {origins}")

def configure_cloudinary(app_secrets : AppSecrets):

    cloudinary.config(
        cloud_name=app_secrets.CLOUDINARY_CLOUD_NAME.get_secret_value(),
        api_key=app_secrets.CLOUDINARY_API_KEY.get_secret_value(),
        api_secret=app_secrets.CLOUDINARY_API_SECRET.get_secret_value(),
        secure=True
    )

    logger.info(f"Cloudinary Configured")

app_secrets = AppSecrets()

osnet_feature_extractor = torchreid.utils.FeatureExtractor(
    model_name="osnet_ain_x1_0",
    device="cuda",
)

huid_collection = get_huid_collection()

gemini_client = genai.Client(api_key=app_secrets.GEMINI_API_KEY.get_secret_value())
chat = gemini_client.chats.create(model="gemini-2.5-flash")
