from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Dict, Any

from .models.config import (
    ConfigurationRequest, 
    ConfigurationResponse, 
    TemplateInfo,
    ErrorResponse,
    Environment
)
from .services.config_generator import config_generator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # No DB startup
    print("Application startup complete")
    yield
    print("Application shutdown complete")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

@app.post("/generate", response_model=ConfigurationResponse)
async def generate_config(request: ConfigurationRequest):
    try:
        result = await config_generator.generate_configuration(request.dict())
        return ConfigurationResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/template-info", response_model=TemplateInfo)
async def get_template_info(environment: Environment, template_type: str = "application"):
    try:
        info = await config_generator.get_template_info(environment, template_type)
        return TemplateInfo(
            environment=info["environment"],
            template_type=info["template_type"],
            parameters=info["parameters"]
        )
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@app.get("/environments", response_model=List[str])
async def get_environments():
    return await config_generator.get_available_environments()

@app.get("/templates", response_model=List[Dict[str, str]])
async def get_templates():
    return await config_generator.get_available_templates()

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "details": str(exc)}
    )

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 