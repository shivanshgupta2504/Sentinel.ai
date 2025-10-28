import logging
from logging.handlers import RotatingFileHandler

# Define the log format
LOG_FORMAT = "%(process)d %(asctime)s - %(levelname)s - %(name)s - %(message)s"
LOG_DEFAULT_HANDLERS = ["file"]


def configure_logging():
    """
    Configures the logging for the application, setting up handlers
    """
    # Get the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)  # Set the lowest level of severity to log

    # Create a formatter
    formatter = logging.Formatter(LOG_FORMAT)

    file_handler = RotatingFileHandler(
        "app.log",  # Log file name
        maxBytes=10 * 1024 * 1024,  # Max size in bytes (e.g., 10MB)
        backupCount=5,  # Number of backup files to keep
    )
    file_handler.setFormatter(formatter)
    root_logger.addHandler(file_handler)

    logging.info("------ Logging configured successfully. ------")
