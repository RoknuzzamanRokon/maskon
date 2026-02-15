from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException

from core import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    Token,
    UserLogin,
    UserRegister,
    create_access_token,
    get_current_user,
    get_db_connection,
    verify_password,
)


router = APIRouter()


# Registration disabled - Admin only system
@router.post("/api/register", response_model=dict)
async def register(user: UserRegister):
    raise HTTPException(
        status_code=403,
        detail="Registration is disabled. This is an admin-only system.",
    )


@router.options("/api/login")
async def login_options():
    return {"message": "OK"}


@router.post("/api/login", response_model=Token)
async def login(user: UserLogin):
    print(f"Login attempt for username: {user.username}")
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, password_hash, is_admin FROM users WHERE username = %s",
            (user.username,),
        )
        db_user = cursor.fetchone()
        print(f"User found in database: {db_user is not None}")

        if not db_user:
            print("User not found in database")
            raise HTTPException(status_code=401, detail="Invalid username or password")

        password_valid = verify_password(user.password, db_user["password_hash"])
        print(f"Password valid: {password_valid}")

        if not password_valid:
            print("Password verification failed")
            raise HTTPException(status_code=401, detail="Invalid username or password")

        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(db_user["id"])}, expires_delta=access_token_expires
        )

        print("Login successful, returning token")
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": db_user["id"],
            "username": db_user["username"],
            "is_admin": db_user["is_admin"],
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    finally:
        cursor.close()
        connection.close()


@router.get("/api/me")
async def get_current_user_info(user_id: int = Depends(get_current_user)):
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, email, is_admin FROM users WHERE id = %s",
            (user_id,),
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    finally:
        cursor.close()
        connection.close()


@router.get("/api/debug/auth")
async def debug_auth_info(user_id: int = Depends(get_current_user)):
    """Debug endpoint to check authentication status"""
    connection = get_db_connection()
    cursor = connection.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT id, username, email, is_admin FROM users WHERE id = %s",
            (user_id,),
        )
        user = cursor.fetchone()
        return {
            "authenticated": True,
            "user_id": user_id,
            "user_info": user,
            "is_admin": user["is_admin"] if user else False,
            "timestamp": datetime.utcnow().isoformat(),
        }
    finally:
        cursor.close()
        connection.close()
