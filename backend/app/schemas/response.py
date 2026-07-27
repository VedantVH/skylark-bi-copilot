from pydantic import BaseModel
from typing import Optional, Dict, Any, List


class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = "default"


class ChatResponse(BaseModel):
    answer: str
    summary: Dict[str, Any]
    insights: List[str]
    risks: List[str]
    recommendations: List[str]
    tool_used: Optional[str] = "overview"
    tool_data: Optional[Any] = None