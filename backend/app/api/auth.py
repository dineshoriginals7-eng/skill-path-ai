"""Authentication API Router.

Provides endpoints for user registration, login, token refresh, password reset,
and current user profile inspection.
"""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
import uuid
import logging

from app.db.database import get_db
from app.models.user import User
from app.models.learner_profile import LearnerProfile
from app.schemas.auth import (
    UserRegister,
    TokenResponse,
    ForgotPassword,
    ResetPassword,
    RefreshTokenRequest,
)
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
)
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserRegister,
    db: Session = Depends(get_db),
):
    """Register a new learner account, create an initial profile, and return JWT tokens."""
    email_clean = user_in.email.lower().strip()

    try:
        existing_user = db.query(User).filter(User.email == email_clean).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists.",
            )

        hashed_pw = get_password_hash(user_in.password)
        new_user = User(
            email=email_clean,
            hashed_password=hashed_pw,
            full_name=user_in.full_name.strip(),
            is_active=True,
            is_admin=(email_clean == settings.ADMIN_EMAIL.lower().strip()),
        )
        db.add(new_user)
        db.flush()

        # Create learner profile if it doesn't exist
        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == new_user.id).first()
        if not profile:
            profile = LearnerProfile(
                user_id=new_user.id,
                onboarding_step=1,
                onboarding_complete="false",
            )
            db.add(profile)

        db.commit()
        db.refresh(new_user)
        db.refresh(profile)

        role_val = new_user.role.value if hasattr(new_user.role, "value") else str(new_user.role)
        access_token = create_access_token(
            data={"sub": new_user.id, "email": new_user.email, "role": role_val}
        )
        refresh_token = create_refresh_token(data={"sub": new_user.id})

        is_onboarding_done = (
            profile.onboarding_complete.lower() == "true"
            if profile and profile.onboarding_complete
            else False
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_id=new_user.id,
            full_name=new_user.full_name,
            email=new_user.email,
            is_admin=new_user.is_admin,
            onboarding_complete=is_onboarding_done,
        )
    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        logger.error(f"User registration processing failed for '{email_clean}': {exc}", exc_info=True)
        err_msg = str(exc)
        if "readonly" in err_msg.lower() or "unable to open database" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database storage is temporarily read-only or initializing. Please retry.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration service encountered an error: {type(exc).__name__}",
        )


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    db: Session = Depends(get_db),
):
    """Authenticate user with email and password.

    Supports both application/json payloads and application/x-www-form-urlencoded
    (OAuth2 form data with username and password).
    """
    email: Optional[str] = None
    password: Optional[str] = None

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception as exc:
            logger.warning(f"Failed to parse JSON login body: {exc}")
    else:
        try:
            form = await request.form()
            email = form.get("username") or form.get("email")
            password = form.get("password")
        except Exception as exc:
            logger.warning(f"Failed to parse form login body: {exc}")

    # Fallback attempt if neither matched or extracted
    if not email or not password:
        try:
            body = await request.json()
            email = body.get("email") or body.get("username")
            password = body.get("password")
        except Exception:
            try:
                form = await request.form()
                email = form.get("username") or form.get("email")
                password = form.get("password")
            except Exception:
                pass

    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email/username and password are required.",
        )

    email_clean = str(email).lower().strip()

    try:
        user = db.query(User).filter(User.email == email_clean).first()

        if not user or not verify_password(str(password), user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your account has been deactivated. Please contact support.",
            )

        # Ensure profile exists
        profile = db.query(LearnerProfile).filter(LearnerProfile.user_id == user.id).first()
        if not profile:
            profile = LearnerProfile(
                user_id=user.id,
                onboarding_step=1,
                onboarding_complete="false",
            )
            db.add(profile)
            db.commit()
            db.refresh(profile)

        role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
        access_token = create_access_token(
            data={"sub": user.id, "email": user.email, "role": role_val}
        )
        refresh_token = create_refresh_token(data={"sub": user.id})

        is_onboarding_done = (
            profile.onboarding_complete.lower() == "true"
            if profile and profile.onboarding_complete
            else False
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user_id=user.id,
            full_name=user.full_name,
            email=user.email,
            is_admin=user.is_admin,
            onboarding_complete=is_onboarding_done,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.error(f"User login processing failed for '{email_clean}': {exc}", exc_info=True)
        err_msg = str(exc)
        if "readonly" in err_msg.lower() or "unable to open database" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database storage is temporarily read-only or initializing. Please retry.",
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login authentication failed: {type(exc).__name__}",
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    req: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """Validate refresh token and issue a new pair of access and refresh tokens."""
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )

    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive.",
        )

    profile = user.profile
    if not profile:
        profile = LearnerProfile(user_id=user.id, onboarding_step=1, onboarding_complete="false")
        db.add(profile)
        db.commit()
        db.refresh(profile)

    role_val = user.role.value if hasattr(user.role, "value") else str(user.role)
    new_access_token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": role_val}
    )
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    is_onboarding_done = (
        profile.onboarding_complete.lower() == "true"
        if profile and profile.onboarding_complete
        else False
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        is_admin=user.is_admin,
        onboarding_complete=is_onboarding_done,
    )


@router.post("/forgot-password")
async def forgot_password(
    req: ForgotPassword,
    db: Session = Depends(get_db),
):
    """Generate a password reset token and store it. Email dispatch is stubbed."""
    email_clean = req.email.lower().strip()
    user = db.query(User).filter(User.email == email_clean).first()

    if user:
        reset_token = str(uuid.uuid4())
        user.reset_token = reset_token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        logger.info(
            f"[EMAIL STUB] Password reset token for {user.email}: {reset_token}. "
            f"Expiry: {user.reset_token_expiry}"
        )

    return {
        "message": "If this email address is registered, a password reset link has been dispatched."
    }


@router.post("/reset-password")
async def reset_password(
    req: ResetPassword,
    db: Session = Depends(get_db),
):
    """Validate reset token and update user password."""
    user = db.query(User).filter(User.reset_token == req.token).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or unrecognised reset token.",
        )

    if user.reset_token_expiry and user.reset_token_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset token has expired. Please request a new reset link.",
        )

    user.hashed_password = get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()

    return {"message": "Password has been successfully updated. You may now log in."}


@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """Return currently authenticated user information and profile status."""
    profile = current_user.profile
    is_onboarding_done = (
        profile.onboarding_complete.lower() == "true"
        if profile and profile.onboarding_complete
        else False
    )
    role_val = (
        current_user.role.value
        if hasattr(current_user.role, "value")
        else str(current_user.role)
    )

    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": role_val,
        "is_active": current_user.is_active,
        "is_admin": current_user.is_admin,
        "is_verified": current_user.is_verified,
        "onboarding_complete": is_onboarding_done,
        "onboarding_step": profile.onboarding_step if profile else 1,
        "created_at": current_user.created_at,
    }
