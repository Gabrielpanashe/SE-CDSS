"""
Authentication routes: register, login, me.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.auth_utils import create_token, get_current_user, hash_password, verify_password
from src.database.db import User, get_db

router = APIRouter(prefix="/auth", tags=["auth"])


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str
    patient_id: str | None = None


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    role: str
    email: str
    patient_id: str | None = None


class MeResponse(BaseModel):
    email: str
    role: str
    patient_id: str | None = None


@router.post("/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    if body.role not in ("patient", "clinician"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Role must be 'patient' or 'clinician'.")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status.HTTP_409_CONFLICT, "Email already registered.")
    user = User(
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
        patient_id=body.patient_id,
    )
    db.add(user)
    db.commit()
    return {"message": "Account created successfully."}


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid email or password.")
    token = create_token({"sub": str(user.id), "role": user.role, "email": user.email})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role,
        email=user.email,
        patient_id=user.patient_id,
    )


@router.get("/user-by-patient/{patient_id}")
def get_user_by_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    if current_user.role != "clinician":
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Clinicians only.")
    user = db.query(User).filter(User.patient_id == patient_id).first()
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No registered user found for that patient ID.")
    return {"user_id": user.id, "patient_id": user.patient_id}


@router.get("/me", response_model=MeResponse)
def me(current_user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        email=current_user.email,
        role=current_user.role,
        patient_id=current_user.patient_id,
    )
