from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum

class Environment(str, Enum):
    UAT = "UAT"
    PROD = "PROD"
    COB = "COB"

class ConfigParameter(BaseModel):
    key: str = Field(..., description="Parameter key")
    value: Any = Field(..., description="Parameter value")
    type: str = Field(default="string", description="Parameter type (string, number, boolean)")
    required: bool = Field(default=True, description="Whether parameter is required")

class ConfigurationRequest(BaseModel):
    environment: Environment = Field(..., description="Target environment")
    filename: str = Field(..., min_length=1, max_length=100, description="Configuration file name")
    parameters: Dict[str, Any] = Field(..., description="Configuration parameters")
    template_type: str = Field(default="application", description="Template type to use")

class ConfigurationResponse(BaseModel):
    id: str = Field(..., description="Configuration ID")
    environment: Environment = Field(..., description="Target environment")
    filename: str = Field(..., description="Configuration file name")
    file_path: str = Field(..., description="Generated file path")
    parameters: Dict[str, Any] = Field(..., description="Configuration parameters")
    created_at: datetime = Field(..., description="Creation timestamp")
    status: str = Field(default="success", description="Generation status")

class TemplateInfo(BaseModel):
    environment: Environment = Field(..., description="Environment")
    template_type: str = Field(..., description="Template type")
    parameters: List[ConfigParameter] = Field(..., description="Required parameters for this template")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error message")
    details: Optional[str] = Field(None, description="Error details") 