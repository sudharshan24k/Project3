import os
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from jinja2 import Template, Environment, FileSystemLoader
from pathlib import Path
from ..models.config import Environment as EnvEnum

class ConfigGeneratorService:
    def __init__(self):
        self.base_dir = Path(__file__).parent.parent.parent
        self.generated_dir = self.base_dir / "generated_configs"
        self.templates_dir = self.base_dir / "app" / "templates"
        self.generated_dir.mkdir(exist_ok=True)
        self.templates_dir.mkdir(exist_ok=True)
        self.jinja_env = Environment(
            loader=FileSystemLoader(str(self.templates_dir)),
            autoescape=False,
            trim_blocks=True,
            lstrip_blocks=True
        )

    async def generate_configuration(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            environment = request_data["environment"]
            filename = request_data["filename"]
            parameters = request_data["parameters"]
            template_type = request_data.get("template_type", "application")

            # Use static template content (no DB)
            template_content = self._get_static_template(environment, template_type)
            if not template_content:
                raise ValueError(f"No template found for environment {environment} and type {template_type}")

            template = Template(template_content)
            file_content = template.render(**parameters)
            env_dir = self.generated_dir / environment
            env_dir.mkdir(exist_ok=True)
            file_extension = self._get_file_extension(template_type)
            file_path = env_dir / f"{filename}{file_extension}"
            with open(file_path, 'w') as f:
                f.write(file_content)
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
            return response_data
        except Exception as e:
            raise Exception(f"Failed to generate configuration: {str(e)}")

    def _get_file_extension(self, template_type: str) -> str:
        extensions = {
            "application": ".conf",
            "database": ".db.conf",
            "logging": ".log.conf",
            "security": ".sec.conf"
        }
        return extensions.get(template_type, ".conf")

    def _get_static_template(self, environment: str, template_type: str) -> Optional[str]:
        # Example static templates (expand as needed)
        templates = {
            ("UAT", "application"): """# UAT Application Configuration\n[Application]\nname = {{ application_name }}\nversion = {{ version }}\ndebug = {{ debug_mode }}\n\n[Database]\nhost = {{ db_host }}\nport = {{ db_port }}\ndatabase = {{ db_name }}\nusername = {{ db_username }}\n\n[Logging]\nlevel = {{ log_level }}\nfile_path = {{ log_file_path }}\n\n[Features]\nfeature_flag_1 = {{ feature_flag_1 }}\nfeature_flag_2 = {{ feature_flag_2 }}""",
            ("PROD", "application"): """# Production Application Configuration\n[Application]\nname = {{ application_name }}\nversion = {{ version }}\ndebug = false\n\n[Database]\nhost = {{ db_host }}\nport = {{ db_port }}\ndatabase = {{ db_name }}\nusername = {{ db_username }}\n\n[Logging]\nlevel = {{ log_level }}\nfile_path = {{ log_file_path }}\n\n[Security]\nssl_enabled = true\nencryption_level = high\n\n[Features]\nfeature_flag_1 = {{ feature_flag_1 }}\nfeature_flag_2 = {{ feature_flag_2 }}""",
            ("COB", "application"): """# Close of Business Configuration\n[Application]\nname = {{ application_name }}\nversion = {{ version }}\ndebug = {{ debug_mode }}\n\n[Database]\nhost = {{ db_host }}\nport = {{ db_port }}\ndatabase = {{ db_name }}\nusername = {{ db_username }}\n\n[Logging]\nlevel = {{ log_level }}\nfile_path = {{ log_file_path }}\n\n[COB_Settings]\nbatch_processing = true\nbackup_enabled = {{ backup_enabled }}\ncleanup_old_data = {{ cleanup_old_data }}\n\n[Features]\nfeature_flag_1 = {{ feature_flag_1 }}\nfeature_flag_2 = {{ feature_flag_2 }}"""
        }
        return templates.get((environment, template_type))

    async def get_template_info(self, environment: str, template_type: str = "application") -> Dict[str, Any]:
        template_content = self._get_static_template(environment, template_type)
        if not template_content:
            raise ValueError(f"No template found for environment {environment} and type {template_type}")
        parameters = self._extract_parameters_from_template(template_content)
        return {
            "environment": environment,
            "template_type": template_type,
            "parameters": parameters,
            "template_content": template_content
        }

    def _extract_parameters_from_template(self, template_content: str) -> list:
        import re
        pattern = r'\{\{\s*(\w+)\s*\}\}'
        matches = re.findall(pattern, template_content)
        unique_params = list(set(matches))
        parameters = []
        for param in unique_params:
            if param not in ['config', 'request', 'session', 'g']:
                parameters.append({
                    "key": param,
                    "type": "string",
                    "required": True,
                    "description": f"Parameter: {param}"
                })
        return parameters

    async def get_available_environments(self) -> list:
        return [env.value for env in EnvEnum]

    async def get_available_templates(self) -> list:
        # Return static template info
        return [
            {"environment": "UAT", "template_type": "application"},
            {"environment": "PROD", "template_type": "application"},
            {"environment": "COB", "template_type": "application"}
        ]

config_generator = ConfigGeneratorService() 