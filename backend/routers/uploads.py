import os
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from typing import List

from core import STATIC_DIR, get_current_admin


router = APIRouter()


@router.post("/api/upload-media")
async def upload_media(
    files: List[UploadFile] = File(...), admin_id: int = Depends(get_current_admin)
):
    upload_dir = os.path.join(STATIC_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    uploaded_files = []
    allowed_image_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    allowed_video_types = [
        "video/mp4",
        "video/webm",
        "video/ogg",
        "video/avi",
        "video/mov",
    ]

    for file in files:
        # Check file type
        if file.content_type not in allowed_image_types + allowed_video_types:
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

        file_extension = file.filename.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(upload_dir, unique_filename)

        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)

            # Get file size after upload
            file_size = os.path.getsize(file_path)
            if file_size > file_size_limit:
                os.remove(file_path)  # Remove the file
                raise HTTPException(
                    status_code=400,
                    detail=f"File too large. Maximum size: {file_size_limit // (1024*1024)}MB",
                )

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Could not upload file: {e}")
        finally:
            file.file.close()

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
