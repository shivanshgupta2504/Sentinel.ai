from enum import Enum


class UploadingUnsupportedResourceType(Exception):
    """Exception raised when an unsupported resource type is asked to be uploaded."""
    pass

class UploadFailed(Exception):
    """"It's a Generic Exception which is raised when a upload to cloudinary fails"""
    pass

class AssetDownloadFailed(Exception):
    """It's a Generic Exception which is raised when we fail to download an asset from cloudinary"""

class DBOperationFailed(Exception):
    """It's a Generic Exception which is raised when any DB operation fails"""
    pass

class GenericFSIOError(Exception):
    """It's a Generic Exception which is raised when any Filesystem IO operation fails"""

class ErrorCode(Enum):
    # DB Related errors
    DBOperationFailed = 1

    # OS Level errors
    GenericFSIOError = 101

    # Upload Related errors
    UploadingUnsupportedResourceType = 201
    UploadFailed = 202

    # Download Related errors
    AssetDownloadFailed = 301