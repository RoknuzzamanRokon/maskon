import os
import shutil
import uuid
import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from typing import List

from core import STATIC_DIR, get_current_admin

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/api/upload-status")
async def upload_status(admin_id: int = Depends(get_current_admin)):
    """Check if upload directory is accessible and writable"""
    try:
        # Ensure we're using absolute path
        if not os.path.isabs(STATIC_DIR):
            backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            upload_dir = os.path.join(backend_dir, STATIC_DIR, "uploads")
        else:
            upload_dir = os.path.join(STATIC_DIR, "uploads")

        # Check if directory exists
        exists = os.path.exists(upload_dir)

        # Check if writable
        writable = os.access(upload_dir, os.W_OK) if exists else False

        # Get directory size
        total_files = len(os.listdir(upload_dir)) if exists else 0

        return {
            "status": "ok" if exists and writable else "error",
            "upload_dir": upload_dir,
            "exists": exists,
            "writable": writable,
            "total_files": total_files,
        }
    except Exception as e:
        logger.error(f"Error checking upload status: {str(e)}")
        return {"status": "error", "error": str(e)}


@router.post("/api/upload-media")
async def upload_media(
    files: List[UploadFile] = File(...), admin_id: int = Depends(get_current_admin)
):
    logger.info(f"Upload request from admin {admin_id}, files count: {len(files)}")

    # Ensure we're using absolute path
    if not os.path.isabs(STATIC_DIR):
        # Get the backend directory (where this file is located)
        backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        upload_dir = os.path.join(backend_dir, STATIC_DIR, "uploads")
    else:
        upload_dir = os.path.join(STATIC_DIR, "uploads")

    os.makedirs(upload_dir, exist_ok=True)
    logger.info(f"Upload directory: {upload_dir}")

    uploaded_files = []
    allowed_image_types = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/jpg",
    ]
    allowed_video_types = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
        "video/quicktime",  # For .mov files
        "video/x-msvideo",  # For .avi files
    ]

    for file in files:
        try:
            logger.info(
                f"Processing file: {file.filename}, content_type: {file.content_type}"
            )

            # Check file type
            if file.content_type not in allowed_image_types + allowed_video_types:
                logger.error(f"Invalid file type: {file.content_type}")
                raise HTTPException(
                    status_code=400,
                    detail=f"File type {file.content_type} not allowed. Only images and videos are supported.",
                )

            # Check file size (50MB limit for videos, 10MB for images)
            file_size_limit = (
                50 * 1024 * 1024
                if file.content_type in allowed_video_types
                else 10 * 1024 * 1024
            )

            # Validate filename
            if not file.filename:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid filename",
                )

            file_extension = file.filename.split(".")[-1].lower()
            unique_filename = f"{uuid.uuid4()}.{file_extension}"
            file_path = os.path.join(upload_dir, unique_filename)

            # Read and write file
            with open(file_path, "wb") as buffer:
                content = await file.read()

                # Check file size before writing
                if len(content) > file_size_limit:
                    raise HTTPException(
                        status_code=400,
                        detail=f"File '{file.filename}' too large. Maximum size: {file_size_limit // (1024*1024)}MB",
                    )

                buffer.write(content)

            logger.info(
                f"File uploaded successfully: {unique_filename}, size: {len(content)} bytes"
            )

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error uploading file: {str(e)}")
            if os.path.exists(file_path):
                os.remove(file_path)
            raise HTTPException(
                status_code=500,
                detail=f"Could not upload file '{file.filename}': {str(e)}",
            )

        # Construct the full URL for the uploaded file
        base_url = os.getenv("BACKEND_URL", "http://localhost:8000")
        file_url = f"{base_url}/static/uploads/{unique_filename}"

        # Determine media type
        media_type = "image" if file.content_type in allowed_image_types else "video"

        uploaded_files.append(
            {
                "filename": unique_filename,
                "url": file_url,
                "type": media_type,
                "original_name": file.filename,
            }
        )

    logger.info(f"Upload completed successfully. Total files: {len(uploaded_files)}")
    return {"uploaded_files": uploaded_files}


# Keep the old single image upload for backward compatibility
@router.post("/api/upload-image")
async def upload_single_image(
    file: UploadFile = File(...), admin_id: int = Depends(get_current_admin)
):
    result = await upload_media([file], admin_id)
    if result["uploaded_files"]:
        return result["uploaded_files"][0]
    else:
        raise HTTPException(status_code=500, detail="Upload failed")
