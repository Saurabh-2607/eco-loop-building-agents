from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar("T")

class StandardSuccessResponse(BaseModel, Generic[T]):
    success: bool = True
    data: Optional[T] = None
    message: str = "Operation completed successfully"

class StandardErrorDetail(BaseModel):
    code: str
    message: str

class StandardErrorResponse(BaseModel):
    success: bool = False
    error: StandardErrorDetail
