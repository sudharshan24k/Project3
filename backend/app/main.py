from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
from typing import List, Dict, Any

from .models.config import (
    ConfigurationRequest, 
    ConfigurationResponse, 
    ConfigurationHistory,
    TemplateInfo,
    ErrorResponse,
    Environment
)
from .services.database import db_service
from .services.config_generator import config_generator

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db_service.connect()
    print("Application startup complete")
    yield
    # Shutdown
    await db_service.disconnect()
    print("Application shutdown complete")

app = FastAPI(
    title="Configuration File Generator API",
    description="API for generating configuration files from templates",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200", "http://127.0.0.1:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/", response_model=Dict[str, str])
async def root():
    """Root endpoint"""
    return {"message": "Configuration File Generator API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "database": "connected"}

@app.get("/environments", response_model=List[str])
async def get_environments():
    """Get available environments"""
    try:
        environments = await config_generator.get_available_environments()
        return environments
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/templates", response_model=List[Dict[str, str]])
async def get_templates():
    """Get available templates"""
    try:
        templates = await config_generator.get_available_templates()
        return templates
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/templates/{environment}", response_model=TemplateInfo)
async def get_template_info(environment: Environment, template_type: str = "application"):
    """Get template information and required parameters for an environment"""
    try:
        template_info = await config_generator.get_template_info(environment.value, template_type)
        return TemplateInfo(**template_info)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validate", response_model=Dict[str, Any])
async def validate_parameters(request: ConfigurationRequest):
    """Validate parameters against template requirements"""
    try:
        validation_result = await config_generator.validate_parameters(
            request.environment.value,
            request.template_type,
            request.parameters
        )
        return validation_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate", response_model=ConfigurationResponse)
async def generate_configuration(request: ConfigurationRequest):
    """Generate configuration file from template"""
    try:
        # Validate parameters first
        validation_result = await config_generator.validate_parameters(
            request.environment.value,
            request.template_type,
            request.parameters
        )
        
        if not validation_result["valid"]:
            raise HTTPException(
                status_code=400, 
                detail=validation_result["message"]
            )
        
        # Generate configuration
        request_data = {
            "environment": request.environment.value,
            "filename": request.filename,
            "parameters": request.parameters,
            "template_type": request.template_type
        }
        
        result = await config_generator.generate_configuration(request_data)
        return ConfigurationResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/configurations", response_model=List[ConfigurationHistory])
async def get_configurations(environment: str = None, limit: int = 50):
    """Get configuration history"""
    try:
        if environment:
            configurations = await db_service.get_configurations_by_environment(environment, limit)
        else:
            configurations = await db_service.get_all_configurations(limit)
        
        # Convert ObjectId to string for JSON serialization
        for config in configurations:
            config["id"] = str(config["_id"])
            del config["_id"]
        
        return [ConfigurationHistory(**config) for config in configurations]
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/configurations/{config_id}", response_model=ConfigurationHistory)
async def get_configuration(config_id: str):
    """Get specific configuration by ID"""
    try:
        configuration = await db_service.get_configuration_by_id(config_id)
        if not configuration:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        # Convert ObjectId to string
        configuration["id"] = str(configuration["_id"])
        del configuration["_id"]
        
        return ConfigurationHistory(**configuration)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/configurations/{config_id}")
async def delete_configuration(config_id: str):
    """Delete configuration by ID"""
    try:
        success = await db_service.delete_configuration(config_id)
        if not success:
            raise HTTPException(status_code=404, detail="Configuration not found")
        
        return {"message": "Configuration deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
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