import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from jinja2 import Template, Environment, FileSystemLoader
from pathlib import Path
from ..models.config import Environment as EnvEnum
from .database import db_service

class ConfigGeneratorService:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent
        self.generated_dir = self.base_dir / "generated_configs"
        self.templates_dir = self.base_dir / "app" / "templates"
        
        # Create directories if they don't exist
        self.generated_dir.mkdir(exist_ok=True)
        self.templates_dir.mkdir(exist_ok=True)
        
        # Initialize Jinja2 environment
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=False,
            trim_blocks=True,
            lstrip_blocks=True
        )
    
    async def generate_configuration(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate configuration file from template"""
        try:
            environment = request_data["environment"]
            filename = request_data["filename"]
            parameters = request_data["parameters"]
            template_type = request_data.get("template_type", "application")
            
            # Get template from database
            template_data = await db_service.get_template(environment, template_type)
            if not template_data:
                raise ValueError(f"No template found for environment {environment} and type {template_type}")
            
            # Generate file content using Jinja2
            template_content = template_data["template_content"]
            template = Template(template_content)
            file_content = template.render(**parameters)
            
            # Create environment directory
            env_dir = self.generated_dir / environment
            env_dir.mkdir(exist_ok=True)
            
            # Generate file path
            file_extension = self._get_file_extension(template_type)
            file_path = env_dir / f"{filename}{file_extension}"
            
            # Write file
            with open(file_path, 'w') as f:
                f.write(file_content)
            
            # Prepare response data
            config_id = str(uuid.uuid4())
            response_data = {
                "id": config_id,
                "environment": environment,
                "filename": filename,
                "file_path": str(file_path),
                "parameters": parameters,
                "created_at": datetime.utcnow(),
                "status": "success"
            }
            
            # Save to database
            db_data = {
                "_id": config_id,
                "environment": environment,
                "filename": filename,
                "file_path": str(file_path),
                "parameters": parameters,
                "template_type": template_type,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            await db_service.save_configuration(db_data)
            
            return response_data
            
        except Exception as e:
            raise Exception(f"Failed to generate configuration: {str(e)}")
    
    def _get_file_extension(self, template_type: str) -> str:
        """Get file extension based on template type"""
        extensions = {
            "application": ".conf",
            "database": ".db.conf",
            "logging": ".log.conf",
            "security": ".sec.conf"
        }
        return extensions.get(template_type, ".conf")
    
    async def get_template_info(self, environment: str, template_type: str = "application") -> Dict[str, Any]:
        """Get template information and required parameters"""
        template_data = await db_service.get_template(environment, template_type)
        if not template_data:
            raise ValueError(f"No template found for environment {environment} and type {template_type}")
        
        # Extract parameters from template content
        template_content = template_data["template_content"]
        parameters = self._extract_parameters_from_template(template_content)
        
        return {
            "environment": environment,
            "template_type": template_type,
            "parameters": parameters,
            "template_content": template_content
        }
    
    def _extract_parameters_from_template(self, template_content: str) -> list:
        """Extract parameter names from Jinja2 template"""
        import re
        
        # Find all {{ variable }} patterns
        pattern = r'\{\{\s*(\w+)\s*\}\}'
        matches = re.findall(pattern, template_content)
        
        # Remove duplicates and create parameter objects
        unique_params = list(set(matches))
        parameters = []
        
        for param in unique_params:
            # Skip Jinja2 built-in variables
            if param not in ['config', 'request', 'session', 'g']:
                parameters.append({
                    "key": param,
                    "type": "string",
                    "required": True,
                    "description": f"Parameter: {param}"
                })
        
        return parameters
    
    async def get_available_environments(self) -> list:
        """Get list of available environments"""
        return [env.value for env in EnvEnum]
    
    async def get_available_templates(self) -> list:
        """Get list of available templates"""
        templates = await db_service.get_all_templates()
        return [
            {
                "environment": template["environment"],
                "template_type": template["template_type"]
            }
            for template in templates
        ]
    
    async def validate_parameters(self, environment: str, template_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """Validate parameters against template requirements"""
        template_info = await self.get_template_info(environment, template_type)
        required_params = [p["key"] for p in template_info["parameters"] if p["required"]]
        
        missing_params = [param for param in required_params if param not in parameters]
        
        if missing_params:
            return {
                "valid": False,
                "missing_parameters": missing_params,
                "message": f"Missing required parameters: {', '.join(missing_params)}"
            }
        
        return {
            "valid": True,
            "message": "All required parameters provided"
        }

# Global config generator service instance
config_generator = ConfigGeneratorService() 